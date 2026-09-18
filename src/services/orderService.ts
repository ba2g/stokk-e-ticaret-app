import { CustomerOrderRecord, OrderLineItem, CartItem, Customer } from '../types';
import { db } from './db/database';
import { productService } from './productService';

export class OrderService {
  /**
   * Get ALL orders (Admin only - Batu Güdek)
   */
  public getAllOrders(): CustomerOrderRecord[] {
    return db.getOrders();
  }

  /**
   * USER SCOPED ORDERS:
   * STRICT ISOLATION RULE:
   * Ayşe CANNOT see Veli's orders.
   * Returns ONLY the orders placed by this specific userId (or user's company).
   */
  public getOrdersForUser(userId: string): CustomerOrderRecord[] {
    const all = db.getOrders();
    return all.filter((o) => o.customerId === userId);
  }

  /**
   * Create order linked with stock
   */
  public createOrder(
    user: Customer,
    cartItems: CartItem[],
    notes?: string,
    paymentMethod: 'Nakit' | 'Çek' | 'Bakiye' = 'Nakit'
  ): { success: boolean; order?: CustomerOrderRecord; error?: string } {
    if (cartItems.length === 0) {
      return { success: false, error: 'Sepetinizde ürün bulunmamaktadır.' };
    }

    // 1. Stock check
    for (const item of cartItems) {
      const prod = productService.getProductById(item.productId);
      if (!prod || prod.totalOnHand < item.quantity) {
        return {
          success: false,
          error: `Yetersiz stok: '${item.productName}' için mevcut stok (${prod ? prod.totalOnHand : 0}) talep edilen adedi karşılamıyor.`,
        };
      }
    }

    // 2. Deduct stock from products
    for (const item of cartItems) {
      productService.deductStock(item.productId, item.quantity);
    }

    const orderId = `ord-${Date.now()}`;
    const orderNo = `SIP-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const subtotal = cartItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const vat = Math.round(subtotal * 0.10);
    const totalAmount = subtotal + vat;

    // Snapshot line items with historical frozen prices
    const items: OrderLineItem[] = cartItems.map((item) => ({
      orderId,
      productId: item.productId,
      productCode: item.productCode,
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice, // Satıldığı andaki fiyat sabit kalır!
      totalPrice: item.quantity * item.unitPrice,
    }));

    const newOrder: CustomerOrderRecord = {
      id: orderId,
      orderNo,
      customerId: user.id, // Kullanıcıya bağlandı
      customerName: `${user.firstName} ${user.lastName}`,
      customerEmail: user.email,
      customerPhone: user.phone,
      companyId: user.companyId,
      companyName: user.companyName,
      orderDate: new Date().toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      status: 'Hazırlanıyor',
      totalAmount,
      paymentMethod,
      items,
      shippingAddress: user.address || `${user.city || 'Kayseri'}, Türkiye`,
    };

    const currentOrders = db.getOrders();
    db.saveOrders([newOrder, ...currentOrders]);

    return { success: true, order: newOrder };
  }

  /**
   * Update order status by Admin ('Onaylandı', 'Reddedildi', 'Yolda')
   * If 'Reddedildi' (Cancelled), restore stock!
   */
  public updateOrderStatus(
    orderId: string,
    newStatus: CustomerOrderRecord['status']
  ): CustomerOrderRecord | undefined {
    const orders = db.getOrders();
    const target = orders.find((o) => o.id === orderId);
    if (!target) return undefined;

    const oldStatus = target.status;

    // Kural 1: 'Teslim Edildi' durumu kilitlidir, değiştirilemez
    if (oldStatus === 'Teslim Edildi') {
      console.warn(`Sipariş #${target.orderNo} zaten 'Teslim Edildi' durumunda. Değiştirilemez.`);
      return target;
    }

    // Kural 2: 'Reddedildi' durumu kilitlidir, onaylanamaz veya yola çıkarılamaz
    if (oldStatus === 'Reddedildi') {
      console.warn(`Sipariş #${target.orderNo} zaten 'Reddedildi' durumunda. Değiştirilemez.`);
      return target;
    }

    // Kural 3: 'Onaylandı' durumundaki sipariş reddedilemez, sadece 'Yolda' olarak işaretlenebilir
    if (oldStatus === 'Onaylandı' && newStatus === 'Reddedildi') {
      console.warn(`Onaylanan sipariş #${target.orderNo} reddedilemez.`);
      return target;
    }

    // If changing to 'Reddedildi', return stock to product
    if (newStatus === 'Reddedildi') {
      target.items.forEach((item) => {
        productService.restoreStock(item.productId, item.quantity);
      });
    }

    const updatedOrder: CustomerOrderRecord = {
      ...target,
      status: newStatus,
    };

    const updatedOrders = orders.map((o) => (o.id === orderId ? updatedOrder : o));
    db.saveOrders(updatedOrders);

    return updatedOrder;
  }
}

export const orderService = new OrderService();
