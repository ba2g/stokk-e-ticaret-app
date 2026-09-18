using System.Text.Json.Serialization;

namespace Stokk.Api.Models.Entities;

public class User
{
    public string Id { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Role { get; set; } = "Customer"; // "Admin" | "Customer"

    // Company connection (1-N Rule: User belongs to single company)
    public string? CompanyId { get; set; }
    [JsonIgnore]
    public Company? Company { get; set; }
    public string? CompanyName { get; set; }

    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string CreatedAt { get; set; } = DateTime.UtcNow.ToString("dd.MM.yyyy");

    // Microservice User Isolation Navigations
    [JsonIgnore]
    public List<CustomerOrder> Orders { get; set; } = new();
    [JsonIgnore]
    public List<CartItem> CartItems { get; set; } = new();
}
