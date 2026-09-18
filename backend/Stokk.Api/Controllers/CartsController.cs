using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Stokk.Api.Data;
using Stokk.Api.Models.DTOs;
using Stokk.Api.Models.Entities;

namespace Stokk.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CartsController : ControllerBase
{
    private readonly StokkDbContext _context;

    public CartsController(StokkDbContext context)
    {
        _context = context;
    }

    // Microservice User Isolation: Returns only items in this user's cart
    [HttpGet("{userId}")]
    public async Task<IActionResult> GetUserCart(string userId)
    {
        var items = await _context.CartItems
            .Where(c => c.UserId == userId)
            .OrderByDescending(c => c.AddedAt)
            .ToListAsync();
        return Ok(items);
    }

    [HttpPost]
    public async Task<IActionResult> AddToCart([FromBody] AddToCartRequest req)
    {
        var existing = await _context.CartItems.FirstOrDefaultAsync(c =>
            c.UserId == req.UserId && c.ProductId == req.ProductId);

        if (existing != null)
        {
            existing.Quantity += req.Quantity;
            await _context.SaveChangesAsync();
            return Ok(existing);
        }

        var cartItem = new CartItem
        {
            UserId = req.UserId,
            ProductId = req.ProductId,
            ProductCode = req.ProductCode,
            ProductName = req.ProductName,
            Image = req.Image,
            UnitPrice = req.UnitPrice,
            Quantity = req.Quantity,
            AddedAt = DateTime.UtcNow.ToString("dd.MM.yyyy HH:mm")
        };

        await _context.CartItems.AddAsync(cartItem);
        await _context.SaveChangesAsync();

        return Ok(cartItem);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateQuantity(string id, [FromBody] UpdateCartQtyRequest req)
    {
        var item = await _context.CartItems.FindAsync(id);
        if (item == null) return NotFound(new { message = "Sepet kalemi bulunamadı." });

        if (req.Quantity <= 0)
        {
            _context.CartItems.Remove(item);
        }
        else
        {
            item.Quantity = req.Quantity;
        }

        await _context.SaveChangesAsync();
        return Ok(item);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> RemoveFromCart(string id)
    {
        var item = await _context.CartItems.FindAsync(id);
        if (item == null) return NotFound(new { message = "Sepet kalemi bulunamadı." });

        _context.CartItems.Remove(item);
        await _context.SaveChangesAsync();
        return Ok(new { message = "Ürün sepetten çıkarıldı." });
    }

    [HttpDelete("clear/{userId}")]
    public async Task<IActionResult> ClearCart(string userId)
    {
        var items = await _context.CartItems.Where(c => c.UserId == userId).ToListAsync();
        if (items.Any())
        {
            _context.CartItems.RemoveRange(items);
            await _context.SaveChangesAsync();
        }
        return Ok(new { message = "Sepet temizlendi." });
    }
}
