# Stokk B2B Portalı - Kullanıcı Prompt Arşivi (Prompt History)

Bu dosya, projenin ilk başlangıcından günümüze kadar verilen tüm kullanıcı talimat ve promptlarının eksiksiz ve kronolojik bir dökümünü içermektedir.

---

### Prompt 1: Proje Başlatma
- **Tarih / Saat:** 18.09.2026 20:03:41
```text
başlat
```
- **Sonuç:** Proje ortamı kontrol edildi, temel yapılandırma başlatıldı.

---

### Prompt 2: Ürün Listeleme, Sepet İşlemleri, Sipariş Oluşturma ve Stok Kontrolü
- **Tarih / Saat:** 18.09.2026 20:06:00
```text
ÜRÜN LİSTELEME
-Tablo grid satır bazlı liste
-ürün görseli (küçük boy)
-ürün kodu
-ürün adı
-marka
-stok durumu (rengi gözükecek)
-fiyatı
-adet girişi ve sepete ekle aksyionu
yapılandırılabilir kolonlar olmalı fitreler eklenebilir ve çıkarılabilir olmalı, telefona tablete göre uyum sağlamalı.
SEPET İŞLEMLERİ
-ürün
-birim fiyatı
-adet
toplam ürün tutuarı
-sepet toplamı
-adet değiştirme ve sepetten çıakrtma opsiyonu olsun
SİPARİŞ OLUŞTURMA VE STOK KONTROLU
SİPARİŞ BİLGİLERİ
-sipariş id
-sipariş numarası
-kullanıcı ıd
-sipariş tarihi
-sipariş durumu
-toplam tutar
SİPARİŞ KALEMLERİ
-SİPARİŞ İD
-ÜRÜN İD
-ÜRÜN KODU
-URUN ADI
-ADET
-BİRİM FİYATI
-toplam fiyat
SONRADA FİYATI DEĞİŞEN ÜRÜ SATILDIĞINDA SATILDIĞI ANDAKİ FİYAT SABİT KALIR YENİ SATILDIĞINDA YENİ FİYAT İŞLER ÖNCEDEN SATILMIŞ FİYAT ETKİLENMEZ.
SİPARİŞLERİM
-sipariş listesi
-sipariş numarası
tarih
toplam tutar
durum
```
- **Sonuç:** Dinamik ürün grid listesi, yapılandırılabilir sütunlar, sepet yönetimi, sipariş anında birim fiyat dondurma ve müşteri "Siparişlerim" ekranı inşa edildi.

---

### Prompt 3: Plan Onayı
- **Tarih / Saat:** 18.09.2026 20:12:11
```text
(Uygulama Planı Onaylandı - Proceed)
```

---

### Prompt 4: Yönetici (Batu Güdek) Girişi, Kullanıcı İzolasyonu & 1-N Şirket Kuralı
- **Tarih / Saat:** 18.09.2026 20:24:53
```text
batu güdek yönetici olacak ve giriş yerinde yönetici girişi ayrı buton koy oraya batu güdek bilgileri girildiğinde giriş yap harici hata ver kullanıcıların, ürünlerin, siparişlerin, operasyonların hepsinin databaseni hazırla. kullanıcı kaydolduğunda kullanıcılar olarak listelenebilsin, ürünler siparişler aynı şekilde. siparişler kullanıcıya özel olacak örnek olarak ayşe velinin verdiği sioparişi göremez bunlar kullanıcıya özgü mikroservislere böl bu alanları. Kullanıcılar altında kullanıcılar, rünler altında ürünler, siparişler altında siparişler mikroservislere bölünecek bunlar eklenip çıkarılırken veya işlem olurken birbirinden etkilenmeyecek. kullanıcı kayıtta şirket sor şirketlere ıd ata her şirketin birden fazla çalışanı olabilir ama bir çalışan birden fazla şirkette olamaz ıd bağlantıları yaparken buna dikkat et. siparişler verilince stoklarla bağlantılı olması lazım database bağlantısı önemli
```
- **Sonuç:** Giriş ekranında bağımsız Yönetici Girişi butonu (yalnızca Batu Güdek kabul edilir), mikroservis veritabanı altyapısı, sipariş kullanıcı izolasyonu (Ayşe - Veli veri ayrımı), 1-N şirket kuralı ve stok düşüm tetikleyicileri entegre edildi.

---

### Prompt 5: Plan Onayı
- **Tarih / Saat:** 18.09.2026 20:25:43
```text
(Uygulama Planı Onaylandı - Proceed)
```

---

### Prompt 6: Yönetim Paneli Menü Yapısı ve Fonksiyonları
- **Tarih / Saat:** 18.09.2026 20:30:53
```text
oluşturduğun yönetim paneli, yönetici giriş yaptıktan sonra aynı konseptte fakat soldaki menüde üç buton olacak sipariş yönetimi ,ürün yönetimi ve kullanıcı yönetimi. ürün yönetimi tıklandığında ürün ekleme seçenekleri ürün kodu ürün adı açıklaam üretici kodu üretici marka çzel kod 1 özel kod 2 resim stok miktarı fiyat bilgisi girilecek. bu normal kullanıcıların görebileceği şekildeydi onu ordan kaldır. kullanıcı yönetimine tıkladığında ad soyad e-posta telefon kullanıcı ıd şifre (şifreli biçimde) olacak bu da diğer alandaydı ordan kaldır. sipariş yönetimi kısmında sipariş numarası sipariş tarihi sipariş oluşturan kullanıcı sipariş toplam tutar sipariş durumu bunu yönetici yönetecek. sipariş detayına tıklandığında ürün ürün kodu adet birim fiyatı toplam fiyat gözükecek. Sipariş durumu onaylandı reddedildi veya yolda olarak güncellenecek.  ek olarak sliderdaki kampanyaların yönetildiği bir buton olacak burada sliderdaki reklamlar tanıtımlar eklenip düzenlenecek.
```
- **Sonuç:** Yönetici menüsü 4 ana butona (Sipariş Yönetimi, Ürün Yönetimi, Kullanıcı Yönetimi, Slider Kampanya Yönetimi) ayrıldı; yetkisiz erişimler kaldırıldı.

---

### Prompt 7: İşlem Devamı
- **Tarih / Saat:** 18.09.2026 20:50:34
```text
önceki işlemi tamamla
```

---

### Prompt 8: Yönetim Paneli Menüsü Yeniden Vurgulama
- **Tarih / Saat:** 18.09.2026 20:50:36
```text
oluşturduğun yönetim paneli, yönetici giriş yaptıktan sonra aynı konseptte fakat soldaki menüde üç buton olacak sipariş yönetimi ,ürün yönetimi ve kullanıcı yönetimi...
```

---

### Prompt 9: Tamamlanmayan İşlemlerin Bitirilmesi
- **Tarih / Saat:** 18.09.2026 21:13:30
```text
tamamlanmayan işlemleri tamamla
```

---

### Prompt 10: Ürüne Özel Kritik Stok Eşiği, Sipariş Durum Otomatı ve Sepet İzolasyonu
- **Tarih / Saat:** 18.09.2026 21:28:41
```text
stokların renklerinin değişmesini her üründe farklı yap 0 ürün için hepsi kırmızı olsun ama sarı için bazısında 3 iken mesela bazısında 7 olsun. Durum güncellemesi teslim edildi seçeneği yok onu ekle ona basıldığında teslim edilenlere düşsün ve durumu değiştirilemesin. onaylanınca onaylananlara düşsün reddedilemesin sadece yolda diye işaretlenebilsin sonrasında, reddedilince onaylanamasın veya yolda olarak işaretlenemesin. yeni kullanıcı oluşturdum sepeti dolu geldi  her kullanıcının kendine özel sepeti, siparişleri olaca mikroservislerde. kullanıcıların girişlerde kullanıcı adı şifresi uyuşuyor mu kontrol et. farklı kullanıcı adı ve şifrelerle giriş yapılabiliyor şuan. B2B portalda son şubeler arası trasnferler kısmını kaldır.depolar arası transferler kısmını kaldır. yönetici panelinde ürün ekleme sırasında eşik stok bilgisi girilebilsin o eşikte renk yeşilden sarıya dönsün.
```
- **Sonuç:** Her ürüne özel `criticalStockThreshold` tanımlandı (0 = kırmızı, <= eşik = sarı, > eşik = yeşil). Durum otomatı (`Hazırlanıyor` -> `Onaylandı`/`Reddedildi` -> `Yolda` -> `Teslim Edildi`) kilit kurallarıyla uygulandı. Sepet izolasyonu bağlandı, giriş doğrulamaları sıkılaştırıldı ve transfer blokları kaldırıldı.

---

### Prompt 11: Kayıt Formu Kısıtlamaları, Sipariş Sahipliği ve Durum Güncelleme Yetkisi
- **Tarih / Saat:** 18.09.2026 21:37:33
```text
kullanıcı kayıt kısmında yazı girilecek yerlere rakam girilmesin, numara kısmı haneyle sınırlandırılsın. ayse sipariş veriyor sepete gidiyor sipariş sahibi kısmında diğer müşteriler de çıkıyor bu ayse hesabındaki sepet başkası adına sipariş veremez her kullanıcı için kendi kullanıcısı sipariş verecek. sipariş veren kullanıcı siparişlerimde baktığında detaya basıp siparişi onaylayabiliyor veya durumla ilgili değişiklik yapabliyor bu sadece yöneticinin görevi.
```
- **Sonuç:** Kayıt formunda ad, soyad ve şehir alanlarında rakam girişi engellendi (`regex`); telefon 11 hane ile sınırlandırıldı. Sepetten sipariş veren kullanıcı kilitlendi. Müşteri sipariş detayından durum değiştirme yetkisi kaldırıldı.

---

### Prompt 12: Sipariş Ekranında Ödeme Yöntemi Seçimi
- **Tarih / Saat:** 18.09.2026 21:46:00
```text
sipariş ekranında ödeme yöntemi seçimi olsun bu seçeneklerde nakit, çek, bakiye seçenekleri olsun bunlardan birini seçsin kullanıcı.
```
- **Sonuç:** `CartView.tsx` içerisine Nakit, Çek, Bakiye radyo butonları eklendi. Sipariş modeline ve servislerine `paymentMethod` bağlandı, sipariş listeleri ve modallarında rozetler gösterildi.

---

### Prompt 13: Kullanıcı İzolasyon Test Butonlarının Silinmesi ve Veritabanı İzleme
- **Tarih / Saat:** 18.09.2026 21:57:41
```text
kullanıcı izolasyonu testi kısmını sil ve ben güncel databasei nasıl izlerim
```
- **Sonuç:** Giriş ekranındaki hızlı giriş demo butonları silindi. Canlı veritabanını izlemek için sistem içi "Canlı DB İzle" modalı yapıldı, DevTools ve Console yöntemleri anlatıldı.

---

### Prompt 14: Canlı DB İzlemenin Yalnızca Yöneticiye Özgü Kılınması
- **Tarih / Saat:** 18.09.2026 22:02:58
```text
canlı db izleme sadece yöneticiye özgü olmalı
```
- **Sonuç:** "Canlı DB İzle" butonu ve modalı yalnızca `role === 'Admin'` olan oturumlarda render edilecek şekilde izole edildi, müşterilerden tamamen gizlendi.

---

### Prompt 15: Çoklu DB (.NET Backend), UML ve Çalışma Diyagramları, README & .read ve GitHub Push
- **Tarih / Saat:** 18.09.2026 22:06:54
```text
bu koda insanlar kendi db bağlayabilsin ve kullanabilsin, ürün kullanıcı, siparişler vs buna göre düzenleme yap bütün kodlar .net olarak ver, bunu githubda paylaşacağım hem readme hem dotread ekle , bana bu uygulamanın UML diagramını çalışma diagramını şimdiye kadar yazdığım promptları, hazırla ve github hesabıma pushla
```
- **Sonuç:** Entity Framework Core tabanlı çoklu veritabanı (PostgreSQL, SQL Server, SQLite, InMemory) destekli ASP.NET Core 8 Web API backend'i (`backend/Stokk.Api`) inşa edildi. UML ve akış diyagramları (`DIAGRAMS.md`), kullanıcı prompt arşivi (`PROMPTS.md`), kapsamlı `README.md` ve `.read` dokümantasyonu hazırlandı.
