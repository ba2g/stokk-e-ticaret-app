import { Product, VariantItem } from '../types';
import { db } from './db/database';

export interface CreateProductDto {
  code: string; // Ürün Kodu
  name: string; // Ürün Adı
  description: string; // Açıklama
  manufacturerCode?: string; // Üretici Kodu
  manufacturer: string; // Üretici
  brand: string; // Marka
  specialCode1?: string; // Özel Kod 1
  specialCode2?: string; // Özel Kod 2
  image: string; // Resim URL
  stockQuantity: number; // Stok Miktarı
  price: number; // Fiyat
  category?: string;
  productType?: string;
  season?: string;
  criticalStockThreshold?: number;
}

export class ProductService {
  /**
   * Get all products
   */
  public getProducts(): Product[] {
    return db.getProducts();
  }

  /**
   * Get product by ID
   */
  public getProductById(id: string): Product | undefined {
    return db.getProducts().find((p) => p.id === id);
  }

  /**
   * Add new product (Yönetici Ürün Ekleme Seçenekleri)
   */
  public addProduct(dto: CreateProductDto): Product {
    const products = db.getProducts();
    const newId = `prod-${Date.now()}`;
    const stock = Math.max(0, dto.stockQuantity);

    // Default variant based on stock
    const defaultVariants: VariantItem[] = [
      {
        id: `v-${Date.now()}-1`,
        colorName: 'Standart',
        colorHex: '#1e3a8a',
        size: 'Standart',
        sku: `${dto.code}-STD`,
        toShip: 0,
        available: stock,
        onHand: stock,
        incoming: 0,
        status: stock <= 0 ? 'Tükendi' : stock <= (dto.criticalStockThreshold || 10) ? 'Kritik' : 'Normal',
        barcode: `8680${Math.floor(10000000 + Math.random() * 90000000)}`,
        shelfLocation: 'A-01',
      },
    ];

    const newProduct: Product = {
      id: newId,
      code: dto.code.trim().toUpperCase(),
      name: dto.name.trim(),
      description: dto.description.trim(),
      manufacturerCode: dto.manufacturerCode?.trim(),
      manufacturer: dto.manufacturer.trim(),
      brand: dto.brand.trim(),
      specialCode1: dto.specialCode1?.trim(),
      specialCode2: dto.specialCode2?.trim(),
      image: dto.image.trim() || 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&q=80',
      price: Math.max(0, dto.price),
      currency: '₺',
      category: dto.category?.trim() || 'Kadın Tekstil',
      productType: dto.productType?.trim() || 'Pantolon',
      season: dto.season?.trim() || 'Sonbahar/Kış 2026',
      criticalStockThreshold: dto.criticalStockThreshold || 10,
      totalOnHand: stock,
      totalIncoming: 0,
      availableStock: stock,
      toShipTotal: 0,
      colors: [{ name: 'Standart', hex: '#1e3a8a' }],
      location: 'Kayseri Mağaza',
      shelfLocation: 'A-01',
      incomingDeliveryDate: 'Stokta',
      features: ['Özel Seri', dto.brand],
      variants: defaultVariants,
    };

    const updated = [newProduct, ...products];
    db.saveProducts(updated);
    return newProduct;
  }

  /**
   * Update existing product
   */
  public updateProduct(product: Product): void {
    const products = db.getProducts().map((p) => (p.id === product.id ? product : p));
    db.saveProducts(products);
  }

  /**
   * Delete product
   */
  public deleteProduct(id: string): void {
    const products = db.getProducts().filter((p) => p.id !== id);
    db.saveProducts(products);
  }

  /**
   * Deduct stock for an order
   */
  public deductStock(productId: string, quantity: number): boolean {
    const products = db.getProducts();
    const target = products.find((p) => p.id === productId);
    if (!target || target.totalOnHand < quantity) return false;

    const newOnHand = target.totalOnHand - quantity;
    const newAvailable = Math.max(0, target.availableStock - quantity);

    let remaining = quantity;
    const updatedVariants = target.variants.map((v) => {
      if (remaining <= 0 || v.onHand <= 0) return v;
      const deduct = Math.min(v.onHand, remaining);
      remaining -= deduct;
      const nextOnHand = Math.max(0, v.onHand - deduct);
      return {
        ...v,
        onHand: nextOnHand,
        available: Math.max(0, v.available - deduct),
        status: nextOnHand <= 0 ? ('Tükendi' as const) : ('Normal' as const),
      };
    });

    const updatedProduct: Product = {
      ...target,
      totalOnHand: newOnHand,
      availableStock: newAvailable,
      variants: updatedVariants,
    };

    this.updateProduct(updatedProduct);
    return true;
  }

  /**
   * Restore stock (e.g. if order is cancelled or rejected)
   */
  public restoreStock(productId: string, quantity: number): void {
    const products = db.getProducts();
    const target = products.find((p) => p.id === productId);
    if (!target) return;

    const newOnHand = target.totalOnHand + quantity;
    const newAvailable = target.availableStock + quantity;

    const updatedVariants = target.variants.map((v, idx) => {
      if (idx === 0) {
        return {
          ...v,
          onHand: v.onHand + quantity,
          available: v.available + quantity,
          status: 'Normal' as const,
        };
      }
      return v;
    });

    const updatedProduct: Product = {
      ...target,
      totalOnHand: newOnHand,
      availableStock: newAvailable,
      variants: updatedVariants,
    };

    this.updateProduct(updatedProduct);
  }

  /**
   * Update product price (does not affect historical orders)
   */
  public updateProductPrice(productId: string, newPrice: number): void {
    const products = db.getProducts();
    const target = products.find((p) => p.id === productId);
    if (!target) return;
    this.updateProduct({ ...target, price: newPrice });
  }
}

export const productService = new ProductService();
