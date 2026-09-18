using System.Text.Json.Serialization;

namespace Stokk.Api.Models.Entities;

public class Product
{
    public string Id { get; set; } = string.Empty;
    public string ProductCode { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string ManufacturerCode { get; set; } = string.Empty;
    public string Manufacturer { get; set; } = string.Empty;
    public string SpecialCode1 { get; set; } = string.Empty;
    public string SpecialCode2 { get; set; } = string.Empty;
    public string Image { get; set; } = string.Empty;
    public int Stock { get; set; } = 0;
    public int CriticalStockThreshold { get; set; } = 5; // Custom stock color threshold (0 = Red, <= Threshold = Yellow, > Threshold = Green)
    public decimal Price { get; set; } = 0;
    public string CreatedAt { get; set; } = DateTime.UtcNow.ToString("dd.MM.yyyy");

    [JsonIgnore]
    public List<StockHistoryLog> StockLogs { get; set; } = new();
}
