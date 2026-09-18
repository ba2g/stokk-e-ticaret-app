using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Stokk.Erp.Api.Data;
using Stokk.Erp.Api.Models;

namespace Stokk.Erp.Api.Controllers
{
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
        public async Task<IActionResult> GetProducts([FromQuery] string? brand, [FromQuery] string? category, [FromQuery] string? search)
        {
            var query = _context.Products
                .Include(p => p.Variants)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(brand) && brand != "ALL")
            {
                query = query.Where(p => p.Brand == brand);
            }

            if (!string.IsNullOrWhiteSpace(category) && category != "TÜMÜ")
            {
                query = query.Where(p => p.Category == category);
            }

            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(p => p.ProductName.Contains(search) || p.ProductCode.Contains(search));
            }

            var products = await query.ToListAsync();
            return Ok(products);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetProductById(string id)
        {
            var product = await _context.Products
                .Include(p => p.Variants)
                    .ThenInclude(v => v.Stocks)
                .FirstOrDefaultAsync(p => p.ProductId == id);

            if (product == null) return NotFound(new { message = "Ürün bulunamadı." });

            return Ok(product);
        }

        [HttpPost]
        public async Task<IActionResult> CreateProduct([FromBody] Product product)
        {
            if (await _context.Products.AnyAsync(p => p.ProductCode == product.ProductCode))
            {
                return BadRequest(new { message = "Bu ürün kodu zaten mevcut." });
            }

            _context.Products.Add(product);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetProductById), new { id = product.ProductId }, product);
        }
    }
}
