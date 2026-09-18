namespace Stokk.Api.Models.DTOs;

// Authentication DTOs
public record LoginRequest(string Username, string Password);

public record RegisterRequest(
    string FirstName,
    string LastName,
    string Username,
    string Password,
    string Email,
    string Phone,
    string City,
    string CompanyMode, // "existing" | "new"
    string? ExistingCompanyId,
    string? NewCompanyName,
    string? NewCompanyTaxNumber
);

public record AuthResponse(
    bool Success,
    string Message,
    string? UserId = null,
    string? Username = null,
    string? FullName = null,
    string? Role = null,
    string? CompanyId = null,
    string? CompanyName = null
);

// Order DTOs
public record CreateOrderItemDto(
    string ProductId,
    string ProductCode,
    string ProductName,
    int Quantity,
    decimal UnitPrice
);

public record CreateOrderRequest(
    string UserId,
    string PaymentMethod, // Nakit | Çek | Bakiye
    string Notes,
    List<CreateOrderItemDto> Items
);

public record UpdateOrderStatusRequest(string NewStatus);

// Product DTOs
public record CreateProductRequest(
    string ProductCode,
    string Name,
    string Brand,
    string Description,
    string ManufacturerCode,
    string Manufacturer,
    string SpecialCode1,
    string SpecialCode2,
    string Image,
    int Stock,
    int CriticalStockThreshold,
    decimal Price
);

public record UpdateStockRequest(int Delta, string Note, string PerformedBy);

// Cart DTOs
public record AddToCartRequest(
    string UserId,
    string ProductId,
    string ProductCode,
    string ProductName,
    string? Image,
    decimal UnitPrice,
    int Quantity
);

public record UpdateCartQtyRequest(int Quantity);

public record UpdateUserRequest(
    string FirstName,
    string LastName,
    string Email,
    string Phone,
    string? City,
    string? CompanyId,
    string? CompanyName,
    string? Role,
    string? Password
);

public record UpdateProductRequest(
    string ProductCode,
    string Name,
    string Brand,
    string Description,
    string ManufacturerCode,
    string Manufacturer,
    string SpecialCode1,
    string SpecialCode2,
    string Image,
    int Stock,
    int CriticalStockThreshold,
    decimal Price
);
