using System.Text.Json.Serialization;

namespace Stokk.Api.Models.Entities;

public class StockHistoryLog
{
    public string Id { get; set; } = Guid.NewGuid().ToString();

    public string ProductId { get; set; } = string.Empty;
    [JsonIgnore]
    public Product? Product { get; set; }

    public string Timestamp { get; set; } = DateTime.UtcNow.ToString("dd.MM.yyyy HH:mm");
    public string ActionType { get; set; } = "Sipariş Satışı"; // Giriş, Çıkış, Düzeltme, Sipariş Satışı
    public int ChangeAmount { get; set; } = 0;
    public int PreviousStock { get; set; } = 0;
    public int NewStock { get; set; } = 0;
    public string Note { get; set; } = string.Empty;
    public string PerformedBy { get; set; } = "Sistem";
}
