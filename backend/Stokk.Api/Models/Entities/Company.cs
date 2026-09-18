namespace Stokk.Api.Models.Entities;

public class Company
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string TaxNumber { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string CreatedAt { get; set; } = DateTime.UtcNow.ToString("dd.MM.yyyy");

    // 1-N Relationship: A company has many employee users, but each user belongs to exactly one company
    public List<User> Employees { get; set; } = new();
}
