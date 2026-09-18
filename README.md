# Stokk. - B2B E-Ticaret & Bayi Sipariş Yönetim Portalı

[![.NET 8](https://img.shields.io/badge/.NET-8.0-512bd4.svg)](https://dotnet.microsoft.com/)
[![React 19](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev/)
[![Docker Ready](https://img.shields.io/badge/Docker-Compose-2496ed.svg)](https://www.docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Modern, ölçeklenebilir ve kurumsal düzeyde **B2B E-Ticaret, Toptan Satış ve Bayi Sipariş Yönetim Platformu**.  
React 19 + TypeScript + Tailwind CSS modern arayüzü ve **ASP.NET Core 8 Web API + Entity Framework Core** tak-çalıştır arka yüzü ile birlikte gelir.

Geliştiricilerin ve işletmelerin **kendi veritabanlarını (PostgreSQL, Microsoft SQL Server, MySQL veya SQLite)** tek satırlık ayarla bağlayabileceği ya da **Docker Compose** ile tek bir komutla tüm sistemi (PostgreSQL + .NET Backend + React SPA) ayağa kaldırabileceği şekilde mimarilendirilmiştir.

---

## 🎯 Bu Uygulama Ne İşe Yarar?

Toptancı, üretici veya distribütör firmalar ile bunların bayi ağı (müşterileri) arasındaki sipariş ve stok operasyonlarını uçtan uca dijitalleştirir:

1. **Telefon / WhatsApp ile Sipariş Alma Karmaşasına Son Verir:**
   - Bayiler vitrinde güncel ürünleri, stok durumunu ve kampanya sliderlarını görerek doğrudan sepete ekler ve sipariş geçer.
2. **Kullanıcı & Veri İzolasyonu Sağlar:**
   - Bayiler birbirinin siparişlerini, sepetlerini veya cari bilgilerini **kesinlikle göremez** (Ayşe Yılmaz kendi sepetini görür, Veli Kaya kendi sepetini görür).
3. **Şirket - Çalışan İlişkisini Disipline Eder (1-N Kuralı):**
   - Bir şirketin birden fazla çalışanı olabilir; ancak her çalışan sisteme yalnızca tek bir şirket üzerinden kayıt edilebilir.
4. **Fiyat Dalgalanmalarına Karşı Sipariş Geçmişini Korur:**
   - Sipariş verildiği anda o anki birim fiyat kaleme dondurularak kaydedilir. Ürünün fiyatı gelecekte değişse dahi geçmiş siparişin fiyatı asla bozulmaz.
5. **Kritik Stok Uyarısı ve Otomatik Renk Kodlaması:**
   - Her ürünün bağımsız kritik stok eşiği (`criticalStockThreshold`) vardır. Stok 0 ise kırmızı, eşik altındaysa sarı, üzerindeyse yeşil renkle bayiye güvenli alışveriş imkanı sunar.
6. **Esnek Ödeme Yöntemi Desteği:**
   - Müşteri siparişi tamamlarken **Nakit**, **Çek** veya **Bakiye** ödeme tercihlerinden birini seçer.
7. **Kilitli Sipariş Durum Otomatı:**
   - Yönetici (Batu Güdek) siparişi onaylar, reddeder veya yola çıkarır. Onaylanan sipariş sonradan reddedilemez; teslim edilen sipariş nihai kilitlenir.

---

## ⚙️ Bu Uygulama Nasıl Çalışır?

Sistem katmanlı ve mikroservis veri izolasyonu prensiplerine göre çalışır:

```
[Kullanıcı Tarayıcısı] 
       │
       ▼
[React 19 Frontend (SPA)]  ──(Port 3000 / Nginx)
       │
       ├──► [REST API / JSON]  ──(Port 5000 / ASP.NET Core 8 Web API)
       │           │
       │           ├──► [Entity Framework Core 8 Soyutlama Katmanı]
       │           │           │
       │           │           ├──► [PostgreSQL]  (Kurumsal Üretim)
       │           │           ├──► [SQL Server]  (Windows / Azure)
       │           │           └──► [SQLite]      (Sıfır Kurulum, Yerel Dosya)
       │           │
       └──► [Fallback / Çevrimdışı Mod] (LocalStorage mikroservis veritabanı)
```

1. **İstemci Katmanı (Client):** Kullanıcı oturum açtığında rolü belirlenir (Yönetici `batugudek` veya Bayi Müşterisi).
2. **İstek Yönlendirme:** İstemci, sepet ve sipariş isteklerini doğrudan kullanıcının `userId` kimliğiyle API'ye gönderir.
3. **Backend İş Mantığı:** API controller'ları sipariş oluştururken stok kontrolü yapar, stoktan otomatik düşer, stok hareket logunu kaydeder ve sepeti temizler.
4. **Veritabanı Sağlayıcısı:** Entity Framework Core, seçilen veritabanı motoru üzerinde çalışır ve başlangıçta eksik tabloları ve tohum verilerini (`DbInitializer`) otomatik hazırlar.

---

## 🔌 Kullanacak Kişi Kendine Nasıl Entegre Eder?

### Adım 1: Kendi Veritabanınızı Bağlama (30 Saniyede)

`backend/Stokk.Api/appsettings.json` dosyasını açın ve `DatabaseProvider` seçiminizi yapın:

```json
{
  "DatabaseProvider": "PostgreSql", // "PostgreSql" | "SqlServer" | "Sqlite" | "InMemory"
  "ConnectionStrings": {
    "Sqlite": "Data Source=stokk_app.db",
    "PostgreSql": "Host=localhost;Port=5432;Database=kendi_veritabaniniz;Username=postgres;Password=sifreniz",
    "SqlServer": "Server=localhost;Database=KendiStokkDb;Trusted_Connection=True;TrustServerCertificate=True"
  }
}
```
> Projeyi başlattığınız anda tüm tablolar ve ilişkiler seçtiğiniz veritabanında **otomatik olarak oluşturulur**.

---

### Adım 2: Kendi ERP / Muhasebe Yazılımınıza Bağlama (Logo, Mikro, SAP, Netsis)

Platform, standart RESTful JSON API'leri sunduğu için muhasebe programlarınızla kolayca entegre edilebilir:

- **Ürün & Stok Senkronizasyonu:**  
  ERP sisteminizden her gece veya anlık olarak `POST /api/products` ve `PUT /api/products/{id}/stock` çağrısı yaparak stokları eşitleyebilirsiniz.
- **Siparişleri ERP'ye Çekme:**  
  `GET /api/orders` endpointini dinleyerek yeni düşen siparişleri (ödeme yöntemi: Nakit/Çek/Bakiye bilgisiyle) muhasebenize otomatik fatura veya irsaliye olarak aktarabilirsiniz.
- **Cari Kart Açma:**  
  Yeni bayi kayıt olduğunda `POST /api/auth/register` üzerinden ERP'nizde cari hesap açtırabilirsiniz.

---

### Adım 3: Kendi Alanlarınızı ve Modellerinizi Genişletme

Kodlar modüler C# sınıfları halinde yazılmıştır:
- Yeni alanlar eklemek için `backend/Stokk.Api/Models/Entities/` altındaki varlıklara (örn: `Barcode`, `VatRate`, `CreditLimit`) property eklemeniz yeterlidir.
- Entity Framework Core otomatik olarak tablo sütunlarını güncelleyecektir.

---

### Adım 4: Marka ve Kurumsal Kimlik Özelleştirme

- Logo ve Başlık: `src/components/Sidebar.tsx` ve `src/components/Header.tsx` içerisindeki logo resim URL'sini ve marka ismini değiştirin.
- Renk Paleti: `src/index.css` ve Tailwind sınıflarındaki `#006194` rengini kendi kurumsal renginizle güncelleyin.

---

## 🐳 Docker ile Tek Komutta Kurulum (Recommended)

Sistemde Docker yüklüyse, hiçbir SDK (Node veya .NET) kurmanıza gerek kalmadan PostgreSQL, .NET Web API ve React uygulamasını tek komutla çalıştırabilirsiniz:

```bash
# Tüm sistemi (PostgreSQL + Backend + Frontend) başlat
docker compose up -d --build
```

- **Frontend (Web Portalı):** `http://localhost:3000`
- **Backend (REST API):** `http://localhost:5000`
- **Swagger API Dokümantasyonu:** `http://localhost:5000/swagger`
- **PostgreSQL Veritabanı:** Port `5432` üzerinde çalışır; veriler `stokk_pgdata` volume'ünde kalıcı saklanır.

Durdurmak için:
```bash
docker compose down
```

---

## 💻 Yerel Geliştirme (Local Setup)

### 1. Backend (.NET 8 Web API)
```bash
cd backend/Stokk.Api
dotnet restore
dotnet run
```
Backend `http://localhost:5000` üzerinde açılır.

### 2. Frontend (React 19)
```bash
npm install
npm run dev
```
Frontend `http://localhost:3000` üzerinde açılır.

---

## 🛠️ Kullanılan Teknolojiler ve Mimari Desenler

### Teknolojiler
- **Frontend:** React 19, TypeScript, Tailwind CSS, Vite, Lucide Icons
- **Backend:** .NET 8 (ASP.NET Core Web API), C# 12
- **ORM & Veri Erişimi:** Entity Framework Core 8
- **Veritabanları:** PostgreSQL (Npgsql), Microsoft SQL Server, SQLite, In-Memory
- **Konteynerizasyon:** Docker, Docker Compose, Nginx Alpine Reverse Proxy
- **Dokümantasyon:** Swagger / OpenAPI

### Mimari Desenler (Design Patterns)
- **Katmanlı Mimari (N-Tier / Clean Architecture):** Controllers -> Entities / DTOs -> DbContext -> Database Providers.
- **Pluggable Strategy Pattern:** `DatabaseProvider` seçimine göre çalışma zamanında doğru veritabanı sürücüsünü dinamik olarak enjekte eder.
- **Microservice User Isolation Pattern:** Kullanıcıların sepet ve sipariş kayıtları `userId` bazında mutlak şekilde yalıtılmıştır.
- **Finite State Machine (FSM):** Siparişlerin durum geçişleri katı kurallarla kilitlenmiştir (`Hazırlanıyor` -> `Onaylandı`/`Reddedildi` -> `Yolda` -> `Teslim Edildi`).
- **Snapshot Pattern:** Satış anındaki birim fiyat ve sipariş kalemleri geçmiş fiyat artışlarından etkilenmeyecek şekilde dondurulur.

---

## 🔑 Varsayılan Kullanıcı Hesapları

| Rol | Kullanıcı Adı | Şifre | Açıklama |
|---|---|---|---|
| **Yönetici (Admin)** | `batugudek` | `Batu12345*` | Batu Güdek - Siparişleri onaylama, ürün/kullanıcı yönetimi, Canlı DB İzleme |
| **Bayi Müşterisi 1** | `ayseyilmaz` | `Password123*` | Ayşe Yılmaz - Moda Vizyon Butik Ltd. Şti. |
| **Bayi Müşterisi 2** | `velikaya` | `Password123*` | Veli Kaya - Kapadokya Tekstil Pazarlama Ltd. |

---

## 📚 Dokümantasyon Belgeleri

- [UML ve Akış Diyagramları (DIAGRAMS.md)](./DIAGRAMS.md) - UML Sınıf Şeması, Durum Otomatı ve Sıralama Diyagramları
- [Kullanıcı Prompt Arşivi (PROMPTS.md)](./PROMPTS.md) - Proje başından bu yana verilen tüm promptların dökümü
- [Geliştirici Teknik Özeti (.read)](./.read) - API Endpointleri ve Teknik Referans Notları
