-- ============================================================================
-- PROJE: Mini B2B E-Ticaret ve Müşteri/Envanter Yönetim Portalı
-- DOKÜMAN: Microsoft SQL Server (T-SQL) Veritabanı Kurulum ve Başlangıç Veri Scripti
-- ROL / YETKİLİ: Sistem Yöneticisi (Batu Güdek)
-- VERİTABANI: StokkDb
-- TEKNOLOJİ: .NET 8 Web API + Entity Framework Core 8 / MSSQL 2019+
-- ============================================================================

USE master;
GO

-- 1. Veritabanını Oluştur
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'StokkDb')
BEGIN
    CREATE DATABASE StokkDb COLLATE Turkish_CI_AS;
END
GO

USE StokkDb;
GO

-- ============================================================================
-- TABLOLARIN OLUŞTURULMASI (DDL)
-- ============================================================================

-- 1. ŞİRKETLER TABLOSU (Companies)
-- B2B Cari Şirketler (1-N İlişki Modeli: 1 Şirket -> N Kullanıcı)
IF OBJECT_ID('dbo.Companies', 'U') IS NOT NULL DROP TABLE dbo.Companies;
CREATE TABLE dbo.Companies (
    Id NVARCHAR(50) NOT NULL PRIMARY KEY,            -- Örn: COMP-001
    Name NVARCHAR(200) NOT NULL,                     -- Şirket Unvanı
    TaxNumber NVARCHAR(50) NULL,                     -- Vergi Numarası
    City NVARCHAR(100) NOT NULL DEFAULT 'Kayseri',   -- Şehir
    Address NVARCHAR(500) NULL,                      -- Adres
    Phone NVARCHAR(50) NULL,                         -- Telefon
    Email NVARCHAR(150) NULL,                        -- E-posta
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE()
);
GO

-- 2. KULLANICILAR TABLOSU (Users)
-- Ad, Soyad, E-posta, Telefon, Kullanıcı Adı, Şifre (Maskelenmiş/Hashli)
IF OBJECT_ID('dbo.Users', 'U') IS NOT NULL DROP TABLE dbo.Users;
CREATE TABLE dbo.Users (
    Id NVARCHAR(50) NOT NULL PRIMARY KEY,            -- Örn: cust-1, USR-1001
    Username NVARCHAR(50) NOT NULL UNIQUE,           -- Kullanıcı Adı (Benzersiz)
    PasswordHash NVARCHAR(256) NOT NULL,             -- Güvenli Şifre
    FirstName NVARCHAR(100) NOT NULL,                -- Ad
    LastName NVARCHAR(100) NOT NULL,                 -- Soyad
    Role NVARCHAR(30) NOT NULL DEFAULT 'Customer',   -- 'Admin' veya 'Customer'
    CompanyId NVARCHAR(50) NULL,                     -- 1-N İlişki (Her kullanıcı tek bir şirkete bağlıdır)
    CompanyName NVARCHAR(200) NULL,                  -- Şirket Adı
    Email NVARCHAR(150) NOT NULL UNIQUE,             -- E-posta (Benzersiz)
    Phone NVARCHAR(50) NOT NULL,                     -- Telefon
    City NVARCHAR(100) NOT NULL DEFAULT 'Kayseri',   -- Şehir
    CreatedAt NVARCHAR(50) NOT NULL DEFAULT CONVERT(VARCHAR(10), GETDATE(), 104),
    CONSTRAINT FK_Users_Companies FOREIGN KEY (CompanyId) 
        REFERENCES dbo.Companies(Id) ON DELETE SET NULL
);
GO

-- 3. ÜRÜNLER TABLOSU (Products)
-- Ürün Kodu, Ürün Adı, Açıklama, Marka, Üretici Kodu, Üretici, Özel Kod 1, Özel Kod 2, Resim, Stok, Kritik Eşik, Fiyat
IF OBJECT_ID('dbo.Products', 'U') IS NOT NULL DROP TABLE dbo.Products;
CREATE TABLE dbo.Products (
    Id NVARCHAR(50) NOT NULL PRIMARY KEY,            -- Örn: prod-1
    ProductCode NVARCHAR(50) NOT NULL UNIQUE,        -- Ürün Kodu (Benzersiz)
    Name NVARCHAR(200) NOT NULL,                     -- Ürün Adı
    Brand NVARCHAR(100) NOT NULL,                    -- Marka
    Description NVARCHAR(MAX) NULL,                  -- Açıklama
    ManufacturerCode NVARCHAR(100) NULL,             -- Üretici Kodu
    Manufacturer NVARCHAR(200) NOT NULL DEFAULT 'Stokk Tekstil San. Tic. A.Ş.', -- Üretici
    SpecialCode1 NVARCHAR(100) NULL,                 -- Özel Kod 1
    SpecialCode2 NVARCHAR(100) NULL,                 -- Özel Kod 2
    Image NVARCHAR(500) NULL,                        -- Ürün Resmi URL
    Stock INT NOT NULL DEFAULT 0,                    -- Stok Miktarı
    CriticalStockThreshold INT NOT NULL DEFAULT 5,   -- Ürüne Özel Kritik Eşik (Sarı Renk Sınırı)
    Price DECIMAL(18, 2) NOT NULL,                   -- Fiyat Bilgisi
    CreatedAt NVARCHAR(50) NOT NULL DEFAULT CONVERT(VARCHAR(10), GETDATE(), 104)
);
GO

-- 4. KULLANICI SEPETİ TABLOSU (CartItems)
-- Kullanıcı İzolasyonlu Sepet (Ayşe'nin sepeti ayrı, Veli'nin sepeti ayrı)
IF OBJECT_ID('dbo.CartItems', 'U') IS NOT NULL DROP TABLE dbo.CartItems;
CREATE TABLE dbo.CartItems (
    Id NVARCHAR(50) NOT NULL PRIMARY KEY,            -- Örn: cart-1
    UserId NVARCHAR(50) NOT NULL,                    -- Sepet Sahibi Kullanıcı ID
    ProductId NVARCHAR(50) NOT NULL,                 -- Ürün ID
    ProductCode NVARCHAR(50) NOT NULL,               -- Ürün Kodu
    ProductName NVARCHAR(200) NOT NULL,              -- Ürün Adı
    Image NVARCHAR(500) NULL,                        -- Ürün Resmi
    UnitPrice DECIMAL(18, 2) NOT NULL,               -- Sepete Eklendiği Andaki Birim Fiyat
    Quantity INT NOT NULL DEFAULT 1,                 -- Adet
    AddedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_CartItems_Users FOREIGN KEY (UserId) 
        REFERENCES dbo.Users(Id) ON DELETE CASCADE,
    CONSTRAINT FK_CartItems_Products FOREIGN KEY (ProductId) 
        REFERENCES dbo.Products(Id) ON DELETE CASCADE
);
GO

-- 5. SİPARİŞLER TABLOSU (CustomerOrders / Orders)
-- Sipariş ID, Sipariş No, Kullanıcı ID, Kullanıcı Adı, Tarih, Durum, Ödeme Yöntemi, Toplam Tutar
IF OBJECT_ID('dbo.Orders', 'U') IS NOT NULL DROP TABLE dbo.Orders;
CREATE TABLE dbo.Orders (
    Id NVARCHAR(50) NOT NULL PRIMARY KEY,            -- Örn: ord-1
    OrderNo NVARCHAR(50) NOT NULL UNIQUE,            -- Örn: SIP-2026-9041
    UserId NVARCHAR(50) NOT NULL,                    -- Siparişi Veren Kullanıcı ID (Kullanıcı İzolasyonu)
    UserName NVARCHAR(200) NOT NULL,                 -- Siparişi Veren Kullanıcı Adı
    CompanyName NVARCHAR(200) NULL,                  -- Bağlı Cari Firma
    OrderDate NVARCHAR(50) NOT NULL,                 -- Sipariş Tarihi (dd.MM.yyyy HH:mm)
    Status NVARCHAR(50) NOT NULL DEFAULT 'Hazırlanıyor', -- 'Hazırlanıyor', 'Onaylandı', 'Reddedildi', 'Yolda', 'Teslim Edildi'
    PaymentMethod NVARCHAR(50) NOT NULL DEFAULT 'Nakit', -- 'Nakit', 'Çek', 'Bakiye'
    Notes NVARCHAR(MAX) NULL,                        -- Sipariş / Sevkiyat Notu
    TotalAmount DECIMAL(18, 2) NOT NULL DEFAULT 0,   -- Toplam Tutar
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_Orders_Users FOREIGN KEY (UserId) 
        REFERENCES dbo.Users(Id) ON DELETE CASCADE
);
GO

-- 6. SİPARİŞ DETAY / KALEMLERİ TABLOSU (OrderItems)
-- KRİTİK KURAL (Madde 7): Satıldığı andaki fiyat dondurulur (Snapshot Fiyat).
-- Ürünün fiyatı sonradan yönetim panelinden değiştirilse bile geçmiş siparişin birim fiyatı DEĞİŞMEZ!
IF OBJECT_ID('dbo.OrderItems', 'U') IS NOT NULL DROP TABLE dbo.OrderItems;
CREATE TABLE dbo.OrderItems (
    Id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    OrderId NVARCHAR(50) NOT NULL,                   -- Sipariş ID
    ProductId NVARCHAR(50) NOT NULL,                 -- Ürün ID
    ProductCode NVARCHAR(50) NOT NULL,               -- Ürün Kodu
    ProductName NVARCHAR(200) NOT NULL,              -- Ürün Adı
    Quantity INT NOT NULL,                           -- Satın Alınan Adet
    UnitPrice DECIMAL(18, 2) NOT NULL,               -- Satış Anında Dondurulan Birim Fiyat (Sabit)
    TotalPrice DECIMAL(18, 2) NOT NULL,              -- Toplam Tutar (Quantity * UnitPrice)
    CONSTRAINT FK_OrderItems_Orders FOREIGN KEY (OrderId) 
        REFERENCES dbo.Orders(Id) ON DELETE CASCADE,
    CONSTRAINT FK_OrderItems_Products FOREIGN KEY (ProductId) 
        REFERENCES dbo.Products(Id)
);
GO

-- 7. STOK HAREKET LOGLARI TABLOSU (StockHistoryLogs)
-- Canlı Stok Takibi ve Stok Denetim İzi
IF OBJECT_ID('dbo.StockLogs', 'U') IS NOT NULL DROP TABLE dbo.StockLogs;
CREATE TABLE dbo.StockLogs (
    Id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    ProductId NVARCHAR(50) NOT NULL,
    Timestamp DATETIME2 NOT NULL DEFAULT GETDATE(),
    ActionType NVARCHAR(50) NOT NULL,                -- 'Sipariş Satışı', 'Stok Artırımı', 'İlk Stok Girişi' vb.
    ChangeAmount INT NOT NULL,                       -- Değişim Miktarı (+ / -)
    PreviousStock INT NOT NULL,                      -- Önceki Stok
    NewStock INT NOT NULL,                           -- Yeni Stok
    Note NVARCHAR(500) NULL,                         -- Açıklama
    PerformedBy NVARCHAR(100) NOT NULL,              -- İşlemi Yapan Kullanıcı / Sistem
    CONSTRAINT FK_StockLogs_Products FOREIGN KEY (ProductId) 
        REFERENCES dbo.Products(Id) ON DELETE CASCADE
);
GO

-- 8. KAMPANYA VE SLIDER TABLOSU (Campaigns)
IF OBJECT_ID('dbo.Campaigns', 'U') IS NOT NULL DROP TABLE dbo.Campaigns;
CREATE TABLE dbo.Campaigns (
    Id NVARCHAR(50) NOT NULL PRIMARY KEY,
    Title NVARCHAR(200) NOT NULL,
    Subtitle NVARCHAR(200) NULL,
    Badge NVARCHAR(100) NOT NULL,
    BadgeColor NVARCHAR(50) NOT NULL DEFAULT 'blue',
    ProductCode NVARCHAR(50) NULL,
    ImageUrl NVARCHAR(500) NOT NULL,
    OriginalPrice DECIMAL(18, 2) NOT NULL DEFAULT 0,
    DiscountedPrice DECIMAL(18, 2) NOT NULL DEFAULT 0,
    DiscountPercentage INT NOT NULL DEFAULT 0,
    ValidUntil NVARCHAR(100) NULL,
    TargetAction NVARCHAR(100) NOT NULL DEFAULT 'product_detail',
    IsActive BIT NOT NULL DEFAULT 1,
    OrderRank INT NOT NULL DEFAULT 1
);
GO

-- ============================================================================
-- PERFORMANS İNDEKS TANIMLARI
-- ============================================================================
CREATE NONCLUSTERED INDEX IX_Products_ProductCode ON dbo.Products(ProductCode);
CREATE NONCLUSTERED INDEX IX_Products_Name ON dbo.Products(Name);
CREATE NONCLUSTERED INDEX IX_Products_Brand ON dbo.Products(Brand);
CREATE NONCLUSTERED INDEX IX_Orders_UserId ON dbo.Orders(UserId);
CREATE NONCLUSTERED INDEX IX_Orders_OrderNo ON dbo.Orders(OrderNo);
CREATE NONCLUSTERED INDEX IX_OrderItems_OrderId ON dbo.OrderItems(OrderId);
CREATE NONCLUSTERED INDEX IX_CartItems_UserId ON dbo.CartItems(UserId);
CREATE NONCLUSTERED INDEX IX_StockLogs_ProductId ON dbo.StockLogs(ProductId);
GO

-- ============================================================================
-- BAŞLANGIÇ TOHUM VERİLERİ (SEED DATA)
-- ============================================================================

-- 1. Şirketler
INSERT INTO dbo.Companies (Id, Name, TaxNumber, City, Address, Phone, Email) VALUES
('COMP-001', N'Moda Vizyon Butik Ltd. Şti.', '6220194821', N'Kayseri', N'Talas Bulvarı No:42', '+90 352 222 10 20', 'info@modavizyon.com'),
('COMP-002', N'Anadolu Giyim Mağazacılık A.Ş.', '3190827341', N'Konya', N'Mevlana Cad. No:18', '+90 332 321 45 67', 'iletisim@anadolugiyim.com'),
('COMP-003', N'Boğaziçi Tekstil & Moda Ltd.', '1982736450', N'İstanbul', N'Nişantaşı Abdi İpekçi Cad.', '+90 212 234 56 78', 'siparis@bogazicitekstil.com');

-- 2. Kullanıcılar (Sistem Yöneticisi Batu Güdek + Müşteriler)
INSERT INTO dbo.Users (Id, Username, PasswordHash, FirstName, LastName, Role, CompanyId, CompanyName, Email, Phone, City, CreatedAt) VALUES
('cust-1', 'batugudek', 'Password123*', N'Batu', N'Güdek', 'Admin', 'COMP-001', N'Moda Vizyon Butik Ltd. Şti.', 'batugudek1@gmail.com', '+90 (532) 450 12 34', N'Kayseri', '18.09.2026'),
('cust-2', 'ayseyilmaz', 'Password123*', N'Ayşe', N'Yılmaz', 'Customer', 'COMP-001', N'Moda Vizyon Butik Ltd. Şti.', 'ayse.yilmaz@modavizyon.com', '+90 (533) 111 22 33', N'Kayseri', '18.09.2026'),
('cust-3', 'velikaya', 'Password123*', N'Veli', N'Kaya', 'Customer', 'COMP-002', N'Anadolu Giyim Mağazacılık A.Ş.', 'veli.kaya@anadolugiyim.com', '+90 (544) 222 33 44', N'Konya', '18.09.2026');

-- 3. Ürünler (Özel Kodlar, Eşik Stok, Toptan Satış Fiyatları)
INSERT INTO dbo.Products (Id, ProductCode, Name, Brand, Description, ManufacturerCode, Manufacturer, SpecialCode1, SpecialCode2, Image, Stock, CriticalStockThreshold, Price, CreatedAt) VALUES
('prod-1', '25KTPNT5138', N'Kadife Flare Pantolon', N'Stokk Collection', N'Özel dokuma İtalyan fitilli kadife flare kesim toptan kumaş pantolon.', 'MFR-PNT-01', N'Stokk Tekstil San. Tic. A.Ş.', 'OZEL-KADIFE', 'SEZON-2026', 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&q=80', 48, 7, 740.00, '18.09.2026'),
('prod-2', '25KTGML4012', N'Oversize Poplin Gömlek', N'Stokk Studio', N'%100 Mısır pamuğu dokuma oversize kesim modern poplin gömlek.', 'MFR-GML-02', N'Stokk Tekstil San. Tic. A.Ş.', 'OZEL-POPLIN', 'BASIC-LINE', 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&q=80', 60, 5, 490.00, '18.09.2026'),
('prod-3', '25KTTRI3098', N'Balıkçı Yaka Triko Kazak', N'Stokk Collection', N'Yumuşak dokulu kaşmir karışımlı balıkçı yaka toptan triko kazak.', 'MFR-TRI-03', N'Stokk Tekstil San. Tic. A.Ş.', 'OZEL-TRIKO', 'KIS-SEZONU', 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&q=80', 35, 3, 620.00, '18.09.2026'),
('prod-4', '25KTCEK1024', N'Kruvaze Yün Ceket', N'Stokk Atelier', N'İtalyan yün kumaş, astarlı şık kruvaze kesim B2B toptan blazer ceket.', 'MFR-CEK-04', N'Stokk Tekstil San. Tic. A.Ş.', 'OZEL-YUN', 'PREMIUM', 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80', 4, 5, 1250.00, '18.09.2026'),
('prod-5', '25KTYLK8045', N'Kapitone Şişme Yelek', N'Stokk Active', N'Su geçirmez mikro kumaş, sıcak tutan elyaf dolgulu şık yelek.', 'MFR-YLK-05', N'Stokk Tekstil San. Tic. A.Ş.', 'OZEL-KAPITONE', 'OUTDOOR', 'https://images.unsplash.com/photo-1544441893-675973e31985?w=600&q=80', 0, 4, 540.00, '18.09.2026');

-- 4. Stok Logları
INSERT INTO dbo.StockLogs (ProductId, Timestamp, ActionType, ChangeAmount, PreviousStock, NewStock, Note, PerformedBy) VALUES
('prod-1', GETDATE(), N'İlk Stok Girişi', 48, 0, 48, N'Sisteme ilk ürün tanımlaması yapıldı.', 'Batu Güdek'),
('prod-2', GETDATE(), N'İlk Stok Girişi', 60, 0, 60, N'Sisteme ilk ürün tanımlaması yapıldı.', 'Batu Güdek'),
('prod-3', GETDATE(), N'İlk Stok Girişi', 35, 0, 35, N'Sisteme ilk ürün tanımlaması yapıldı.', 'Batu Güdek'),
('prod-4', GETDATE(), N'İlk Stok Girişi', 4, 0, 4, N'Kritik stok seviyesinde ürün girişi.', 'Batu Güdek');

-- 5. Siparişler (Ayşe ve Veli Ayrı Siparişleri - Ödeme Yöntemleri ile)
INSERT INTO dbo.Orders (Id, OrderNo, UserId, UserName, CompanyName, OrderDate, Status, PaymentMethod, Notes, TotalAmount) VALUES
('ord-1', 'SIP-2026-9041', 'cust-2', N'Ayşe Yılmaz', N'Moda Vizyon Butik Ltd. Şti.', '18.09.2026 14:30', 'Onaylandı', 'Nakit', N'Acil mağaza vitrin teslimatı.', 2960.00),
('ord-2', 'SIP-2026-9042', 'cust-3', N'Veli Kaya', N'Anadolu Giyim Mağazacılık A.Ş.', '18.09.2026 16:15', 'Yolda', 'Çek', N'Konya Merkez Mağaza sevkiyatı.', 3920.00);

-- 6. Sipariş Kalemleri (Fiyat Sabitleme İlkesi: Satıldığı andaki birim fiyat)
INSERT INTO dbo.OrderItems (OrderId, ProductId, ProductCode, ProductName, Quantity, UnitPrice, TotalPrice) VALUES
('ord-1', 'prod-1', '25KTPNT5138', N'Kadife Flare Pantolon', 4, 740.00, 2960.00),
('ord-2', 'prod-2', '25KTGML4012', N'Oversize Poplin Gömlek', 8, 490.00, 3920.00);

GO

PRINT '============================================================================';
PRINT 'Stokk B2B E-Ticaret ve Envanter Yönetimi MSSQL Veritabanı Başarıyla Kuruldu!';
PRINT '============================================================================';
