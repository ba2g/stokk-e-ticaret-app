using Microsoft.EntityFrameworkCore;
using Stokk.Api.Models.Entities;

namespace Stokk.Api.Data;

public static class DbInitializer
{
    public static async Task InitializeAsync(StokkDbContext context)
    {
        // For relational databases with migrations/creation:
        if (context.Database.IsRelational())
        {
            await context.Database.EnsureCreatedAsync();
        }
        else
        {
            await context.Database.EnsureCreatedAsync();
        }

        // Seed Companies if empty
        if (!await context.Companies.AnyAsync())
        {
            var companies = new List<Company>
            {
                new()
                {
                    Id = "COMP-001",
                    Name = "Moda Vizyon Butik Ltd. Şti.",
                    TaxNumber = "6220194812",
                    City = "Kayseri",
                    Address = "Melikgazi Mah. Alparslan Bulvarı No: 42/B, Melikgazi, Kayseri",
                    Phone = "+90 (352) 222 10 20",
                    Email = "info@modavizyon.com",
                    CreatedAt = "01.01.2026"
                },
                new()
                {
                    Id = "COMP-002",
                    Name = "Anadolu Konfeksiyon San. ve Tic. A.Ş.",
                    TaxNumber = "0681928410",
                    City = "İstanbul",
                    Address = "Nişantaşı Abdi İpekçi Cad. No: 18 D:4, Şişli, İstanbul",
                    Phone = "+90 (212) 444 88 90",
                    Email = "siparis@anadolukonfeksiyon.com",
                    CreatedAt = "15.01.2026"
                },
                new()
                {
                    Id = "COMP-003",
                    Name = "Kapadokya Tekstil Pazarlama Ltd.",
                    TaxNumber = "4819201928",
                    City = "İzmir",
                    Address = "Alsancak Mah. Atatürk Cad. No: 104, Konak, İzmir",
                    Phone = "+90 (232) 333 40 50",
                    Email = "iletisim@kapadokyatekstil.com",
                    CreatedAt = "01.02.2026"
                }
            };
            await context.Companies.AddRangeAsync(companies);
            await context.SaveChangesAsync();
        }

        // Seed Users if empty
        if (!await context.Users.AnyAsync())
        {
            var users = new List<User>
            {
                new()
                {
                    Id = "cust-1",
                    Username = "batugudek",
                    // Simple hash or plain representation for demo/portable DB
                    PasswordHash = "Batu12345*",
                    FirstName = "Batu",
                    LastName = "Güdek",
                    Role = "Admin",
                    CompanyId = "COMP-001",
                    CompanyName = "Moda Vizyon Butik Ltd. Şti.",
                    Email = "batugudek1@gmail.com",
                    Phone = "05321112233",
                    City = "Kayseri",
                    CreatedAt = "01.01.2026"
                },
                new()
                {
                    Id = "cust-2",
                    Username = "ayseyilmaz",
                    PasswordHash = "Password123*",
                    FirstName = "Ayşe",
                    LastName = "Yılmaz",
                    Role = "Customer",
                    CompanyId = "COMP-002",
                    CompanyName = "Anadolu Konfeksiyon San. ve Tic. A.Ş.",
                    Email = "ayse@anadolukonfeksiyon.com",
                    Phone = "05423334455",
                    City = "İstanbul",
                    CreatedAt = "15.01.2026"
                },
                new()
                {
                    Id = "cust-3",
                    Username = "velikaya",
                    PasswordHash = "Password123*",
                    FirstName = "Veli",
                    LastName = "Kaya",
                    Role = "Customer",
                    CompanyId = "COMP-003",
                    CompanyName = "Kapadokya Tekstil Pazarlama Ltd.",
                    Email = "veli@kapadokyatekstil.com",
                    Phone = "05559998877",
                    City = "İzmir",
                    CreatedAt = "01.02.2026"
                }
            };
            await context.Users.AddRangeAsync(users);
            await context.SaveChangesAsync();
        }

        // Seed Products if empty
        if (!await context.Products.AnyAsync())
        {
            var products = new List<Product>
            {
                new()
                {
                    Id = "prod-1",
                    ProductCode = "25KTPNT5138",
                    Name = "Kadife Flare Pantolon",
                    Brand = "Stokk Studio",
                    Description = "Yüksek bel, dökümlü İtalyan kadife kumaş, modern paça kesimi.",
                    ManufacturerCode = "MFR-KD-01",
                    Manufacturer = "Dokuma Sanayi A.Ş.",
                    SpecialCode1 = "SEZON26",
                    SpecialCode2 = "ASORTI-A",
                    Image = "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&auto=format&fit=crop&q=80",
                    Stock = 52,
                    CriticalStockThreshold = 7, // Custom threshold
                    Price = 850,
                    CreatedAt = "01.01.2026"
                },
                new()
                {
                    Id = "prod-2",
                    ProductCode = "25KTOVR6290",
                    Name = "Oversize Poplin Gömlek",
                    Brand = "Stokk Studio",
                    Description = "Yüzde yüz pamuklu poplin, rahat kalıp, inci düğme detaylı.",
                    ManufacturerCode = "MFR-GM-02",
                    Manufacturer = "Ege Tekstil Ltd.",
                    SpecialCode1 = "BASIC26",
                    SpecialCode2 = "ASORTI-B",
                    Image = "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&auto=format&fit=crop&q=80",
                    Stock = 12,
                    CriticalStockThreshold = 15, // Yellow status because 12 <= 15
                    Price = 680,
                    CreatedAt = "01.01.2026"
                },
                new()
                {
                    Id = "prod-3",
                    ProductCode = "25KTKBN7741",
                    Name = "Kruvaze Kaşe Kaban",
                    Brand = "Atelier Luxe",
                    Description = "Lüks yün karışımlı kaşe kumaş, çift düğmeli kruvaze kapama.",
                    ManufacturerCode = "MFR-KB-03",
                    Manufacturer = "Bursa İpek & Dokuma",
                    SpecialCode1 = "PREMIUM",
                    SpecialCode2 = "ASORTI-C",
                    Image = "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80",
                    Stock = 0, // Red status because 0
                    CriticalStockThreshold = 3,
                    Price = 3200,
                    CreatedAt = "05.01.2026"
                },
                new()
                {
                    Id = "prod-4",
                    ProductCode = "25KTTRI3310",
                    Name = "Balıkçı Yaka Kaşmir Triko",
                    Brand = "Nordic Knit",
                    Description = "Yumuşak dokulu kaşmir karışımlı triko kazak.",
                    ManufacturerCode = "MFR-TR-04",
                    Manufacturer = "Kayseri Triko Sanayi",
                    SpecialCode1 = "SEZON26",
                    SpecialCode2 = "ASORTI-A",
                    Image = "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&auto=format&fit=crop&q=80",
                    Stock = 85,
                    CriticalStockThreshold = 10,
                    Price = 1250,
                    CreatedAt = "10.01.2026"
                }
            };
            await context.Products.AddRangeAsync(products);
            await context.SaveChangesAsync();
        }

        // Seed Campaigns if empty
        if (!await context.Campaigns.AnyAsync())
        {
            var campaigns = new List<CampaignSlide>
            {
                new()
                {
                    Id = "camp-1",
                    Title = "Yeni Sezon Triko & Dış Giyim",
                    Subtitle = "Sonbahar/Kış 2026 Koleksiyonu",
                    Badge = "%25 İNDİRİM",
                    BadgeType = "discount",
                    Description = "En çok satan İtalyan dokuma kumaş ve asortili kadın tekstil modellerinde toptan alımlara özel fırsatlar.",
                    ProductId = "prod-1",
                    ProductCode = "25KTPNT5138",
                    Image = "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200&auto=format&fit=crop&q=80",
                    OriginalPrice = 1100,
                    DiscountedPrice = 850,
                    DiscountPercent = 23,
                    MinOrderQty = 10,
                    AvailableStock = 52,
                    ValidUntil = "30.10.2026",
                    ActionLabel = "Koleksiyonu İncele",
                    IsActive = true
                },
                new()
                {
                    Id = "camp-2",
                    Title = "Oversize Poplin Gömlek Serisi",
                    Subtitle = "Hızlı Sevkiyat & Stok Garantisi",
                    Badge = "FLAŞ FIRSAT",
                    BadgeType = "flash",
                    Description = "Yüksek kaliteli pamuk poplin kumaş, dökümlü kalıp ve çok satan renk asortileri ile vitrininizi yenileyin.",
                    ProductId = "prod-2",
                    ProductCode = "25KTOVR6290",
                    Image = "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=1200&auto=format&fit=crop&q=80",
                    OriginalPrice = 850,
                    DiscountedPrice = 680,
                    DiscountPercent = 20,
                    MinOrderQty = 15,
                    AvailableStock = 38,
                    ValidUntil = "15.10.2026",
                    ActionLabel = "Hemen Sipariş Ver",
                    IsActive = true
                }
            };
            await context.Campaigns.AddRangeAsync(campaigns);
            await context.SaveChangesAsync();
        }

        // Seed Sample Orders if empty
        if (!await context.Orders.AnyAsync())
        {
            var sampleOrder = new CustomerOrder
            {
                Id = "ord-101",
                OrderNo = "SIP-2026-0041",
                UserId = "cust-2", // Ayşe Yılmaz
                UserName = "Ayşe Yılmaz",
                CompanyName = "Anadolu Konfeksiyon San. ve Tic. A.Ş.",
                OrderDate = "15.02.2026 14:20",
                Status = "Hazırlanıyor",
                PaymentMethod = "Çek",
                TotalAmount = 8500,
                Notes = "Öncelikli mağaza teslimatı rica olunur.",
                Items = new List<OrderItem>
                {
                    new()
                    {
                        Id = "item-1",
                        OrderId = "ord-101",
                        ProductId = "prod-1",
                        ProductCode = "25KTPNT5138",
                        ProductName = "Kadife Flare Pantolon",
                        Quantity = 10,
                        UnitPrice = 850,
                        TotalPrice = 8500
                    }
                }
            };
            await context.Orders.AddAsync(sampleOrder);
            await context.SaveChangesAsync();
        }
    }
}
