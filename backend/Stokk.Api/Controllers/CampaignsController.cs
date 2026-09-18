using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Stokk.Api.Data;
using Stokk.Api.Models.Entities;

namespace Stokk.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CampaignsController : ControllerBase
{
    private readonly StokkDbContext _context;

    public CampaignsController(StokkDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var campaigns = await _context.Campaigns.ToListAsync();
        return Ok(campaigns);
    }

    [HttpGet("active")]
    public async Task<IActionResult> GetActive()
    {
        var campaigns = await _context.Campaigns.Where(c => c.IsActive).ToListAsync();
        return Ok(campaigns);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CampaignSlide slide)
    {
        if (string.IsNullOrWhiteSpace(slide.Id))
        {
            slide.Id = $"camp-{DateTime.UtcNow.Ticks.ToString()[^4..]}";
        }

        await _context.Campaigns.AddAsync(slide);
        await _context.SaveChangesAsync();
        return Ok(slide);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, [FromBody] CampaignSlide updated)
    {
        var existing = await _context.Campaigns.FindAsync(id);
        if (existing == null) return NotFound(new { message = "Kampanya bulunamadı." });

        existing.Title = updated.Title;
        existing.Subtitle = updated.Subtitle;
        existing.Badge = updated.Badge;
        existing.BadgeType = updated.BadgeType;
        existing.Description = updated.Description;
        existing.Image = updated.Image;
        existing.OriginalPrice = updated.OriginalPrice;
        existing.DiscountedPrice = updated.DiscountedPrice;
        existing.DiscountPercent = updated.DiscountPercent;
        existing.MinOrderQty = updated.MinOrderQty;
        existing.AvailableStock = updated.AvailableStock;
        existing.ValidUntil = updated.ValidUntil;
        existing.ActionLabel = updated.ActionLabel;
        existing.IsActive = updated.IsActive;

        await _context.SaveChangesAsync();
        return Ok(existing);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        var existing = await _context.Campaigns.FindAsync(id);
        if (existing == null) return NotFound(new { message = "Kampanya bulunamadı." });

        _context.Campaigns.Remove(existing);
        await _context.SaveChangesAsync();
        return Ok(new { message = "Kampanya silindi." });
    }
}
