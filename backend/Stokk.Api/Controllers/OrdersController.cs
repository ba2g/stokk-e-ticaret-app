using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Stokk.Api.Data;
using Stokk.Api.Models.DTOs;
using Stokk.Api.Models.Entities;

namespace Stokk.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly StokkDbContext _context;

    public OrdersController(StokkDbContext context)
    {
        _context = context;
    }

    // Microservice User Isolation:
    // If userId query param is provided, returns ONLY that user's orders (e.g. Ayşe cannot see Veli's orders).
    // If not provided (Admin mode), returns all orders.
    [HttpGet]
    public async Task<IActionResult> GetOrders([FromQuery] string? userId)
    {
        var query = _context.Orders.Include(o => o.Items).AsQueryable();

        if (!string.IsNullOrWhiteSpace(userId))
        {
            query = query.Where(o => o.UserId == userId);
        }

        var orders = await query.OrderByDescending(o => o.OrderDate).ToListAsync();
        return Ok(orders);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id)
    {
        var order = await _context.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == id || o.OrderNo == id);

        if (order == null) return NotFound(new { message = "Sipariş bulunamadı." });
        return Ok(order);
    }

    // Create Order with Payment Method (Nakit, Çek, Bakiye), stock deduction, and cart cleanup
    [HttpPost]
    public async Task<IActionResult> CreateOrder([FromBody] CreateOrderRequest req)
    {
        var user = await _context.Users.FindAsync(req.UserId);
        if (user == null) return NotFound(new { message = "Siparişi veren kullanıcı bulunamadı." });

        if (req.Items == null || req.Items.Count == 0)
        {
            return BadRequest(new { message = "Siparişte en az bir ürün bulunmalıdır." });
        }

        // Validate payment method
        var allowedPayments = new[] { "Nakit", "Çek", "Bakiye" };
        var paymentMethod = allowedPayments.Contains(req.PaymentMethod) ? req.PaymentMethod : "Nakit";

        string orderId = $"ord-{DateTime.UtcNow.Ticks.ToString()[^6..]}";
        string orderNo = $"SIP-2026-{DateTime.UtcNow.Ticks.ToString()[^4..]}";

        var order = new CustomerOrder
        {
            Id = orderId,
            OrderNo = orderNo,
            UserId = user.Id,
            UserName = $"{user.FirstName} {user.LastName}",
            CompanyName = user.CompanyName,
            OrderDate = DateTime.UtcNow.ToString("dd.MM.yyyy HH:mm"),
            Status = "Hazırlanıyor",
            PaymentMethod = paymentMethod,
            Notes = req.Notes ?? string.Empty,
            TotalAmount = req.Items.Sum(i => i.Quantity * i.UnitPrice)
        };

        // Populate order items and deduct stock
        foreach (var item in req.Items)
        {
            order.Items.Add(new OrderItem
            {
                OrderId = orderId,
                ProductId = item.ProductId,
                ProductCode = item.ProductCode,
                ProductName = item.ProductName,
                Quantity = item.Quantity,
                UnitPrice = item.UnitPrice,
                TotalPrice = item.Quantity * item.UnitPrice
            });

            // Stock reduction
            var product = await _context.Products.FindAsync(item.ProductId);
            if (product != null)
            {
                int prevStock = product.Stock;
                product.Stock = Math.Max(0, product.Stock - item.Quantity);

                _context.StockLogs.Add(new StockHistoryLog
                {
                    ProductId = product.Id,
                    ActionType = "Sipariş Satışı",
                    ChangeAmount = -item.Quantity,
                    PreviousStock = prevStock,
                    NewStock = product.Stock,
                    Note = $"#{orderNo} no'lu sipariş oluşturuldu ({paymentMethod} ile ödendi).",
                    PerformedBy = user.Username
                });
            }
        }

        // Clean user's cart
        var userCartItems = await _context.CartItems.Where(ci => ci.UserId == user.Id).ToListAsync();
        if (userCartItems.Any())
        {
            _context.CartItems.RemoveRange(userCartItems);
        }

        await _context.Orders.AddAsync(order);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = order.Id }, order);
    }

    // State Machine for Order Status Updates
    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateStatus(string id, [FromBody] UpdateOrderStatusRequest req)
    {
        var order = await _context.Orders.FindAsync(id);
        if (order == null) return NotFound(new { message = "Sipariş bulunamadı." });

        string current = order.Status;
        string target = req.NewStatus;

        // Terminal state checks
        if (current == "Teslim Edildi")
        {
            return BadRequest(new { message = "Teslim edilmiş bir siparişin durumu değiştirilemez." });
        }

        if (current == "Reddedildi")
        {
            return BadRequest(new { message = "Reddedilmiş bir siparişin durumu değiştirilemez." });
        }

        // State Transition Rules
        if (current == "Hazırlanıyor")
        {
            if (target != "Onaylandı" && target != "Reddedildi")
            {
                return BadRequest(new { message = "'Hazırlanıyor' durumundaki sipariş yalnızca 'Onaylandı' veya 'Reddedildi' yapılabilir." });
            }
        }
        else if (current == "Onaylandı")
        {
            if (target != "Yolda")
            {
                return BadRequest(new { message = "Onaylanan bir sipariş reddedilemez; yalnızca 'Yolda' olarak güncellenebilir." });
            }
        }
        else if (current == "Yolda")
        {
            if (target != "Teslim Edildi")
            {
                return BadRequest(new { message = "Yoldaki sipariş yalnızca 'Teslim Edildi' durumuna geçirilebilir." });
            }
        }

        order.Status = target;
        await _context.SaveChangesAsync();

        return Ok(new { message = $"Sipariş #{order.OrderNo} durumu '{target}' olarak güncellendi.", order });
    }
}
