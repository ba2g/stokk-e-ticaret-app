using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Stokk.Erp.Api.Models
{
    [Table("Products")]
    public class Product
    {
        [Key]
        [MaxLength(50)]
        public string ProductId { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string ProductCode { get; set; } = string.Empty;

        [Required]
        [MaxLength(200)]
        public string ProductName { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string Brand { get; set; } = "Stokk Collection";

        [Required]
        [MaxLength(200)]
        public string Manufacturer { get; set; } = "Stokk Tekstil San. Tic. A.Ş.";

        [Required]
        [MaxLength(100)]
        public string Category { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string ProductType { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string Season { get; set; } = string.Empty;

        public string? Description { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal B2BWholesalePrice { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal RetailPrice { get; set; }

        [MaxLength(10)]
        public string Currency { get; set; } = "TRY";

        [MaxLength(500)]
        public string? ImageUrl { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public ICollection<ProductVariant> Variants { get; set; } = new List<ProductVariant>();
    }

    [Table("ProductVariants")]
    public class ProductVariant
    {
        [Key]
        [MaxLength(100)]
        public string VariantId { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string ProductId { get; set; } = string.Empty;

        [Required]
        [MaxLength(80)]
        public string Sku { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string Barcode { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string Color { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        public string ColorHex { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        public string Size { get; set; } = string.Empty;

        [ForeignKey("ProductId")]
        public Product? Product { get; set; }

        public ICollection<InventoryStock> Stocks { get; set; } = new List<InventoryStock>();
    }

    [Table("StoreLocations")]
    public class StoreLocation
    {
        [Key]
        [MaxLength(50)]
        public string LocationId { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        public string LocationCode { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string LocationName { get; set; } = string.Empty;

        [Required]
        [MaxLength(30)]
        public string LocationType { get; set; } = "Mağaza";

        public bool IsActive { get; set; } = true;
    }

    [Table("InventoryStocks")]
    public class InventoryStock
    {
        [Key]
        public long StockId { get; set; }

        [Required]
        [MaxLength(100)]
        public string VariantId { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string LocationId { get; set; } = string.Empty;

        public int OnHand { get; set; } // Eldeki stok (Negatif değer ters bakiye)
        public int Reserved { get; set; } // Rezerve stok
        public int InTransit { get; set; } // Yoldaki stok
        public int MinThreshold { get; set; } = 5;

        public DateTime? LastAuditDate { get; set; }
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("VariantId")]
        public ProductVariant? Variant { get; set; }

        [ForeignKey("LocationId")]
        public StoreLocation? Location { get; set; }
    }

    [Table("StockTransfers")]
    public class StockTransfer
    {
        [Key]
        public long TransferId { get; set; }

        [Required]
        [MaxLength(50)]
        public string TransferCode { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string FromLocationId { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string ToLocationId { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string VariantId { get; set; } = string.Empty;

        public int Quantity { get; set; }

        [MaxLength(30)]
        public string TransferStatus { get; set; } = "InTransit";

        [MaxLength(100)]
        public string CreatedBy { get; set; } = "Admin";

        [MaxLength(500)]
        public string? Notes { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    [Table("InventoryAuditLogs")]
    public class InventoryAuditLog
    {
        [Key]
        public long LogId { get; set; }

        [Required]
        [MaxLength(100)]
        public string VariantId { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string LocationId { get; set; } = string.Empty;

        public int PreviousOnHand { get; set; }
        public int NewOnHand { get; set; }
        public int AdjustmentQuantity { get; set; }

        [MaxLength(200)]
        public string Reason { get; set; } = string.Empty;

        [MaxLength(100)]
        public string UpdatedBy { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    [Table("Customers")]
    public class Customer
    {
        [Key]
        [MaxLength(50)]
        public string CustomerId { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string FirstName { get; set; } = string.Empty; // Ad

        [Required]
        [MaxLength(100)]
        public string LastName { get; set; } = string.Empty; // Soyad

        [Required]
        [MaxLength(150)]
        public string Email { get; set; } = string.Empty; // E-posta

        [MaxLength(30)]
        public string? Phone { get; set; } // Telefon

        [Required]
        [MaxLength(50)]
        public string Username { get; set; } = string.Empty; // Kullanıcı Adı

        [Required]
        [MaxLength(256)]
        public string PasswordHash { get; set; } = string.Empty; // Şifre

        [MaxLength(50)]
        public string? City { get; set; }

        [MaxLength(500)]
        public string? Address { get; set; }

        [MaxLength(30)]
        public string Status { get; set; } = "Aktif";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<CustomerOrder> Orders { get; set; } = new List<CustomerOrder>();
    }

    [Table("CustomerOrders")]
    public class CustomerOrder
    {
        [Key]
        [MaxLength(50)]
        public string OrderId { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string OrderNo { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string CustomerId { get; set; } = string.Empty;

        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalAmount { get; set; }

        [MaxLength(30)]
        public string OrderStatus { get; set; } = "Hazırlanıyor";

        [MaxLength(30)]
        public string PaymentStatus { get; set; } = "Ödendi";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("CustomerId")]
        public Customer? Customer { get; set; }
    }
}
