import {
  Product,
  Customer,
  Company,
  CustomerOrderRecord,
  CampaignSlide,
  StockHistoryLog
} from '../../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_CUSTOMERS,
  SAMPLE_CUSTOMER_ORDERS,
  SAMPLE_HISTORY_LOGS
} from '../../data/mockData';

// Seed Companies: Each company can have multiple employees, but an employee can have only ONE company
export const INITIAL_COMPANIES: Company[] = [
  {
    id: 'COMP-001',
    name: 'Moda Vizyon Butik Ltd. Şti.',
    taxNumber: '6220194812',
    city: 'Kayseri',
    address: 'Melikgazi Mah. Alparslan Bulvarı No: 42/B, Melikgazi, Kayseri',
    phone: '+90 (352) 222 10 20',
    email: 'info@modavizyon.com',
    employeeIds: ['cust-1'], // Batu Güdek
    createdAt: '01.01.2026',
  },
  {
    id: 'COMP-002',
    name: 'Anadolu Konfeksiyon San. ve Tic. A.Ş.',
    taxNumber: '0681928410',
    city: 'İstanbul',
    address: 'Nişantaşı Abdi İpekçi Cad. No: 18 D:4, Şişli, İstanbul',
    phone: '+90 (212) 444 88 90',
    email: 'siparis@anadolukonfeksiyon.com',
    employeeIds: ['cust-2'], // Ayşe Yılmaz
    createdAt: '15.01.2026',
  },
  {
    id: 'COMP-003',
    name: 'Kapadokya Tekstil Pazarlama Ltd.',
    taxNumber: '4819201928',
    city: 'İzmir',
    address: 'Alsancak Mah. Atatürk Cad. No: 104, Konak, İzmir',
    phone: '+90 (232) 333 40 50',
    email: 'iletisim@kapadokyatekstil.com',
    employeeIds: ['cust-3'], // Mehmet Kaya
    createdAt: '01.02.2026',
  },
  {
    id: 'COMP-004',
    name: 'Ege Moda Toptan Giyim A.Ş.',
    taxNumber: '3109281745',
    city: 'Ankara',
    address: 'Tunalı Hilmi Cad. No: 78, Çankaya, Ankara',
    phone: '+90 (312) 555 12 34',
    email: 'toptan@egemoda.com',
    employeeIds: ['cust-4'], // Zeynep Demir
    createdAt: '10.02.2026',
  },
];

export const INITIAL_CAMPAIGNS: CampaignSlide[] = [
  {
    id: 'camp-1',
    badge: '%25 İNDİRİM',
    badgeType: 'discount',
    title: 'Yeni Sezon Triko & Dış Giyim',
    subtitle: 'Sonbahar/Kış 2026 Koleksiyonu',
    description: 'En çok satan İtalyan dokuma kumaş ve asortili kadın tekstil modellerinde toptan alımlara özel fırsatlar.',
    productId: 'prod-1',
    productCode: '25KTPNT5138',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200&auto=format&fit=crop&q=80',
    originalPrice: 1100,
    discountedPrice: 850,
    discountPercent: 23,
    minOrderQty: 10,
    availableStock: 52,
    validUntil: '30.10.2026',
    actionLabel: 'Koleksiyonu İncele',
    isActive: true,
  },
  {
    id: 'camp-2',
    badge: 'FLAŞ FIRSAT',
    badgeType: 'flash',
    title: 'Oversize Poplin Gömlek Serisi',
    subtitle: 'Hızlı Sevkiyat & Stok Garantisi',
    description: 'Yüksek kaliteli pamuk poplin kumaş, dökümlü kalıp ve çok satan renk asortileri ile vitrininizi yenileyin.',
    productId: 'prod-2',
    productCode: '25KTOVR6290',
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=1200&auto=format&fit=crop&q=80',
    originalPrice: 850,
    discountedPrice: 680,
    discountPercent: 20,
    minOrderQty: 15,
    availableStock: 38,
    validUntil: '15.10.2026',
    actionLabel: 'Hemen Sipariş Ver',
    isActive: true,
  },
  {
    id: 'camp-3',
    badge: 'ÖZEL SERİ',
    badgeType: 'new',
    title: 'Kruvaze Kaşe Kaban Asortileri',
    subtitle: 'Kış Sezonu Mağaza Teslimatları',
    description: 'Yün karışımlı lüks kaşe kumaş, çift düğmeli kruvaze tasarım ile butiklerin vazgeçilmez dış giyim tercihi.',
    productId: 'prod-3',
    productCode: '25KTKBN7741',
    image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=1200&auto=format&fit=crop&q=80',
    originalPrice: 3800,
    discountedPrice: 3200,
    discountPercent: 16,
    minOrderQty: 5,
    availableStock: 18,
    validUntil: '05.11.2026',
    actionLabel: 'Asorti Seçimi Yap',
    isActive: true,
  },
];

// In-Memory & LocalStorage Database Storage Keys
export const STORAGE_KEYS = {
  COMPANIES: 'stokk_db_companies_v1',
  USERS: 'stokk_db_users_v1',
  PRODUCTS: 'stokk_db_products_v1',
  ORDERS: 'stokk_db_orders_v1',
  CAMPAIGNS: 'stokk_db_campaigns_v1',
  STOCK_LOGS: 'stokk_db_stock_logs_v1',
  USER_CARTS: 'stokk_db_user_carts_v1',
};

class StokkDatabase {
  private getStorage<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key);
      if (!data) {
        this.setStorage(key, defaultValue);
        return defaultValue;
      }
      return JSON.parse(data) as T;
    } catch (e) {
      console.error(`Database read error for key: ${key}`, e);
      return defaultValue;
    }
  }

  private setStorage<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Database write error for key: ${key}`, e);
    }
  }

  // Companies Collection
  public getCompanies(): Company[] {
    return this.getStorage<Company[]>(STORAGE_KEYS.COMPANIES, INITIAL_COMPANIES);
  }

  public saveCompanies(companies: Company[]): void {
    this.setStorage(STORAGE_KEYS.COMPANIES, companies);
  }

  // Users Collection
  public getUsers(): Customer[] {
    const defaultUsers: Customer[] = INITIAL_CUSTOMERS.map((c, idx) => ({
      ...c,
      companyId: INITIAL_COMPANIES[idx % INITIAL_COMPANIES.length].id,
      companyName: INITIAL_COMPANIES[idx % INITIAL_COMPANIES.length].name,
      role: c.username === 'batugudek' ? 'Admin' : 'Customer',
    }));
    return this.getStorage<Customer[]>(STORAGE_KEYS.USERS, defaultUsers);
  }

  public saveUsers(users: Customer[]): void {
    this.setStorage(STORAGE_KEYS.USERS, users);
  }

  // Products Collection
  public getProducts(): Product[] {
    return this.getStorage<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  }

  public saveProducts(products: Product[]): void {
    this.setStorage(STORAGE_KEYS.PRODUCTS, products);
  }

  // Orders Collection
  public getOrders(): CustomerOrderRecord[] {
    return this.getStorage<CustomerOrderRecord[]>(STORAGE_KEYS.ORDERS, SAMPLE_CUSTOMER_ORDERS);
  }

  public saveOrders(orders: CustomerOrderRecord[]): void {
    this.setStorage(STORAGE_KEYS.ORDERS, orders);
  }

  // Campaigns Collection
  public getCampaigns(): CampaignSlide[] {
    return this.getStorage<CampaignSlide[]>(STORAGE_KEYS.CAMPAIGNS, INITIAL_CAMPAIGNS);
  }

  public saveCampaigns(campaigns: CampaignSlide[]): void {
    this.setStorage(STORAGE_KEYS.CAMPAIGNS, campaigns);
  }

  // Stock Logs
  public getStockLogs(): Record<string, StockHistoryLog[]> {
    return this.getStorage<Record<string, StockHistoryLog[]>>(STORAGE_KEYS.STOCK_LOGS, SAMPLE_HISTORY_LOGS);
  }

  public saveStockLogs(logs: Record<string, StockHistoryLog[]>): void {
    this.setStorage(STORAGE_KEYS.STOCK_LOGS, logs);
  }

  // User-Specific Carts (Mikroservis Sepet İzolasyonu)
  public getCartForUser(userId: string): any[] {
    const allCarts = this.getStorage<Record<string, any[]>>('stokk_db_user_carts_v1', {});
    return allCarts[userId] || [];
  }

  public saveCartForUser(userId: string, items: any[]): void {
    const allCarts = this.getStorage<Record<string, any[]>>('stokk_db_user_carts_v1', {});
    allCarts[userId] = items;
    this.setStorage('stokk_db_user_carts_v1', allCarts);
  }

  public getAllTablesSnapshot(): {
    users: Customer[];
    orders: CustomerOrderRecord[];
    products: Product[];
    companies: Company[];
    campaigns: CampaignSlide[];
    stockLogs: Record<string, StockHistoryLog[]>;
    userCarts: Record<string, any[]>;
  } {
    return {
      users: this.getUsers(),
      orders: this.getOrders(),
      products: this.getProducts(),
      companies: this.getCompanies(),
      campaigns: this.getCampaigns(),
      stockLogs: this.getStockLogs(),
      userCarts: this.getStorage<Record<string, any[]>>('stokk_db_user_carts_v1', {}),
    };
  }
}


export const db = new StokkDatabase();

// Expose globally for instant developer / browser console inspection
if (typeof window !== 'undefined') {
  (window as any).stokkDb = db;
  (window as any).getLiveDb = () => db.getAllTablesSnapshot();
}
