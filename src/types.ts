export type InventoryStatus = 'Normal' | 'Kritik' | 'Tükendi' | 'Stokta Var' | 'Ters Bakiye';

export interface VariantItem {
  id: string;
  colorName: string;
  colorHex: string;
  size: string;
  sku: string;
  toShip: number; // Sevk Edilecek
  available: number; // Kullanılabilir
  onHand: number; // Eldeki Stok
  incoming: number; // Gelecek Miktar
  status: InventoryStatus;
  barcode: string;
  shelfLocation: string;
}

export interface Product {
  id: string;
  name: string;
  code: string;
  brand: string; // Marka (örn: Stokk Collection, Stokk Studio)
  manufacturer: string; // Üretici (örn: Stokk Tekstil San. Tic. A.Ş.)
  manufacturerCode?: string; // Üretici Kodu (örn: URT-STK-5138)
  category: string; // Kategori (Kadın Tekstil, Erkek Tekstil, Dış Giyim vb.)
  productType: string; // Ürün Türü (Pantolon, Gömlek, Kazak, Kaban vb.)
  season: string; // Sezon (Sonbahar/Kış 2026, İlkbahar/Yaz 2026 vb.)
  features: string[]; // Özellikler (Kumaş, Kalıp, Pamuk, Likra, Flare vb.)
  description: string; // Ürün Açıklaması
  image: string;
  price: number; // Fiyat (TL)
  currency: string; // '₺'
  specialCode1?: string; // Özel Kod 1
  specialCode2?: string; // Özel Kod 2
  criticalStockThreshold: number; // Ürün bazında tanımlanabilir kritik stok eşiği (sabit değil)
  totalOnHand: number;
  totalIncoming: number;
  availableStock: number;
  toShipTotal: number;
  colors: { name: string; hex: string }[];
  location: string;
  shelfLocation: string;
  incomingDeliveryDate: string;
  variants: VariantItem[];
}

export interface CartItem {
  id: string;
  productId: string;
  productCode: string;
  productName: string;
  manufacturerCode?: string;
  brand: string;
  image: string;
  variantId?: string;
  colorName?: string;
  size?: string;
  sku?: string;
  quantity: number;
  unitPrice: number; // Sepete eklendiği andaki birim fiyat
  totalPrice: number; // quantity * unitPrice
  availableStock: number; // Kontrol için eldeki stok
}

export interface OrderLineItem {
  orderId: string;
  productId: string;
  productCode: string;
  productName: string;
  quantity: number;
  unitPrice: number; // Satıldığı andaki fiyat (sabit kalır)
  totalPrice: number; // quantity * unitPrice
  colorName?: string;
  size?: string;
  sku?: string;
}

export interface CustomerOrderRecord {
  id: string; // sipariş id
  orderNo: string; // sipariş numarası
  customerId: string; // kullanıcı id
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  companyId?: string; // Şirket ID
  companyName?: string;
  orderDate: string; // sipariş tarihi
  status: 'Onaylandı' | 'Reddedildi' | 'Yolda' | 'Kargoda' | 'Hazırlanıyor' | 'Teslim Edildi' | 'İptal Edildi'; // sipariş durumu
  totalAmount: number; // toplam tutar
  paymentMethod?: 'Nakit' | 'Çek' | 'Bakiye'; // Ödeme Yöntemi
  items: OrderLineItem[]; // sipariş kalemleri
  shippingAddress?: string;
}

export type GridRenderType =
  | 'image'
  | 'code'
  | 'text'
  | 'brand'
  | 'stock_badge'
  | 'price'
  | 'quick_order_action'
  | 'category'
  | 'season'
  | 'variants_preview';

export interface GridColumnConfig {
  id: string;
  label: string;
  field: keyof Product | 'quick_order_action' | 'stock_badge';
  renderType: GridRenderType;
  visible: boolean;
  order: number;
  width?: string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
}

export interface StockHistoryLog {
  id: string;
  date: string;
  type: 'Satış Faturası' | 'Depo Transferi' | 'İrsaliye Kabulü' | 'Sayım Farkı' | 'İade Girişi';
  referenceNo: string;
  changeAmount: number;
  balanceAfter: number;
  operator: string;
  description: string;
}

export interface Company {
  id: string; // Benzersiz Şirket ID (örn: COMP-001)
  name: string; // Şirket Ünvanı
  taxNumber?: string; // Vergi Numarası
  city?: string;
  address?: string;
  phone?: string;
  email?: string;
  employeeIds: string[]; // 1 şirketin birden fazla çalışanı olabilir!
  createdAt: string;
}

export interface Customer {
  id: string;
  firstName: string; // Ad
  lastName: string; // Soyad
  email: string; // E-posta
  phone: string; // Telefon
  username: string; // Kullanıcı Adı
  password?: string; // Şifre
  avatar?: string;
  city?: string;
  address?: string;
  companyId?: string; // Bir çalışan/kullanıcı YALNIZCA 1 şirkette olabilir!
  companyName?: string;
  role?: 'Admin' | 'Customer'; // Kullanıcı rolü
  totalOrders: number;
  totalSpent: number;
  status: 'Aktif' | 'Pasif' | 'Onay Bekliyor';
  createdAt: string;
}

export interface StoreLocation {
  id: string;
  name: string;
  type: 'Mağaza' | 'Merkez Depo' | 'Bölge Depo';
  code: string;
}

export interface TransferRecord {
  id: string;
  code: string;
  fromLocation: string;
  toLocation: string;
  sku: string;
  productName: string;
  variant: string;
  quantity: number;
  status: 'Hazırlanıyor' | 'Yolda' | 'Teslim Alındı' | 'Onay Bekliyor';
  date: string;
}

export interface OrderItem {
  id: string;
  orderNo: string;
  customerName: string;
  date: string;
  itemCount: number;
  totalAmount: number;
  status: 'Hazırlanıyor' | 'Faturalandı' | 'Beklemede' | 'Sevk Edildi';
  paymentStatus: 'Ödendi' | 'Cari Hesap' | 'Kısmi Ödeme';
}

export interface CustomerAccount {
  id: string;
  companyName: string;
  city: string;
  authorizedPerson: string;
  creditLimit: number;
  currentBalance: number;
  openOrderCount: number;
}

export interface CampaignSlide {
  id: string;
  badge: string; // e.g., '%25 İNDİRİM', 'SEZON KAMPANYASI', 'FLAŞ FIRSAT'
  badgeType: 'discount' | 'campaign' | 'new' | 'flash';
  title: string;
  subtitle: string;
  description: string;
  productId: string;
  productCode: string;
  image: string;
  originalPrice: number;
  discountedPrice: number;
  discountPercent: number;
  minOrderQty: number;
  availableStock: number;
  validUntil: string;
  actionLabel: string;
  isActive?: boolean; // Aktiflik Durumu
}
