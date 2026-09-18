import React, { useState } from 'react';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Package,
  ShieldCheck,
  AlertCircle,
  ShoppingBag,
  Info,
  CheckCircle2,
  Banknote,
  FileText,
  Wallet
} from 'lucide-react';
import { CartItem, Product, Customer } from '../../types';

interface CartViewProps {
  cartItems: CartItem[];
  products: Product[];
  customers: Customer[];
  activeUserId: string;
  onUpdateQuantity: (cartItemId: string, newQuantity: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onClearCart: () => void;
  onCheckoutOrder: (selectedCustomerId: string, notes?: string, paymentMethod?: 'Nakit' | 'Çek' | 'Bakiye') => void;
  onGoToProducts: () => void;
}

export const CartView: React.FC<CartViewProps> = ({
  cartItems,
  products,
  customers,
  activeUserId,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCheckoutOrder,
  onGoToProducts,
}) => {
  const activeCustomer = customers.find((c) => c.id === activeUserId);
  const [paymentMethod, setPaymentMethod] = useState<'Nakit' | 'Çek' | 'Bakiye'>('Nakit');
  const [orderNotes, setOrderNotes] = useState<string>('');
  const [isCheckingOut, setIsCheckingOut] = useState<boolean>(false);

  // Calculate Subtotal and Grand Total
  const subtotal = cartItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const vatAmount = Math.round(subtotal * 0.10); // %10 KDV
  const grandTotal = subtotal + vatAmount;

  // Check any stock issue before checkout
  const stockErrors: { itemId: string; name: string; requested: number; available: number }[] = [];
  cartItems.forEach((item) => {
    const prod = products.find((p) => p.id === item.productId);
    const available = prod ? prod.totalOnHand : 0;
    if (item.quantity > available) {
      stockErrors.push({
        itemId: item.id,
        name: item.productName,
        requested: item.quantity,
        available,
      });
    }
  });

  const hasStockError = stockErrors.length > 0;

  const handleCheckout = () => {
    if (cartItems.length === 0 || hasStockError) return;
    setIsCheckingOut(true);
    setTimeout(() => {
      onCheckoutOrder(activeUserId, orderNotes, paymentMethod);
      setIsCheckingOut(false);
    }, 400);
  };

  if (cartItems.length === 0) {
    return (
      <div className="p-4 sm:p-8 max-w-4xl mx-auto text-center">
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-[#e5eeff] shadow-sm flex flex-col items-center justify-center space-y-5">
          <div className="w-20 h-20 rounded-full bg-[#eff4ff] flex items-center justify-center text-[#006194]">
            <ShoppingCart className="w-10 h-10 opacity-70" />
          </div>
          <div className="space-y-2 max-w-md">
            <h2 className="font-heading text-xl font-bold text-[#0b1c30]">
              Sipariş Sepetiniz Şu Anda Boş
            </h2>
            <p className="text-xs sm:text-sm text-[#565e74]">
              Kataloğumuzdaki toptan ürün listesinden satır bazında adet belirleyerek hızlıca sepetinize ekleme yapabilirsiniz.
            </p>
          </div>
          <button
            type="button"
            onClick={onGoToProducts}
            className="px-6 py-3 rounded-xl bg-[#006194] hover:bg-[#007bb9] text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Ürün Listesine Git</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-[1500px] w-full mx-auto space-y-5">
      {/* Header Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#e5eeff] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-[#006194] text-white text-[10px] font-extrabold uppercase tracking-wider">
              SEPET YÖNETİMİ
            </span>
            <h1 className="font-heading text-lg sm:text-xl font-bold text-[#0b1c30]">
              Sipariş Sepeti ({cartItems.length} Kalem, {totalQuantity} Adet)
            </h1>
          </div>
          <p className="text-xs text-[#565e74] mt-1">
            Ürün adetlerini güncelleyebilir, kalemleri silebilir ve anlık stok kontrolü ile siparişinizi oluşturabilirsiniz.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClearCart}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#ba1a1a] hover:bg-[#fff5f5] transition-colors border border-transparent hover:border-[#ffdad6]"
          >
            Sepeti Temizle
          </button>
          <button
            type="button"
            onClick={onGoToProducts}
            className="px-3.5 py-1.5 rounded-xl bg-[#eff4ff] hover:bg-[#dce9ff] text-[#006194] text-xs font-bold transition-all border border-[#dce9ff]"
          >
            + Ürün Ekle
          </button>
        </div>
      </div>

      {/* Stock warning notification if any item exceeds available stock */}
      {hasStockError && (
        <div className="bg-[#ffdad6]/60 border border-[#ba1a1a] p-4 rounded-2xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-[#ba1a1a] flex-shrink-0 mt-0.5" />
          <div className="text-xs text-[#410002] space-y-1">
            <p className="font-bold">Yetersiz Stok Uyarısı!</p>
            <p>
              Sepetinizdeki bazı ürünlerin talep edilen adedi mevcut depo stoğunu aşmaktadır. Lütfen adetleri güncelleyin:
            </p>
            <ul className="list-disc list-inside space-y-0.5 font-medium">
              {stockErrors.map((err) => (
                <li key={err.itemId}>
                  <strong>{err.name}</strong>: Talep Edilen: {err.requested} Adet — <span className="text-[#ba1a1a] font-bold">Kullanılabilir Stok: {err.available} Adet</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Main Grid: Left Items List, Right Order Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Cart Items (Desktop Table & Mobile Cards) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-[#e5eeff] shadow-sm overflow-hidden">
            {/* Desktop Table View (>= 768px) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#eff4ff] border-b border-[#dce9ff] text-[#565e74] text-[11px] uppercase tracking-wider font-bold">
                    <th className="py-3.5 px-4">Ürün</th>
                    <th className="py-3.5 px-3">Birim Fiyat</th>
                    <th className="py-3.5 px-3 text-center">Adet</th>
                    <th className="py-3.5 px-3 text-right">Toplam Tutar</th>
                    <th className="py-3.5 px-3 text-center">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f1f5f9] text-[#0b1c30]">
                  {cartItems.map((item) => {
                    const prod = products.find((p) => p.id === item.productId);
                    const currentStock = prod ? prod.totalOnHand : item.availableStock;
                    const isExceeded = item.quantity > currentStock;
                    const lineTotal = item.unitPrice * item.quantity;

                    return (
                      <tr key={item.id} className="hover:bg-[#eff4ff]/40 transition-colors">
                        {/* Ürün Bilgisi */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-14 h-14 rounded-xl bg-[#eff4ff] border border-[#dce9ff] overflow-hidden flex-shrink-0">
                              <img
                                src={item.image}
                                alt={item.productName}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="space-y-0.5 max-w-[240px]">
                              <span className="font-mono font-bold text-[11px] text-[#006194] block">
                                {item.productCode}
                              </span>
                              <h4 className="font-bold text-xs text-[#0b1c30] truncate" title={item.productName}>
                                {item.productName}
                              </h4>
                              <span className="text-[10px] text-[#707881] block">
                                Marka: <strong className="text-[#565e74]">{item.brand}</strong>
                              </span>
                              <span
                                className={`inline-block text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                                  isExceeded
                                    ? 'bg-[#ffdad6] text-[#ba1a1a]'
                                    : currentStock <= 10
                                    ? 'bg-amber-100 text-amber-900'
                                    : 'bg-[#e6f4ea] text-[#00685f]'
                                }`}
                              >
                                Eldeki Stok: {currentStock} Adet
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Birim Fiyatı */}
                        <td className="py-3.5 px-3">
                          <div className="font-mono font-bold text-xs text-[#0b1c30]">
                            ₺{item.unitPrice.toLocaleString('tr-TR')}
                          </div>
                          <span className="text-[10px] text-[#707881]">+ KDV</span>
                        </td>

                        {/* Adet Kontrolü */}
                        <td className="py-3.5 px-3 text-center">
                          <div className="inline-flex flex-col items-center">
                            <div className="flex items-center border border-[#bfc7d2] rounded-lg bg-white overflow-hidden shadow-xs">
                              <button
                                type="button"
                                disabled={item.quantity <= 1}
                                onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                                className="w-7 h-7 flex items-center justify-center text-[#565e74] hover:bg-[#eff4ff] active:bg-[#dce9ff] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <input
                                type="number"
                                min="1"
                                max={currentStock}
                                value={item.quantity}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value, 10);
                                  if (!isNaN(val)) {
                                    onUpdateQuantity(item.id, val);
                                  }
                                }}
                                className={`w-12 h-7 text-center font-mono font-bold text-xs focus:outline-none ${
                                  isExceeded ? 'text-[#ba1a1a] bg-[#fff5f5]' : 'text-[#0b1c30]'
                                }`}
                              />
                              <button
                                type="button"
                                disabled={item.quantity >= currentStock}
                                onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                                className="w-7 h-7 flex items-center justify-center text-[#565e74] hover:bg-[#eff4ff] active:bg-[#dce9ff] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                            {isExceeded && (
                              <span className="text-[9px] text-[#ba1a1a] font-bold mt-1">
                                Stok aşıldı! (Maks: {currentStock})
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Toplam Tutar */}
                        <td className="py-3.5 px-3 text-right">
                          <span className="font-mono font-bold text-sm text-[#006194]">
                            ₺{lineTotal.toLocaleString('tr-TR')}
                          </span>
                        </td>

                        {/* Kaldır Butonu */}
                        <td className="py-3.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => onRemoveItem(item.id)}
                            className="p-2 rounded-lg text-[#707881] hover:text-[#ba1a1a] hover:bg-[#ffdad6]/50 transition-colors cursor-pointer"
                            title="Sepetten Çıkar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile / Tablet Card View (< 768px) */}
            <div className="md:hidden divide-y divide-[#e5eeff]">
              {cartItems.map((item) => {
                const prod = products.find((p) => p.id === item.productId);
                const currentStock = prod ? prod.totalOnHand : item.availableStock;
                const isExceeded = item.quantity > currentStock;
                const lineTotal = item.unitPrice * item.quantity;

                return (
                  <div key={item.id} className="p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-16 h-16 rounded-xl bg-[#eff4ff] border border-[#dce9ff] overflow-hidden flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.productName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-xs text-[#006194]">
                            {item.productCode}
                          </span>
                          <button
                            type="button"
                            onClick={() => onRemoveItem(item.id)}
                            className="p-1 text-[#707881] hover:text-[#ba1a1a]"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <h4 className="font-bold text-xs text-[#0b1c30] truncate">
                          {item.productName}
                        </h4>
                        <div className="text-[11px] text-[#565e74]">
                          Marka: <strong>{item.brand}</strong>
                        </div>
                        <span
                          className={`inline-block text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold ${
                            isExceeded
                              ? 'bg-[#ffdad6] text-[#ba1a1a]'
                              : currentStock <= 10
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-[#e6f4ea] text-[#00685f]'
                          }`}
                        >
                          Eldeki Stok: {currentStock} Adet
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#f1f5f9]">
                      <div>
                        <span className="text-[10px] text-[#707881] block">Birim Fiyat:</span>
                        <span className="font-mono font-bold text-xs text-[#0b1c30]">
                          ₺{item.unitPrice.toLocaleString('tr-TR')}
                        </span>
                      </div>

                      {/* Stepper */}
                      <div className="flex items-center border border-[#bfc7d2] rounded-lg bg-white overflow-hidden shadow-xs">
                        <button
                          type="button"
                          disabled={item.quantity <= 1}
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center text-[#565e74] hover:bg-[#eff4ff] disabled:opacity-30"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <input
                          type="number"
                          min="1"
                          max={currentStock}
                          value={item.quantity}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            if (!isNaN(val)) onUpdateQuantity(item.id, val);
                          }}
                          className="w-10 h-8 text-center font-mono font-bold text-xs text-[#0b1c30] focus:outline-none"
                        />
                        <button
                          type="button"
                          disabled={item.quantity >= currentStock}
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center text-[#565e74] hover:bg-[#eff4ff] disabled:opacity-30"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-[#707881] block">Toplam:</span>
                        <span className="font-mono font-bold text-sm text-[#006194]">
                          ₺{lineTotal.toLocaleString('tr-TR')}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Checkout Card */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-[#e5eeff] shadow-sm space-y-4">
            <h3 className="font-heading text-base font-bold text-[#0b1c30] border-b border-[#f1f5f9] pb-3">
              Sipariş Özeti
            </h3>

            {/* Sipariş Sahibi (Giriş Yapan Kullanıcı - Kilitli & Otomatik) */}
            <div className="p-3.5 bg-[#eff4ff] border border-[#dce9ff] rounded-2xl space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#006194] uppercase font-extrabold tracking-wider">
                  Sipariş Sahibi / Cari Hesap
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#e6f4ea] text-[#00685f] text-[10px] font-bold border border-[#a3e6cd]">
                  Kendi Hesabınız
                </span>
              </div>
              <div>
                <p className="font-bold text-xs text-[#0b1c30]">
                  {activeCustomer ? `${activeCustomer.firstName} ${activeCustomer.lastName}` : 'Giriş Yapan Kullanıcı'}
                </p>
                <p className="text-[11px] text-[#565e74] font-mono">
                  Kullanıcı ID: <strong className="text-[#006194]">{activeUserId}</strong>
                  {activeCustomer?.companyName ? ` • ${activeCustomer.companyName}` : ''}
                </p>
              </div>
            </div>

            {/* Ödeme Yöntemi Seçimi (Nakit, Çek, Bakiye) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#0b1c30] block">
                Ödeme Yöntemi *
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'Nakit' as const, label: 'Nakit', desc: 'Nakit / Havale', icon: Banknote },
                  { id: 'Çek' as const, label: 'Çek', desc: 'Vadeli Çek', icon: FileText },
                  { id: 'Bakiye' as const, label: 'Bakiye', desc: 'Cari Bakiye', icon: Wallet },
                ].map((item) => {
                  const isSelected = paymentMethod === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setPaymentMethod(item.id)}
                      className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                        isSelected
                          ? 'border-[#006194] bg-[#eff4ff] text-[#006194] ring-2 ring-[#006194]/20 shadow-xs'
                          : 'border-[#dce9ff] bg-white text-[#565e74] hover:bg-[#f8f9ff]'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-[#006194]' : 'text-[#707881]'}`} />
                      <span className="font-bold text-xs leading-none">{item.label}</span>
                      <span className="text-[9px] text-[#707881] leading-none">{item.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Order Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#565e74] block">
                Sipariş / Sevkiyat Notu (Opsiyonel):
              </label>
              <textarea
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder="İrsaliye teslimat notu, sevkiyat talimatı vb..."
                rows={2}
                className="w-full p-2.5 bg-[#eff4ff] border border-[#dce9ff] rounded-xl text-xs text-[#0b1c30] placeholder:text-[#707881] focus:outline-none focus:bg-white focus:border-[#006194]"
              />
            </div>

            {/* Cost Breakdown */}
            <div className="space-y-2.5 pt-3 border-t border-[#f1f5f9] text-xs">
              <div className="flex items-center justify-between text-[#565e74]">
                <span>Toplam Ürün Adedi</span>
                <span className="font-mono font-bold text-[#0b1c30]">{totalQuantity} Adet</span>
              </div>
              <div className="flex items-center justify-between text-[#565e74]">
                <span>Ara Toplam (KDV Hariç)</span>
                <span className="font-mono font-bold text-[#0b1c30]">
                  ₺{subtotal.toLocaleString('tr-TR')}
                </span>
              </div>
              <div className="flex items-center justify-between text-[#565e74]">
                <span>Hesaplanan KDV (%10)</span>
                <span className="font-mono font-bold text-[#0b1c30]">
                  ₺{vatAmount.toLocaleString('tr-TR')}
                </span>
              </div>

              <div className="pt-2 border-t border-[#dce9ff] flex items-center justify-between">
                <span className="font-heading font-bold text-sm text-[#0b1c30]">
                  Genel Toplam (KDV Dahil)
                </span>
                <span className="font-mono font-extrabold text-lg text-[#006194]">
                  ₺{grandTotal.toLocaleString('tr-TR')}
                </span>
              </div>
            </div>

            {/* Snapshot Price Guarantee Callout */}
            <div className="p-3 bg-[#e6f4ea]/70 rounded-xl border border-[#00685f]/30 flex items-start gap-2 text-[11px] text-[#004f47]">
              <ShieldCheck className="w-4 h-4 text-[#00685f] flex-shrink-0 mt-0.5" />
              <p>
                <strong>Fiyat Sabitleme Güvencesi:</strong> Sipariş tamamlandığında kalem birim fiyatları o anki tutar üzerinden kalıcı olarak dondurulur. Gelecekteki ürün fiyat değişiklikleri geçmiş siparişlerinizi etkilemez.
              </p>
            </div>

            {/* Checkout Action Button */}
            <button
              type="button"
              disabled={cartItems.length === 0 || hasStockError || isCheckingOut}
              onClick={handleCheckout}
              className="w-full py-3.5 rounded-xl bg-[#006194] hover:bg-[#007bb9] disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] cursor-pointer"
            >
              {isCheckingOut ? (
                <span>Stok Kontrol Ediliyor & Sipariş Yazılıyor...</span>
              ) : (
                <>
                  <span>Siparişi Onayla & Stoktan Düş</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
