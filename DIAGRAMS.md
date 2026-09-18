# Stokk B2B & E-Ticaret Portalı - UML ve Sistem Çalışma Diyagramları

Bu dokümanda, Stokk platformunun veritabanı varlık ilişkileri (**UML Sınıf Diyagramı**), sipariş yaşam döngüsü (**Durum Makinesi Diyagramı**) ve çoklu veritabanı mimarisi (**Sistem Çalışma Akış Diyagramı**) Mermaid formatında detaylandırılmıştır.

---

## 1. UML Sınıf Diyagramı (Class Diagram)

Aşağıdaki diyagramda tüm varlıkların alanları, veri tipleri ve aralarındaki 1-N ilişkileri (özellikle Şirket - Çalışan 1-N kuralı ve Kullanıcı - Sipariş/Sepet mikroservis izolasyonları) gösterilmiştir:

```mermaid
classDiagram
    direction TB

    class Company {
        +string Id PK
        +string Name
        +string TaxNumber
        +string City
        +string Address
        +string Phone
        +string Email
        +string CreatedAt
        +List~User~ Employees
    }

    class User {
        +string Id PK
        +string Username
        +string PasswordHash
        +string FirstName
        +string LastName
        +string Role
        +string CompanyId FK
        +string CompanyName
        +string Email
        +string Phone
        +string City
        +string CreatedAt
        +List~CustomerOrder~ Orders
        +List~CartItem~ CartItems
    }

    class Product {
        +string Id PK
        +string ProductCode
        +string Name
        +string Brand
        +string Description
        +string ManufacturerCode
        +string Manufacturer
        +string SpecialCode1
        +string SpecialCode2
        +string Image
        +int Stock
        +int CriticalStockThreshold
        +decimal Price
        +string CreatedAt
        +List~StockHistoryLog~ StockLogs
    }

    class CustomerOrder {
        +string Id PK
        +string OrderNo
        +string UserId FK
        +string UserName
        +string CompanyName
        +string OrderDate
        +string Status
        +string PaymentMethod
        +decimal TotalAmount
        +string Notes
        +List~OrderItem~ Items
    }

    class OrderItem {
        +string Id PK
        +string OrderId FK
        +string ProductId FK
        +string ProductCode
        +string ProductName
        +int Quantity
        +decimal UnitPrice
        +decimal TotalPrice
    }

    class CartItem {
        +string Id PK
        +string UserId FK
        +string ProductId FK
        +string ProductCode
        +string ProductName
        +string Image
        +decimal UnitPrice
        +int Quantity
        +string AddedAt
    }

    class StockHistoryLog {
        +string Id PK
        +string ProductId FK
        +string Timestamp
        +string ActionType
        +int ChangeAmount
        +int PreviousStock
        +int NewStock
        +string Note
        +string PerformedBy
    }

    class CampaignSlide {
        +string Id PK
        +string Title
        +string Subtitle
        +string Badge
        +string BadgeType
        +string Description
        +string ProductId
        +string ProductCode
        +string Image
        +decimal OriginalPrice
        +decimal DiscountedPrice
        +int DiscountPercent
        +int MinOrderQty
        +int AvailableStock
        +string ValidUntil
        +string ActionLabel
        +bool IsActive
    }

    %% İlişkiler
    Company "1" --> "0..*" User : "1-N Şirket Kuralı (Her kullanıcı tek şirkete bağlıdır)"
    User "1" --> "0..*" CustomerOrder : "Kullanıcı İzolasyonu (Ayşe Veli'nin siparişini göremez)"
    User "1" --> "0..*" CartItem : "Kullanıcı Sepet İzolasyonu"
    CustomerOrder "1" --> "1..*" OrderItem : "Satış Anındaki Fiyatı Dondurur"
    Product "1" --> "0..*" StockHistoryLog : "Stok Hareket Takibi"
    Product "1" ..> "0..*" OrderItem : "Referans"
    Product "1" ..> "0..*" CartItem : "Referans"
```

---

## 2. Sipariş Durum Otomatı (State Machine Diagram)

Siparişler yönetici tarafından yönetilir ve durum geçişleri aşağıdaki kesin iş kurallarına tabidir:
1. Sipariş verildiğinde durumu **"Hazırlanıyor"** olarak başlar.
2. Yönetici siparişi **"Onaylandı"** veya **"Reddedildi"** yapabilir.
3. Onaylanan sipariş artık **reddedilemez**, yalnızca **"Yolda"** durumuna geçirilebilir.
4. Yoldaki sipariş yalnızca **"Teslim Edildi"** durumuna geçirilebilir.
5. **"Teslim Edildi"** ve **"Reddedildi"** nihai (terminal) durumlardır; durumları asla değiştirilemez.

```mermaid
stateDiagram-v2
    [*] --> Hazırlanıyor : Müşteri Sipariş Verir (Nakit / Çek / Bakiye)

    state Hazırlanıyor {
        [*] --> InReview
        InReview : Yönetici İncelemesinde
    }

    Hazırlanıyor --> Onaylandı : Yönetici Onaylar
    Hazırlanıyor --> Reddedildi : Yönetici Reddeder

    Onaylandı --> Yolda : Yönetici Kargoya / Sevkiyata Verir
    %% Onaylandıktan sonra geri dönüş veya ret yapılamaz!

    Yolda --> TeslimEdildi : Yönetici Teslimatı Tamamlar

    state TeslimEdildi {
        [*] --> LockedFinal
        LockedFinal : Nihai Durum (Değiştirilemez)
    }

    state Reddedildi {
        [*] --> LockedRejected
        LockedRejected : Nihai Durum (Değiştirilemez)
    }

    TeslimEdildi --> [*]
    Reddedildi --> [*]
```

---

## 3. Sistem Çalışma Akış ve Çoklu Veritabanı Mimarisi (Architecture Flow)

Kullanıcıların **kendi veritabanlarını (PostgreSQL, SQL Server, MySQL, SQLite)** tek bir ayar ile bağlayabilmesini sağlayan mimari:

```mermaid
flowchart TD
    subgraph ClientLayer ["1. İstemci Katmanı (Frontend)"]
        UI["React 19 + TypeScript + Tailwind CSS\n(B2B Vitrin, Sepet, Admin Panel)"]
        Inspector["Canlı DB İzleyici (Yöneticiye Özel)"]
    end

    subgraph ApiGateway ["2. Backend API Katmanı (.NET 8 Web API)"]
        AuthCtrl["AuthController\n(Batu Güdek & Müşteri Girişi, 1-N Şirket Kaydı)"]
        ProdCtrl["ProductsController\n(Kritik Stok Eşiği, Stok CRUD)"]
        OrderCtrl["OrdersController\n(Nakit/Çek/Bakiye, Durum Otomatı)"]
        CartCtrl["CartsController\n(Kullanıcıya Özel İzole Sepet)"]
        UserCtrl["UsersController\n(Kullanıcı Yönetimi)"]
        InspCtrl["DbInspectorController\n(Canlı DB Snapshot)"]
    end

    subgraph AbstractionLayer ["3. Veritabanı Soyutlama Katmanı (EF Core)"]
        Config["appsettings.json\nDatabaseProvider: Sqlite | PostgreSql | SqlServer | InMemory"]
        DbContext["StokkDbContext\n(Entity Mappings, 1-N Constraints, Seed Initializer)"]
    end

    subgraph PluggableDatabases ["4. Kullanıcının Kendi Veritabanı Seçeneği"]
        PG[("PostgreSQL\n(Npgsql Provider)")]
        MSSQL[("Microsoft SQL Server\n(SqlServer Provider)")]
        SQLITE[("SQLite\n(Yerel Dosya: stokk_app.db)")]
        INMEM[("In-Memory DB\n(Test & Prototip)")]
        LOCAL[("LocalStorage Fallback\n(Tarayıcı İçi Mikroservis)")]
    end

    UI --> AuthCtrl & ProdCtrl & OrderCtrl & CartCtrl & UserCtrl
    Inspector --> InspCtrl
    
    AuthCtrl & ProdCtrl & OrderCtrl & CartCtrl & UserCtrl & InspCtrl --> DbContext
    Config -.-> DbContext

    DbContext -->|Provider = PostgreSql| PG
    DbContext -->|Provider = SqlServer| MSSQL
    DbContext -->|Provider = Sqlite| SQLITE
    DbContext -->|Provider = InMemory| INMEM
    UI -.->|Standalone Çevrimdışı Mod| LOCAL
```

---

## 4. Kullanıcı İzolasyonu ve 1-N Şirket Kuralı Akışı

```mermaid
sequenceDiagram
    autonumber
    actor Ayse as Ayşe Yılmaz (Moda Vizyon)
    actor Veli as Veli Kaya (Anadolu Giyim)
    actor Batu as Batu Güdek (Yönetici)
    participant API as .NET 8 Backend API
    participant DB as Veritabanı (PostgreSQL / MSSQL / SQLite)

    Note over Ayse,DB: 1. Kullanıcı ve Sepet İzolasyonu
    Ayse->>API: GET /api/carts/cust-2 (Ayşe'nin Sepeti)
    API->>DB: WHERE UserId = 'cust-2'
    DB-->>API: 3 Kalem Ürün
    API-->>Ayse: Yalnızca Ayşe'nin Sepeti Döner

    Veli->>API: GET /api/carts/cust-3 (Veli'nin Sepeti)
    API->>DB: WHERE UserId = 'cust-3'
    DB-->>API: 0 Kalem Ürün (Boş Sepet)
    API-->>Veli: Boş Sepet (Ayşe'nin ürünleri ASLA görünmez)

    Note over Ayse,DB: 2. Ödeme Yöntemi Seçimi ve Sipariş Verme
    Ayse->>API: POST /api/orders (Ödeme: Çek, Ürünler, Tutar)
    API->>DB: Sipariş Kaydet + Stok Düşümü + Sepeti Temizle
    DB-->>API: SIP-2026-0042 Oluşturuldu (Durum: Hazırlanıyor)
    API-->>Ayse: Sipariş Onayı (Ödeme Yöntemi: Çek)

    Note over Batu,DB: 3. Yönetici İşlemleri ve Durum Makinesi
    Batu->>API: GET /api/orders (Tüm Siparişler)
    API->>DB: SELECT * FROM Orders
    DB-->>API: Tüm Müşteri Siparişleri
    API-->>Batu: Sipariş Yönetim Tablosu

    Batu->>API: PUT /api/orders/ord-102/status (Onaylandı)
    API->>DB: UPDATE Status = 'Onaylandı'
    DB-->>API: Güncellendi
    API-->>Batu: Sipariş Onaylandı (Artık Reddedilemez)

    Batu->>API: PUT /api/orders/ord-102/status (Yolda)
    API->>DB: UPDATE Status = 'Yolda'
    DB-->>API: Sevkiyata Çıktı

    Batu->>API: PUT /api/orders/ord-102/status (Teslim Edildi)
    API->>DB: UPDATE Status = 'Teslim Edildi' (Nihai)
```
