import React, { useState } from 'react';
import {
  Search,
  Plus,
  Eye,
  CheckCircle2,
  Clock,
  Truck,
  Package,
  XCircle,
  ShieldCheck,
  Calendar,
  User,
  Hash,
  ArrowRight,
  Filter,
  X
} from 'lucide-react';
import { CustomerOrderRecord, OrderLineItem } from '../../types';

interface OrdersViewProps {
  orders: CustomerOrderRecord[];
  onOpenQuickOrder: () => void;
  onGoToProducts?: () => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  orders,
  onOpenQuickOrder,
  onGoToProducts,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedOrder, setSelectedOrder] = useState<CustomerOrderRecord | null>(null);

  const filteredOrders = orders.filter((o) => {
    // Status Filter
    if (statusFilter !== 'ALL' && o.status !== statusFilter) return false;

    // Search query
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      o.orderNo.toLowerCase().includes(q) ||
      o.id.toLowerCase().includes(q) ||
      o.customerId.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      (o.customerEmail && o.customerEmail.toLowerCase().includes(q)) ||
      o.items.some(
        (item) =>
          item.productName.toLowerCase().includes(q) ||
          item.productCode.toLowerCase().includes(q) ||
          item.productId.toLowerCase().includes(q)
      )
    );
  });

  const getStatusBadge = (status: CustomerOrderRecord['status']) => {
    switch (status) {
      case 'Onaylandı':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#e6f4ea] text-[#00685f] border border-[#a3e6cd]">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Onaylandı</span>
          </span>
        );
      case 'Hazırlanıyor':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#dce9ff] text-[#006194] border border-[#b8d5ff]">
            <Clock className="w-3.5 h-3.5" />
            <span>Hazırlanıyor</span>
          </span>
        );
      case 'Kargoda':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
            <Truck className="w-3.5 h-3.5" />
            <span>Kargoda</span>
          </span>
        );
      case 'Teslim Edildi':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#e6f4ea] text-[#00685f] border border-[#a3e6cd]">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Teslim Edildi</span>
          </span>
        );
      case 'İptal Edildi':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#ffdad6] text-[#ba1a1a] border border-[#ffb4ab]">
            <XCircle className="w-3.5 h-3.5" />
            <span>İptal Edildi</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700">
            {status}
          </span>
        );
    }
  };

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <div className="p-4 sm:p-6 max-w-[1600px] w-full mx-auto space-y-4">
      {/* 1. Header Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#e5eeff] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-[#006194] text-white text-[10px] font-extrabold uppercase tracking-wider">
              SİPARİŞLERİM
            </span>
            <h1 className="font-heading text-lg sm:text-xl font-bold text-[#0b1c30]">
              Sipariş Listesi ve Kalem Yönetimi
            </h1>
          </div>
          <p className="text-xs text-[#565e74] mt-1">
            Kullanıcı siparişleri, sipariş detayları ve satış anındaki sabitlenmiş birim fiyat kalemleri
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#eff4ff] border border-[#dce9ff] text-xs font-semibold text-[#006194]">
            <span>Toplam Hacim:</span>
            <span className="font-mono font-bold text-sm text-[#0b1c30]">
              ₺{totalRevenue.toLocaleString('tr-TR')}
            </span>
          </div>

          <button
            type="button"
            onClick={onOpenQuickOrder}
            className="px-3.5 py-2 rounded-xl bg-[#006194] hover:bg-[#007bb9] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Sipariş Girişi</span>
          </button>
        </div>
      </div>

      {/* 2. Filter & Search Toolbar */}
      <div className="bg-white p-3.5 rounded-2xl border border-[#e5eeff] shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[280px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#707881] w-4 h-4 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Sipariş No, ID, Müşteri veya Ürün adı ara..."
            className="w-full h-9 pl-9 pr-8 bg-[#eff4ff] border border-transparent rounded-xl text-xs font-medium text-[#0b1c30] placeholder:text-[#707881] focus:outline-none focus:bg-white focus:border-[#006194] transition-all"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#707881] hover:text-[#0b1c30]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {['ALL', 'Hazırlanıyor', 'Onaylandı', 'Kargoda', 'Teslim Edildi', 'İptal Edildi'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`h-8 px-3 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === st
                  ? 'bg-[#006194] text-white shadow-xs'
                  : 'bg-[#eff4ff] text-[#565e74] hover:bg-[#dce9ff] hover:text-[#0b1c30]'
              }`}
            >
              {st === 'ALL' ? 'Tümü' : st}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Orders Table (Desktop) & Cards (Mobile/Tablet) */}
      <div className="bg-white rounded-2xl border border-[#e5eeff] shadow-sm overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#eff4ff] border-b border-[#dce9ff] text-[#565e74] text-[11px] uppercase tracking-wider font-bold">
                <th className="py-3.5 px-4">Sipariş No & ID</th>
                <th className="py-3.5 px-4">Kullanıcı (Müşteri ID)</th>
                <th className="py-3.5 px-4">Sipariş Tarihi</th>
                <th className="py-3.5 px-4 text-center">Kalemler</th>
                <th className="py-3.5 px-4 text-right">Toplam Tutar</th>
                <th className="py-3.5 px-4 text-center">Durum</th>
                <th className="py-3.5 px-4 text-center">Detay</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9] text-[#0b1c30]">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#707881]">
                    Arama kriterlerine uygun sipariş bulunamadı.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);

                  return (
                    <tr
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className="hover:bg-[#eff4ff]/50 transition-colors cursor-pointer group"
                    >
                      {/* Sipariş No & ID */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <span className="font-mono font-bold text-xs text-[#006194] block group-hover:underline">
                            {order.orderNo}
                          </span>
                          <span className="font-mono text-[10px] text-[#707881] block">
                            ID: {order.id}
                          </span>
                        </div>
                      </td>

                      {/* Kullanıcı ID & Adı */}
                      <td className="py-3.5 px-4">
                        <div>
                          <span className="font-semibold text-[#0b1c30] block">
                            {order.customerName}
                          </span>
                          <span className="font-mono text-[10px] text-[#707881] block">
                            Kullanıcı ID: {order.customerId}
                          </span>
                        </div>
                      </td>

                      {/* Sipariş Tarihi */}
                      <td className="py-3.5 px-4 font-mono text-xs text-[#565e74]">
                        {order.orderDate}
                      </td>

                      {/* Kalemler */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-full bg-[#eff4ff] text-[#006194] font-mono font-bold text-xs">
                          {order.items.length} Kalem ({itemCount} Adet)
                        </span>
                      </td>

                      {/* Toplam Tutar & Ödeme Yöntemi */}
                      <td className="py-3.5 px-4 text-right">
                        <span className="font-mono font-bold text-sm text-[#0b1c30] block">
                          ₺{order.totalAmount.toLocaleString('tr-TR')}
                        </span>
                        <span className="inline-block mt-0.5 px-2 py-0.2 rounded-full text-[10px] font-bold bg-[#eff4ff] text-[#006194] border border-[#dce9ff]">
                          {order.paymentMethod || 'Nakit'}
                        </span>
                      </td>

                      {/* Durum */}
                      <td className="py-3.5 px-4 text-center">
                        {getStatusBadge(order.status)}
                      </td>

                      {/* Detay Butonu */}
                      <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => setSelectedOrder(order)}
                          className="p-1.5 rounded-lg text-[#006194] hover:bg-[#dce9ff] transition-colors"
                          title="Sipariş Kalemlerini İncele"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile / Tablet Card View */}
        <div className="md:hidden divide-y divide-[#e5eeff]">
          {filteredOrders.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#707881]">
              Arama kriterlerine uygun sipariş bulunamadı.
            </div>
          ) : (
            filteredOrders.map((order) => {
              const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);

              return (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className="p-4 space-y-3 cursor-pointer hover:bg-[#eff4ff]/30 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono font-bold text-xs text-[#006194]">
                        {order.orderNo}
                      </span>
                      <span className="text-[10px] text-[#707881] font-mono block">
                        ID: {order.id}
                      </span>
                    </div>
                    <div>{getStatusBadge(order.status)}</div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-[#0b1c30] block">{order.customerName}</span>
                      <span className="text-[10px] text-[#707881] font-mono">
                        Kullanıcı ID: {order.customerId}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-sm text-[#006194]">
                        ₺{order.totalAmount.toLocaleString('tr-TR')}
                      </span>
                      <span className="text-[10px] text-[#707881] block font-mono">
                        {order.items.length} Kalem • {itemCount} Adet
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#f1f5f9] text-[11px] text-[#565e74]">
                    <span className="font-mono">{order.orderDate}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedOrder(order);
                      }}
                      className="text-xs font-bold text-[#006194] flex items-center gap-1 hover:underline"
                    >
                      <span>Kalemleri Gör</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 4. Order Details & Line Items Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-4xl rounded-3xl border border-[#dce9ff] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-5 py-4 bg-[#eff4ff] border-b border-[#dce9ff] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#006194] text-white flex items-center justify-center">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-heading text-base sm:text-lg font-bold text-[#0b1c30]">
                      Sipariş Kalemleri & Detayı
                    </h2>
                    <span className="font-mono text-xs font-bold text-[#006194] bg-white px-2 py-0.5 rounded-md border border-[#dce9ff]">
                      {selectedOrder.orderNo}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#565e74]">
                    Sipariş ID: <strong className="font-mono text-[#0b1c30]">{selectedOrder.id}</strong> • Kullanıcı ID: <strong className="font-mono text-[#0b1c30]">{selectedOrder.customerId}</strong>
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-lg text-[#565e74] hover:bg-white hover:text-[#0b1c30] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-5">
              {/* Order Metadata Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-[#f8f9ff] border border-[#e5eeff]">
                  <span className="text-[10px] text-[#707881] uppercase font-bold block">
                    Sipariş Tarihi
                  </span>
                  <p className="font-mono font-bold text-[#0b1c30] mt-1">
                    {selectedOrder.orderDate}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[#f8f9ff] border border-[#e5eeff]">
                  <span className="text-[10px] text-[#707881] uppercase font-bold block">
                    Müşteri / Kullanıcı
                  </span>
                  <p className="font-bold text-[#0b1c30] mt-1 truncate" title={selectedOrder.customerName}>
                    {selectedOrder.customerName}
                  </p>
                  <span className="text-[10px] text-[#707881] block truncate">
                    ID: {selectedOrder.customerId}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#f8f9ff] border border-[#e5eeff]">
                  <span className="text-[10px] text-[#707881] uppercase font-bold block">
                    Sipariş Durumu
                  </span>
                  <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
                </div>

                <div className="p-3 rounded-xl bg-[#f8f9ff] border border-[#e5eeff]">
                  <span className="text-[10px] text-[#707881] uppercase font-bold block">
                    Ödeme Yöntemi
                  </span>
                  <p className="font-bold text-[#0b1c30] mt-1 flex items-center gap-1">
                    <span className="px-2 py-0.5 rounded-md bg-[#eff4ff] text-[#006194] border border-[#dce9ff] text-xs font-bold font-mono">
                      {selectedOrder.paymentMethod || 'Nakit'}
                    </span>
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[#eff4ff] border border-[#dce9ff]">
                  <span className="text-[10px] text-[#006194] uppercase font-bold block">
                    Toplam Tutar
                  </span>
                  <p className="font-mono font-extrabold text-base text-[#006194] mt-1">
                    ₺{selectedOrder.totalAmount.toLocaleString('tr-TR')}
                  </p>
                </div>
              </div>

              {/* Snapshot Pricing Rule Callout */}
              <div className="p-3.5 rounded-2xl bg-[#e6f4ea] border border-[#00685f]/30 flex items-start gap-2.5 text-xs text-[#004f47]">
                <ShieldCheck className="w-5 h-5 text-[#00685f] flex-shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-bold">
                    Satış Anındaki Fiyat Sabitlenmiştir (Fiyat Değişim Koruması)
                  </p>
                  <p className="text-[11px] leading-relaxed">
                    Bu siparişteki ürünlerin birim fiyatları sipariş anında sisteme kaydedilmiştir. Ürünün kataloğundaki güncel satış fiyatı ilerleyen dönemde değişse veya zamlansa dahi, geçmişte satılan bu siparişin kalem fiyatları <strong>asla değişmez ve etkilenmez</strong>.
                  </p>
                </div>
              </div>

              {/* SİPARİŞ KALEMLERİ TABLOSU */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading text-sm font-bold text-[#0b1c30] uppercase tracking-wide">
                    Sipariş Kalemleri ({selectedOrder.items.length} Kalem)
                  </h3>
                </div>

                <div className="border border-[#e5eeff] rounded-2xl overflow-hidden shadow-xs">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#eff4ff] border-b border-[#dce9ff] text-[#565e74] text-[10px] uppercase tracking-wider font-bold">
                        <th className="py-2.5 px-3">Sipariş ID</th>
                        <th className="py-2.5 px-3">Ürün ID</th>
                        <th className="py-2.5 px-3">Ürün Kodu</th>
                        <th className="py-2.5 px-3">Ürün Adı</th>
                        <th className="py-2.5 px-3 text-center">Adet</th>
                        <th className="py-2.5 px-3 text-right">Birim Fiyatı (Satış Anı)</th>
                        <th className="py-2.5 px-3 text-right">Toplam Fiyat</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f1f5f9] text-[#0b1c30]">
                      {selectedOrder.items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-[#eff4ff]/30">
                          <td className="py-3 px-3 font-mono text-[11px] text-[#707881]">
                            {item.orderId || selectedOrder.id}
                          </td>
                          <td className="py-3 px-3 font-mono text-[11px] text-[#006194]">
                            {item.productId}
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-xs text-[#0b1c30]">
                            {item.productCode}
                          </td>
                          <td className="py-3 px-3 font-semibold text-xs text-[#0b1c30]">
                            <div>{item.productName}</div>
                            {(item.colorName || item.size) && (
                              <span className="text-[10px] text-[#707881]">
                                {item.colorName} • {item.size}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-center font-mono font-bold text-xs text-[#006194]">
                            {item.quantity} Adet
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-semibold text-xs text-[#565e74]">
                            ₺{item.unitPrice.toLocaleString('tr-TR')}
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-xs text-[#0b1c30]">
                            ₺{item.totalPrice.toLocaleString('tr-TR')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Sipariş Durum Bilgisi (Müşteri için Salt Okunur) */}
              <div className="p-4 rounded-2xl bg-[#eff4ff]/60 border border-[#dce9ff] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#0b1c30]">Güncel Sipariş Durumu:</span>
                  <div>{getStatusBadge(selectedOrder.status)}</div>
                </div>
                <span className="text-[11px] text-[#565e74] italic">
                  * Sipariş onay, ret, sevk ve teslimat işlemleri yalnızca sistem yöneticisi (Batu Güdek) tarafından gerçekleştirilebilir.
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 bg-[#f8f9ff] border-t border-[#e5eeff] flex items-center justify-between text-xs">
              <span className="text-[#707881]">
                Kalem Toplamı: <strong className="text-[#0b1c30] font-mono">₺{selectedOrder.totalAmount.toLocaleString('tr-TR')}</strong>
              </span>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 rounded-xl bg-[#006194] text-white font-bold hover:bg-[#007bb9] cursor-pointer"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
