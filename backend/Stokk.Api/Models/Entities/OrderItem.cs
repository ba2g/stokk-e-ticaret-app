using System.Text.Json.Serialization;

namespace Stokk.Api.Models.Entities;

public class OrderItem
{
    public string Id { get; set; } = Guid.NewGuid().ToString();

    public string OrderId { get; set; } = string.Empty;
    [JsonIgnore]
    public CustomerOrder? Order { get; set; }

    public string ProductId { get; set; } = string.Empty;
    public string ProductCode { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public int Quantity { get; set; } = 1;

    // Fixed price at the exact moment of order creation (unaffected by later price changes)
    public decimal UnitPrice { get; set; } = 0;
    public decimal TotalPrice { get; set; } = 0;
}
