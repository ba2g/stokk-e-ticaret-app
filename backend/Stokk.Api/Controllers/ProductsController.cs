using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Stokk.Api.Data;
using Stokk.Api.Models.DTOs;
using Stokk.Api.Models.Entities;

namespace Stokk.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly StokkDbContext _context;

    public ProductsController(StokkDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var products = await _context.Products.OrderByDescending(p => p.CreatedAt).ToListAsync();
        return Ok(products);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id)
    {
        var product = await _context.Products
            .Include(p => p.StockLogs)
            .FirstOrDefaultAsync(p => p.Id == id || p.ProductCode == id);

        if (product == null) return NotFound(new { message = "Ürün bulunamadı." });
        return Ok(product);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateProductRequest req)
    {
        if (await _context.Products.AnyAsync(p => p.ProductCode == req.ProductCode))
        {
            return BadRequest(new { message = "Bu ürün kodu zaten mevcut." });
        }

        var product = new Product
        {
            Id = $"prod-{DateTime.UtcNow.Ticks.ToString()[^5..]}",
            ProductCode = req.ProductCode.Trim(),
            Name = req.Name.Trim(),
            Brand = req.Brand.Trim(),
            Description = req.Description,
            ManufacturerCode = req.ManufacturerCode,
            Manufacturer = req.Manufacturer,
            SpecialCode1 = req.SpecialCode1,
            SpecialCode2 = req.SpecialCode2,
            Image = req.Image,
            Stock = req.Stock,
            CriticalStockThreshold = req.CriticalStockThreshold > 0 ? req.CriticalStockThreshold : 5,
            Price = req.Price,
            CreatedAt = DateTime.UtcNow.ToString("dd.MM.yyyy")
        };

        // Add initial stock log
        if (product.Stock > 0)
        {
            product.StockLogs.Add(new StockHistoryLog
            {
                ProductId = product.Id,
                ActionType = "İlk Stok Girişi",
                ChangeAmount = product.Stock,
                PreviousStock = 0,
                NewStock = product.Stock,
                Note = "Ürün sisteme ilk eklenirken tanımlanan stok.",
                PerformedBy = "Batu Güdek"
            });
        }

        await _context.Products.AddAsync(product);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = product.Id }, product);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, [FromBody] UpdateProductRequest req)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null) return NotFound(new { message = "Ürün bulunamadı." });

        if (!string.IsNullOrWhiteSpace(req.ProductCode) && req.ProductCode.Trim() != product.ProductCode)
        {
            if (await _context.Products.AnyAsync(p => p.Id != id && p.ProductCode == req.ProductCode.Trim()))
            {
                return BadRequest(new { message = "Bu ürün kodu başka bir ürüne atanmış." });
            }
            product.ProductCode = req.ProductCode.Trim();
        }

        product.Name = req.Name.Trim();
        product.Brand = req.Brand.Trim();
        product.Description = req.Description;
        product.ManufacturerCode = req.ManufacturerCode;
        product.Manufacturer = req.Manufacturer;
        product.SpecialCode1 = req.SpecialCode1;
        product.SpecialCode2 = req.SpecialCode2;
        if (!string.IsNullOrWhiteSpace(req.Image)) product.Image = req.Image;
        product.Stock = req.Stock;
        product.CriticalStockThreshold = req.CriticalStockThreshold > 0 ? req.CriticalStockThreshold : 5;
        product.Price = req.Price;

        await _context.SaveChangesAsync();
        return Ok(new { message = $"'{product.Name}' ürünü güncellendi.", product });
    }

    [HttpPut("{id}/stock")]
    public async Task<IActionResult> UpdateStock(string id, [FromBody] UpdateStockRequest req)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null) return NotFound(new { message = "Ürün bulunamadı." });

        int previousStock = product.Stock;
        product.Stock = Math.Max(0, product.Stock + req.Delta);

        var log = new StockHistoryLog
        {
            ProductId = product.Id,
            ActionType = req.Delta >= 0 ? "Stok Artırımı" : "Stok Düşümü",
            ChangeAmount = req.Delta,
            PreviousStock = previousStock,
            NewStock = product.Stock,
            Note = req.Note,
            PerformedBy = req.PerformedBy
        };

        await _context.StockLogs.AddAsync(log);
        await _context.SaveChangesAsync();

        return Ok(new { product, log });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null) return NotFound(new { message = "Ürün bulunamadı." });

        _context.Products.Remove(product);
        await _context.SaveChangesAsync();
        return Ok(new { message = "Ürün silindi." });
    }
}
