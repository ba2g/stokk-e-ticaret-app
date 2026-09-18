# STOKK TEKSTİL B2B & ENVANTER SİSTEMİ - .NET & SQL SERVER KURULUM KILAVUZU

Bu klasör, projenin **tamamen .NET 8 / ASP.NET Core** ve **Microsoft SQL Server** mimarisinde çalışması için gerekli tüm kaynak dosyaları içerir.

---

## 1. Veritabanı Kurulumu (Microsoft SQL Server)
1. **SQL Server Management Studio (SSMS)** veya **Azure Data Studio**'yu açın.
2. `StokkErp_Database.sql` dosyasını açıp çalıştırın (`Execute` / `F5`).
3. Bu script:
   - `StokkErpDb` veritabanını oluşturur.
   - `Products`, `ProductVariants`, `StoreLocations`, `InventoryStocks`, `StockTransfers`, `InventoryAuditLogs` tablolarını kurar.
   - Hızlı sorgulama ve ters bakiye analizleri için `vw_InventoryMatrixSummary` view'ını ve index'leri hazırlar.
   - Test için hazır demo tekstil envanter verilerini ekler.

---

## 2. .NET Core Projesini Çalıştırma (Visual Studio / VS Code / CLI)

### Visual Studio 2022 ile:
1. `Stokk.Erp.Api.csproj` dosyasını Visual Studio ile açın.
2. `appsettings.json` dosyasındaki SQL Server bağlantı adresinizi (`DefaultConnection`) kontrol edin:
   ```json
   "DefaultConnection": "Server=localhost;Database=StokkErpDb;Trusted_Connection=True;TrustServerCertificate=True;"
   ```
3. `F5` veya `Ctrl + F5` tuşuna basarak projeyi başlatın.
4. Tarayıcınızda otomatik olarak **Swagger UI** açılacaktır (`https://localhost:7001/swagger`).

### Komut Satırından (.NET CLI):
```bash
cd dotnet
dotnet restore
dotnet run
```

---

## 3. Mimari Bileşenler
- **`Models/Entities.cs`**: Entity Framework Core için veritabanı tablolarının C# karşılığı olan sınıflar.
- **`Data/StokkDbContext.cs`**: SQL Server veritabanı bağlantı yöneticisi.
- **`Controllers/InventoryController.cs`**: Envanter matrisi, ters bakiye kontrolü, sayım fişi ve denetim logu API uçları.
- **`Controllers/ProductsController.cs`**: Ürün kataloğu, varyantlar, marka/sezon filtreleme API uçları.
- **`Program.cs`**: ASP.NET Core Web API yapılandırması, CORS, Swagger ve EF Core SQL Server enjeksiyonu.
