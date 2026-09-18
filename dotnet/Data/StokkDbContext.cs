using Microsoft.EntityFrameworkCore;
using Stokk.Erp.Api.Models;

namespace Stokk.Erp.Api.Data
{
    public class StokkDbContext : DbContext
    {
        public StokkDbContext(DbContextOptions<StokkDbContext> options) : base(options)
        {
        }

        public DbSet<Product> Products { get; set; } = null!;
        public DbSet<ProductVariant> ProductVariants { get; set; } = null!;
        public DbSet<StoreLocation> StoreLocations { get; set; } = null!;
        public DbSet<InventoryStock> InventoryStocks { get; set; } = null!;
        public DbSet<StockTransfer> StockTransfers { get; set; } = null!;
        public DbSet<InventoryAuditLog> InventoryAuditLogs { get; set; } = null!;
        public DbSet<Customer> Customers { get; set; } = null!;
        public DbSet<CustomerOrder> CustomerOrders { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Unique constraint on Variant + Location
            modelBuilder.Entity<InventoryStock>()
                .HasIndex(s => new { s.VariantId, s.LocationId })
                .IsUnique();

            modelBuilder.Entity<Product>()
                .HasIndex(p => p.ProductCode)
                .IsUnique();

            modelBuilder.Entity<ProductVariant>()
                .HasIndex(v => v.Sku)
                .IsUnique();

            modelBuilder.Entity<Customer>()
                .HasIndex(c => c.Email)
                .IsUnique();

            modelBuilder.Entity<Customer>()
                .HasIndex(c => c.Username)
                .IsUnique();
        }
    }
}
