using Microsoft.EntityFrameworkCore;
using Stokk.Api.Models.Entities;

namespace Stokk.Api.Data;

public class StokkDbContext : DbContext
{
    public StokkDbContext(DbContextOptions<StokkDbContext> options) : base(options)
    {
    }

    public DbSet<Company> Companies => Set<Company>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<CustomerOrder> Orders => Set<CustomerOrder>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<CartItem> CartItems => Set<CartItem>();
    public DbSet<StockHistoryLog> StockLogs => Set<StockHistoryLog>();
    public DbSet<CampaignSlide> Campaigns => Set<CampaignSlide>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // 1-N Rule: Company has many Employees, each user belongs to exactly one Company
        modelBuilder.Entity<User>()
            .HasOne(u => u.Company)
            .WithMany(c => c.Employees)
            .HasForeignKey(u => u.CompanyId)
            .OnDelete(DeleteBehavior.SetNull);

        // Microservice Isolation: User has many Orders
        modelBuilder.Entity<CustomerOrder>()
            .HasOne(o => o.User)
            .WithMany(u => u.Orders)
            .HasForeignKey(o => o.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // Order has many OrderItems
        modelBuilder.Entity<OrderItem>()
            .HasOne(oi => oi.Order)
            .WithMany(o => o.Items)
            .HasForeignKey(oi => oi.OrderId)
            .OnDelete(DeleteBehavior.Cascade);

        // Microservice Isolation: User has many CartItems
        modelBuilder.Entity<CartItem>()
            .HasOne(ci => ci.User)
            .WithMany(u => u.CartItems)
            .HasForeignKey(ci => ci.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // Product has many StockLogs
        modelBuilder.Entity<StockHistoryLog>()
            .HasOne(sl => sl.Product)
            .WithMany(p => p.StockLogs)
            .HasForeignKey(sl => sl.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

        // Decimal precisions for cross-database compatibility (SqlServer, PostgreSQL, Sqlite)
        modelBuilder.Entity<Product>()
            .Property(p => p.Price)
            .HasPrecision(18, 2);

        modelBuilder.Entity<CustomerOrder>()
            .Property(o => o.TotalAmount)
            .HasPrecision(18, 2);

        modelBuilder.Entity<OrderItem>()
            .Property(oi => oi.UnitPrice)
            .HasPrecision(18, 2);

        modelBuilder.Entity<OrderItem>()
            .Property(oi => oi.TotalPrice)
            .HasPrecision(18, 2);

        modelBuilder.Entity<CartItem>()
            .Property(ci => ci.UnitPrice)
            .HasPrecision(18, 2);

        modelBuilder.Entity<CampaignSlide>()
            .Property(cs => cs.OriginalPrice)
            .HasPrecision(18, 2);

        modelBuilder.Entity<CampaignSlide>()
            .Property(cs => cs.DiscountedPrice)
            .HasPrecision(18, 2);
    }
}
