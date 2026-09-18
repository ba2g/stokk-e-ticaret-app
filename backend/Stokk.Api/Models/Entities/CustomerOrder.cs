using System.Text.Json.Serialization;

namespace Stokk.Api.Models.Entities;

public class CustomerOrder
{
    public string Id { get; set; } = string.Empty;
    public string OrderNo { get; set; } = string.Empty;

    // Microservice User Isolation
    public string UserId { get; set; } = string.Empty;
    [JsonIgnore]
    public User? User { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string? CompanyName { get; set; }

    public string OrderDate { get; set; } = DateTime.UtcNow.ToString("dd.MM.yyyy HH:mm");

    // State Machine: Hazırlanıyor -> Onaylandı/Reddedildi -> Yolda -> Teslim Edildi
    public string Status { get; set; } = "Hazırlanıyor";

    // Payment Method: Nakit | Çek | Bakiye
    public string PaymentMethod { get; set; } = "Nakit";

    public decimal TotalAmount { get; set; } = 0;
    public string Notes { get; set; } = string.Empty;

    public List<OrderItem> Items { get; set; } = new();
}
