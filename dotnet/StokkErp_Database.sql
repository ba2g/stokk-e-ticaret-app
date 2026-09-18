-- ============================================================================
-- STOKK TEKSTİL B2B & ENVANTER VE MÜŞTERİ YÖNETİM PORTALI
-- Microsoft SQL Server (MSSQL) Veritabanı Şeması ve Başlangıç Verileri
-- Veritabanı: StokkErpDb
-- ============================================================================

USE master;
GO

IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'StokkErpDb')
BEGIN
    CREATE DATABASE StokkErpDb COLLATE Turkish_CI_AS;
END
GO

USE StokkErpDb;
GO

-- 1. ŞİRKETLER / CARİ HESAPLAR (Companies - 1-N İlişki Modeli)
-- 1 Şirketin birden fazla çalışanı/kullanıcısı olabilir.
-- Ancak her çalışan yalnızca 1 şirkete aittir!
IF OBJECT_ID('dbo.Companies', 'U') IS NOT NULL DROP TABLE dbo.Companies;
CREATE TABLE dbo.Companies (
    CompanyId NVARCHAR(50) NOT NULL PRIMARY KEY, -- Benzersiz Şirket ID (örn: COMP-001)
    CompanyName NVARCHAR(200) NOT NULL,
    TaxNumber NVARCHAR(50) NULL,
    City NVARCHAR(100) NOT NULL DEFAULT 'Kayseri',
    Address NVARCHAR(500) NULL,
    Phone NVARCHAR(50) NULL,
    Email NVARCHAR(150) NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE()
);

-- 2. KULLANICILAR / ÇALIŞANLAR / MÜŞTERİLER (Customers)
-- Ad, Soyad, E-posta, Telefon, Kullanıcı ID, Şifre (Hash/Maskeli), Şirket ID
IF OBJECT_ID('dbo.Customers', 'U') IS NOT NULL DROP TABLE dbo.Customers;
CREATE TABLE dbo.Customers (
    CustomerId NVARCHAR(50) NOT NULL PRIMARY KEY,
    FirstName NVARCHAR(100) NOT NULL, -- Ad
    LastName NVARCHAR(100) NOT NULL,  -- Soyad
    Email NVARCHAR(150) NOT NULL UNIQUE, -- E-posta
    Phone NVARCHAR(30) NULL,           -- Telefon
    Username NVARCHAR(50) NOT NULL UNIQUE, -- Kullanıcı Adı
    PasswordHash NVARCHAR(256) NOT NULL,  -- Şifreli / Hashlenmiş Parola
    CompanyId NVARCHAR(50) NOT NULL,      -- Her çalışan yalnızca 1 şirkete aittir (1-N)
    Role NVARCHAR(30) NOT NULL DEFAULT 'Customer', -- 'Admin' (Batu Güdek) veya 'Customer'
    City NVARCHAR(50) NULL,
    Address NVARCHAR(500) NULL,
    Status NVARCHAR(30) NOT NULL DEFAULT 'Aktif', -- 'Aktif', 'Pasif', 'Onay Bekliyor'
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_Customers_Company FOREIGN KEY (CompanyId) REFERENCES dbo.Companies(CompanyId)
);

-- 3. LOKASYONLAR / DEPOLAR (StoreLocations)
IF OBJECT_ID('dbo.StoreLocations', 'U') IS NOT NULL DROP TABLE dbo.StoreLocations;
CREATE TABLE dbo.StoreLocations (
    LocationId NVARCHAR(50) NOT NULL PRIMARY KEY,
    LocationCode NVARCHAR(20) NOT NULL UNIQUE,
    LocationName NVARCHAR(100) NOT NULL,
    LocationType NVARCHAR(30) NOT NULL, -- 'Merkez Depo', 'Mağaza', 'Bölge Depo'
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE()
);

-- 4. ÜRÜNLER (Products - Yönetici Tarafından Girilen Tüm Zorunlu Alanlar)
-- Ürün Kodu, Ürün Adı, Açıklama, Üretici Kodu, Üretici, Marka, Özel Kod 1, Özel Kod 2, Resim, Stok, Fiyat
IF OBJECT_ID('dbo.Products', 'U') IS NOT NULL DROP TABLE dbo.Products;
CREATE TABLE dbo.Products (
    ProductId NVARCHAR(50) NOT NULL PRIMARY KEY,
    ProductCode NVARCHAR(50) NOT NULL UNIQUE, -- Ürün Kodu
    ProductName NVARCHAR(200) NOT NULL,      -- Ürün Adı
    Description NVARCHAR(MAX) NULL,           -- Açıklama
    ManufacturerCode NVARCHAR(100) NULL,      -- Üretici Kodu
    Manufacturer NVARCHAR(200) NOT NULL,      -- Üretici
    Brand NVARCHAR(100) NOT NULL,             -- Marka
    SpecialCode1 NVARCHAR(100) NULL,          -- Özel Kod 1
    SpecialCode2 NVARCHAR(100) NULL,          -- Özel Kod 2
    ImageUrl NVARCHAR(500) NULL,              -- Resim
    StockQuantity INT NOT NULL DEFAULT 0,     -- Stok Miktarı
    Price DECIMAL(18, 2) NOT NULL,            -- Fiyat Bilgisi
    Category NVARCHAR(100) NOT NULL DEFAULT 'Kadın Tekstil',
    Season NVARCHAR(50) NOT NULL DEFAULT 'Dört Mevsim',
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETDATE()
);

-- 5. ÜRÜN VARYANTLARI (ProductVariants - Renk, Beden, Barkod)
IF OBJECT_ID('dbo.ProductVariants', 'U') IS NOT NULL DROP TABLE dbo.ProductVariants;
CREATE TABLE dbo.ProductVariants (
    VariantId NVARCHAR(100) NOT NULL PRIMARY KEY,
    ProductId NVARCHAR(50) NOT NULL,
    Sku NVARCHAR(80) NOT NULL UNIQUE,
    Barcode NVARCHAR(50) NOT NULL,
    Color NVARCHAR(50) NOT NULL,
    ColorHex NVARCHAR(20) NOT NULL,
    Size NVARCHAR(20) NOT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_ProductVariants_Products FOREIGN KEY (ProductId) 
        REFERENCES dbo.Products(ProductId) ON DELETE CASCADE
);

-- 6. ENVANTER STOKLARI (InventoryStocks - Depo & Varyant Bazlı Canlı Stok)
IF OBJECT_ID('dbo.InventoryStocks', 'U') IS NOT NULL DROP TABLE dbo.InventoryStocks;
CREATE TABLE dbo.InventoryStocks (
    StockId BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    VariantId NVARCHAR(100) NOT NULL,
    LocationId NVARCHAR(50) NOT NULL,
    OnHand INT NOT NULL DEFAULT 0, -- Eldeki Fiziksel Stok (Negatif olabilir: Ters Bakiye)
    Reserved INT NOT NULL DEFAULT 0, -- Rezerve / B2B Sipariş Verilmiş
    InTransit INT NOT NULL DEFAULT 0, -- Yoldaki İrsaliyeli Transfer
    MinThreshold INT NOT NULL DEFAULT 5, -- Kritik Eşik
    ReorderPoint INT NOT NULL DEFAULT 10,
    LastAuditDate DATETIME2 NULL,
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT UQ_Variant_Location UNIQUE (VariantId, LocationId),
    CONSTRAINT FK_InventoryStocks_Variant FOREIGN KEY (VariantId) 
        REFERENCES dbo.ProductVariants(VariantId) ON DELETE CASCADE,
    CONSTRAINT FK_InventoryStocks_Location FOREIGN KEY (LocationId) 
        REFERENCES dbo.StoreLocations(LocationId)
);

-- 7. SİPARİŞLER (CustomerOrders - Kullanıcıya Özel İzolasyonlu)
-- Sipariş ID, Sipariş Numarası, Kullanıcı ID, Tarih, Sipariş Durumu (Onaylandı, Reddedildi, Yolda), Toplam Tutar
IF OBJECT_ID('dbo.CustomerOrders', 'U') IS NOT NULL DROP TABLE dbo.CustomerOrders;
CREATE TABLE dbo.CustomerOrders (
    OrderId NVARCHAR(50) NOT NULL PRIMARY KEY,
    OrderNo NVARCHAR(50) NOT NULL UNIQUE,
    CustomerId NVARCHAR(50) NOT NULL, -- Siparişi veren kullanıcı (Ayşe velininkini göremez)
    CustomerName NVARCHAR(150) NOT NULL,
    CustomerEmail NVARCHAR(150) NULL,
    CustomerPhone NVARCHAR(50) NULL,
    OrderDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    OrderStatus NVARCHAR(30) NOT NULL DEFAULT 'Hazırlanıyor', -- 'Onaylandı', 'Reddedildi', 'Yolda'
    TotalAmount DECIMAL(18, 2) NOT NULL DEFAULT 0,
    ShippingAddress NVARCHAR(500) NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_CustomerOrders_Customer FOREIGN KEY (CustomerId) REFERENCES dbo.Customers(CustomerId)
);

-- 8. SİPARİŞ KALEMLERİ (CustomerOrderItems)
-- Sipariş ID, Ürün ID, Ürün Kodu, Ürün Adı, Adet, Birim Fiyatı, Toplam Fiyat
-- KURAL: Sonradan fiyatı değişen ürün satıldığında, satıldığı andaki fiyat sabit kalır!
IF OBJECT_ID('dbo.CustomerOrderItems', 'U') IS NOT NULL DROP TABLE dbo.CustomerOrderItems;
CREATE TABLE dbo.CustomerOrderItems (
    OrderItemId BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    OrderId NVARCHAR(50) NOT NULL,
    ProductId NVARCHAR(50) NOT NULL,
    ProductCode NVARCHAR(50) NOT NULL,
    ProductName NVARCHAR(200) NOT NULL,
    Quantity INT NOT NULL,
    UnitPrice DECIMAL(18, 2) NOT NULL, -- Satış anında dondurulan sabit birim fiyatı
    TotalPrice DECIMAL(18, 2) NOT NULL,
    CONSTRAINT FK_CustomerOrderItems_Order FOREIGN KEY (OrderId) 
        REFERENCES dbo.CustomerOrders(OrderId) ON DELETE CASCADE,
    CONSTRAINT FK_CustomerOrderItems_Product FOREIGN KEY (ProductId) 
        REFERENCES dbo.Products(ProductId)
);

-- 9. SLİDER & KAMPANYA REKLAMLARI (CampaignBanners)
-- Slider'daki reklamların ve kampanyaların yönetimi
IF OBJECT_ID('dbo.CampaignBanners', 'U') IS NOT NULL DROP TABLE dbo.CampaignBanners;
CREATE TABLE dbo.CampaignBanners (
    CampaignId NVARCHAR(50) NOT NULL PRIMARY KEY,
    Title NVARCHAR(200) NOT NULL,
    Subtitle NVARCHAR(200) NULL,
    Description NVARCHAR(MAX) NULL,
    Badge NVARCHAR(100) NOT NULL,
    BadgeType NVARCHAR(30) NOT NULL DEFAULT 'discount',
    ProductCode NVARCHAR(50) NULL,
    ImageUrl NVARCHAR(500) NOT NULL,
    OriginalPrice DECIMAL(18, 2) NOT NULL DEFAULT 0,
    DiscountedPrice DECIMAL(18, 2) NOT NULL DEFAULT 0,
    DiscountPercent INT NOT NULL DEFAULT 0,
    ValidUntil NVARCHAR(100) NULL,
    ActionLabel NVARCHAR(100) NOT NULL DEFAULT 'Hemen Sipariş Ver',
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE()
);

-- 10. STOK HAREKET & DENETİM LOGLARI (StockHistoryLogs)
IF OBJECT_ID('dbo.StockHistoryLogs', 'U') IS NOT NULL DROP TABLE dbo.StockHistoryLogs;
CREATE TABLE dbo.StockHistoryLogs (
    LogId BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    LogDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    LogType NVARCHAR(50) NOT NULL, -- 'Satış', 'İade', 'Sayım Farkı', 'Transfer'
    ReferenceNo NVARCHAR(50) NOT NULL,
    ChangeAmount INT NOT NULL,
    BalanceAfter INT NOT NULL,
    Operator NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500) NULL
);
GO

-- ============================================================================
-- BAŞLANGIÇ VERİLERİ (SEED DATA)
-- ============================================================================

-- 1. Şirketler (1-N Multi-tenant)
INSERT INTO dbo.Companies (CompanyId, CompanyName, TaxNumber, City, Address, Phone, Email) VALUES
('COMP-001', N'Moda Vizyon Butik Ltd. Şti.', '6220194821', N'Kayseri', N'Talas Bulvarı No:42', '+90 352 222 10 20', 'info@modavizyon.com'),
('COMP-002', N'Anadolu Giyim Mağazacılık A.Ş.', '3190827341', N'Konya', N'Mevlana Cad. No:18', '+90 332 321 45 67', 'iletisim@anadolugiyim.com'),
('COMP-003', N'Boğaziçi Tekstil & Moda Ltd.', '1982736450', N'İstanbul', N'Nişantaşı Abdi İpekçi Cad.', '+90 212 234 56 78', 'siparis@bogazicitekstil.com');

-- 2. Kullanıcılar (Batu Güdek Yönetici + Müşteriler)
INSERT INTO dbo.Customers (CustomerId, FirstName, LastName, Email, Phone, Username, PasswordHash, CompanyId, Role) VALUES
('cust-1', N'Batu', N'Güdek', 'batugudek1@gmail.com', '+90 (532) 450 12 34', 'batugudek', 'Password123*', 'COMP-001', 'Admin'),
('cust-2', N'Ayşe', N'Yılmaz', 'ayse.yilmaz@modavizyon.com', '+90 (533) 111 22 33', 'ayseyilmaz', 'Password123*', 'COMP-001', 'Customer'),
('cust-3', N'Veli', N'Kaya', 'veli.kaya@anadolugiyim.com', '+90 (544) 222 33 44', 'velikaya', 'Password123*', 'COMP-002', 'Customer');

-- 3. Ürünler
INSERT INTO dbo.Products (ProductId, ProductCode, ProductName, Brand, Manufacturer, ManufacturerCode, SpecialCode1, SpecialCode2, Description, Price, StockQuantity, ImageUrl) VALUES
('prod-1', '25KTPNT5138', N'Kadife Flare Pantolon', N'Stokk Collection', N'Stokk Tekstil San. Tic. A.Ş.', 'MFR-PNT-01', 'OZEL-KADIFE', 'SEZON-2026', N'Özel dokuma İtalyan fitilli kadife flare kesim pantolon.', 740.00, 48, 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&q=80'),
('prod-2', '25KTGML4012', N'Oversize Poplin Gömlek', N'Stokk Studio', N'Stokk Tekstil San. Tic. A.Ş.', 'MFR-GML-02', 'OZEL-POPLIN', 'BASIC-LINE', N'%100 Mısır pamuğu oversize kesim modern poplin gömlek.', 490.00, 60, 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&q=80'),
('prod-3', '25KTTRI3098', N'Balıkçı Yaka Triko Kazak', N'Stokk Collection', N'Stokk Tekstil San. Tic. A.Ş.', 'MFR-TRI-03', 'OZEL-TRIKO', 'KIS-SEZONU', N'Yumuşak dokulu kaşmir karışımlı balıkçı yaka triko kazak.', 620.00, 35, 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&q=80');

-- 4. Siparişler (Ayşe ve Veli Ayrı Siparişler)
INSERT INTO dbo.CustomerOrders (OrderId, OrderNo, CustomerId, CustomerName, CustomerEmail, OrderDate, OrderStatus, TotalAmount) VALUES
('ord-1', 'SIP-2026-9041', 'cust-2', N'Ayşe Yılmaz', 'ayse.yilmaz@modavizyon.com', '2026-03-10', 'Onaylandı', 3256.00),
('ord-2', 'SIP-2026-9042', 'cust-3', N'Veli Kaya', 'veli.kaya@anadolugiyim.com', '2026-03-12', 'Yolda', 4840.00);

-- 5. Sipariş Kalemleri (Fiyat Dondurma Prensibi)
INSERT INTO dbo.CustomerOrderItems (OrderId, ProductId, ProductCode, ProductName, Quantity, UnitPrice, TotalPrice) VALUES
('ord-1', 'prod-1', '25KTPNT5138', N'Kadife Flare Pantolon', 4, 740.00, 2960.00),
('ord-2', 'prod-2', '25KTGML4012', N'Oversize Poplin Gömlek', 8, 490.00, 3920.00);

GO
PRINT 'Stokk Tekstil MSSQL Veritabanı ve Şeması başarıyla oluşturuldu.';
