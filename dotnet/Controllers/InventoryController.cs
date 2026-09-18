using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Stokk.Erp.Api.Data;
using Stokk.Erp.Api.Models;

namespace Stokk.Erp.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class InventoryController : ControllerBase
    {
        private readonly StokkDbContext _context;
        private readonly ILogger<InventoryController> _logger;

        public InventoryController(StokkDbContext context, ILogger<InventoryController> logger)
        {
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// Belirli bir mağaza veya tüm şubeler için envanter matrisini getirir
        /// </summary>
        [HttpGet("matrix")]
        public async Task<IActionResult> GetInventoryMatrix([FromQuery] string? locationId, [FromQuery] string? category)
        {
            var query = _context.Products
                .Include(p => p.Variants)
                    .ThenInclude(v => v.Stocks)
                .AsQueryable();

            if (!string.IsNullOrEmpty(category) && category != "TÜMÜ")
            {
                query = query.Where(p => p.Category == category);
            }

            var products = await query.ToListAsync();

            var matrixResult = products.Select(p => new
            {
                p.ProductId,
                p.ProductCode,
                p.ProductName,
                p.Brand,
                p.Category,
                p.ProductType,
                p.Season,
                p.B2BWholesalePrice,
                p.RetailPrice,
                p.ImageUrl,
                Variants = p.Variants.Select(v => {
                    var targetStock = !string.IsNullOrEmpty(locationId) 
                        ? v.Stocks.FirstOrDefault(s => s.LocationId == locationId)
                        : null;

                    var onHand = targetStock?.OnHand ?? v.Stocks.Sum(s => s.OnHand);
                    var reserved = targetStock?.Reserved ?? v.Stocks.Sum(s => s.Reserved);
                    var inTransit = targetStock?.InTransit ?? v.Stocks.Sum(s => s.InTransit);

                    return new
                    {
                        v.VariantId,
                        v.Sku,
                        v.Barcode,
                        v.Color,
                        v.ColorHex,
                        v.Size,
                        OnHand = onHand,
                        Reserved = reserved,
                        InTransit = inTransit,
                        Available = onHand - reserved,
                        IsNegative = onHand < 0
                    };
                })
            });

            return Ok(matrixResult);
        }

        /// <summary>
        /// Ters bakiye düzeltme veya fiziksel sayım fişi ile stok güncelleme
        /// </summary>
        [HttpPost("adjust-stock")]
        public async Task<IActionResult> AdjustStock([FromBody] StockAdjustmentRequest request)
        {
            var stock = await _context.InventoryStocks
                .FirstOrDefaultAsync(s => s.VariantId == request.VariantId && s.LocationId == request.LocationId);

            int previousQty = 0;

            if (stock == null)
            {
                stock = new InventoryStock
                {
                    VariantId = request.VariantId,
                    LocationId = request.LocationId,
                    OnHand = request.NewQuantity,
                    UpdatedAt = DateTime.UtcNow
                };
                _context.InventoryStocks.Add(stock);
            }
            else
            {
                previousQty = stock.OnHand;
                stock.OnHand = request.NewQuantity;
                stock.UpdatedAt = DateTime.UtcNow;
                stock.LastAuditDate = DateTime.UtcNow;
            }

            // Denetim İzi (Audit Log)
            var log = new InventoryAuditLog
            {
                VariantId = request.VariantId,
                LocationId = request.LocationId,
                PreviousOnHand = previousQty,
                NewOnHand = request.NewQuantity,
                AdjustmentQuantity = request.NewQuantity - previousQty,
                Reason = request.Reason,
                UpdatedBy = request.UpdatedBy ?? "Stokk Operator",
                CreatedAt = DateTime.UtcNow
            };

            _context.InventoryAuditLogs.Add(log);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, currentOnHand = stock.OnHand, logId = log.LogId });
        }
    }

    public class StockAdjustmentRequest
    {
        public string VariantId { get; set; } = string.Empty;
        public string LocationId { get; set; } = string.Empty;
        public int NewQuantity { get; set; }
        public string Reason { get; set; } = "Fiziksel Sayım";
        public string? UpdatedBy { get; set; }
    }
}
