# Stokk. - B2B E-Ticaret & Bayi Sipariş Yönetim Portalı

Modern, ölçeklenebilir ve kurumsal seviyede **B2B E-Ticaret ve Müşteri/Sipariş Yönetim Portalı**. 
React 19 + TypeScript + Tailwind CSS modern ön yüzü ve **ASP.NET Core 8 Web API + Entity Framework Core** arka yüzü ile birlikte gelir. 

Proje, geliştiricilerin veya şirketlerin **kendi veritabanlarını (PostgreSQL, Microsoft SQL Server, MySQL veya SQLite)** tek bir ayar satırıyla (`appsettings.json`) bağlayıp kullanabileceği **Tak-Çalıştır (Pluggable Multi-Database)** bir mimaride tasarlanmıştır.

---

## 🌟 Temel Özellikler

1. **Çoklu Veritabanı Desteği (Pluggable Multi-DB):**
   - Tek bir konfigürasyon (`appsettings.json`) ile **PostgreSQL**, **Microsoft SQL Server**, **SQLite** veya **In-Memory** veritabanına bağlanabilir.
   - Uygulama ilk çalıştığında gerekli tabloları ve ilk tohum verilerini (`DbInitializer`) otomatik olarak oluşturur.
2. **Kullanıcı & Sepet İzolasyonu (Microservice Isolation):**
   - Her bayi müşterisi yalnızca kendi sepetini ve kendi sipariş geçmişini görebilir (Örn: Ayşe Yılmaz, Veli Kaya'nın sepetini veya siparişlerini kesinlikle göremez).
3. **1-N Şirket ve Çalışan Kuralı:**
   - Bir şirket birden fazla çalışana sahip olabilir, ancak her çalışan sisteme tek bir şirket üzerinden kayıt edilebilir.
4. **Sipariş Durum Otomatı (Order State Machine):**
   - `Hazırlanıyor` -> `Onaylandı` / `Reddedildi`
   - `Onaylandı` -> `Yolda` (Onaylanan sipariş sonradan reddedilemez)
   - `Yolda` -> `Teslim Edildi`
   - `Teslim Edildi` ve `Reddedildi` nihai durumlardır; durumları değiştirilemez.
5. **Ödeme Yöntemi Seçimi:**
   - Sipariş oluşturma ekranında müşteriler **Nakit**, **Çek** veya **Bakiye** seçeneklerinden birini belirler.
6. **Ürüne Özel Kritik Stok Renk Eşiği:**
   - Her ürünün bağımsız bir kritik eşiği (`criticalStockThreshold`) vardır. Stok 0 ise kırmızı; kritik eşik veya altındaysa sarı; üstündeyse yeşil renk alır.
7. **Canlı DB İzleyici (Live DB Inspector - Yalnızca Yöneticiye Özel):**
   - Batu Güdek yönetici hesabıyla girildiğinde üst çubukta beliren altın simgeli butonla tüm tablolar (Siparişler, Kullanıcılar, Ürünler, Sepetler, Şirketler, Stok Logları) canlı olarak izlenebilir, JSON olarak kopyalanabilir veya yedek indirilebilir.

---

## 🏗️ Mimari ve Teknolojiler

- **Frontend:** React 19, TypeScript, Tailwind CSS, Lucide Icons, Vite
- **Backend:** .NET 8 (ASP.NET Core Web API), C# 12
- **ORM:** Entity Framework Core 8
- **Desteklenen DB Sağlayıcıları:**
  - `Npgsql.EntityFrameworkCore.PostgreSQL` (PostgreSQL)
  - `Microsoft.EntityFrameworkCore.SqlServer` (SQL Server)
  - `Microsoft.EntityFrameworkCore.Sqlite` (SQLite)
  - `Microsoft.EntityFrameworkCore.InMemory` (Test / Mock)
- **API Dokümantasyonu:** Swagger / OpenAPI

---

## 🔌 Kendi Veritabanınızı Nasıl Bağlarsınız?

`backend/Stokk.Api/appsettings.json` dosyasını açın:

```json
{
  "DatabaseProvider": "Sqlite", // Seçenekler: "Sqlite" | "PostgreSql" | "SqlServer" | "InMemory"
  "ConnectionStrings": {
    "Sqlite": "Data Source=stokk_app.db",
    "PostgreSql": "Host=localhost;Port=5432;Database=stokk_db;Username=postgres;Password=your_password;Include Error Detail=true",
    "SqlServer": "Server=localhost;Database=StokkDb;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True"
  }
}
```

### 1. PostgreSQL Bağlantısı:
1. `"DatabaseProvider": "PostgreSql"` yapın.
2. `ConnectionStrings:PostgreSql` alanına kendi PostgreSQL host, kullanıcı ve şifrenizi yazın.
3. Projeyi çalıştırdığınızda tablolar ve veriler PostgreSQL içinde otomatik oluşturulacaktır!

### 2. Microsoft SQL Server Bağlantısı:
1. `"DatabaseProvider": "SqlServer"` yapın.
2. `ConnectionStrings:SqlServer` alanına MSSQL bağlantı cümlenizi girin.

### 3. SQLite Bağlantısı (Varsayılan - Kurulum Gerektirmez):
- Herhangi bir veritabanı sunucusu kurmanıza gerek kalmadan tek tıkla yerel `stokk_app.db` dosyasında çalışır.

---

## 🚀 Kurulum ve Çalıştırma

### 1. Backend (.NET 8 Web API) Başlatma
```bash
cd backend/Stokk.Api
dotnet restore
dotnet run
```
- API adresi: `http://localhost:5000`
- Swagger arayüzü: `http://localhost:5000/swagger`

### 2. Frontend (React 19) Başlatma
```bash
npm install
npm run dev
```
- Arayüz adresi: `http://localhost:3000`

---

## 🔑 Varsayılan Giriş Bilgileri

| Rol | Kullanıcı Adı | Şifre | Açıklama |
|---|---|---|---|
| **Yönetici (Admin)** | `batugudek` | `Batu12345*` | Tüm sipariş, ürün, kullanıcı ve canlı DB yetkilerine sahiptir |
| **Bayi Müşterisi 1** | `ayseyilmaz` | `Password123*` | Moda Vizyon Butik çalışanı |
| **Bayi Müşterisi 2** | `velikaya` | `Password123*` | Kapadokya Tekstil Pazarlama çalışanı |

---

## 📑 İlgili Dokümanlar

- [UML ve Akış Diyagramları (DIAGRAMS.md)](./DIAGRAMS.md) - UML Sınıf Diyagramı, Durum Otomatı ve Mimari Akış Şeması
- [Kullanıcı Prompt Arşivi (PROMPTS.md)](./PROMPTS.md) - Proje başlangıcından itibaren verilen tüm promptların dökümü
- [Geliştirici Hızlı Başvuru (.read)](./.read) - API Endpointleri ve Teknik Referans
