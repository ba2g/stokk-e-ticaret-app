namespace Stokk.Api.Models.Entities;

public class CampaignSlide
{
    public string Id { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Subtitle { get; set; } = string.Empty;
    public string Badge { get; set; } = string.Empty;
    public string BadgeType { get; set; } = "discount"; // "discount" | "flash" | "new"
    public string Description { get; set; } = string.Empty;
    public string? ProductId { get; set; }
    public string ProductCode { get; set; } = string.Empty;
    public string Image { get; set; } = string.Empty;
    public decimal OriginalPrice { get; set; } = 0;
    public decimal DiscountedPrice { get; set; } = 0;
    public int DiscountPercent { get; set; } = 0;
    public int MinOrderQty { get; set; } = 1;
    public int AvailableStock { get; set; } = 0;
    public string ValidUntil { get; set; } = string.Empty;
    public string ActionLabel { get; set; } = "İncele";
    public bool IsActive { get; set; } = true;
}
