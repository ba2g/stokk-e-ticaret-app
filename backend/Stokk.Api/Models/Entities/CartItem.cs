using System.Text.Json.Serialization;

namespace Stokk.Api.Models.Entities;

public class CartItem
{
    public string Id { get; set; } = Guid.NewGuid().ToString();

    // Microservice User-Isolation: Each user has their own independent cart
    public string UserId { get; set; } = string.Empty;
    [JsonIgnore]
    public User? User { get; set; }

    public string ProductId { get; set; } = string.Empty;
    public string ProductCode { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public string? Image { get; set; }
    public decimal UnitPrice { get; set; } = 0;
    public int Quantity { get; set; } = 1;
    public string AddedAt { get; set; } = DateTime.UtcNow.ToString("dd.MM.yyyy HH:mm");
}
