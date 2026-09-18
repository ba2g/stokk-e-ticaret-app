import React, { useState } from 'react';
import {
  Search,
  Eye,
  CheckCircle2,
  XCircle,
  Truck,
  Clock,
  Package,
  Calendar,
  User,
  ShieldCheck,
  X,
  ArrowUpDown,
  Filter
} from 'lucide-react';
import { CustomerOrderRecord } from '../../types';
import { orderService } from '../../services/orderService';

interface AdminOrdersViewProps {
  orders?: CustomerOrderRecord[];
  onOrderUpdated?: () => void;
}

export const AdminOrdersView: React.FC<AdminOrdersViewProps> = ({
  orders: propOrders,
  onOrderUpdated,
}) => {
  const [localOrders, setLocalOrders] = useState<CustomerOrderRecord[]>(() => {
    return propOrders || orderService.getAllOrders();
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedOrder, setSelectedOrder] = useState<CustomerOrderRecord | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const orders = propOrders || localOrders;

  const reloadOrders = () => {
    setLocalOrders(orderService.getAllOrders());
    if (onOrderUpdated) onOrderUpdated();
  };

  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== 'ALL' && o.status !== statusFilter) return false;
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      o.orderNo.toLowerCase().includes(q) ||
      o.id.toLowerCase().includes(q) ||
      o.customerId.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      (o.companyName && o.companyName.toLowerCase().includes(q)) ||
      o.items.some((i) => i.productName.toLowerCase().includes(q) || i.productCode.toLowerCase().includes(q))
    );
  });

  const handleStatusChange = (orderId: string, newStatus: CustomerOrderRecord['status']) => {
    const updated = orderService.updateOrderStatus(orderId, newStatus);
    if (updated) {
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(updated);
      }
      reloadOrders();
      setActionSuccess(`Sipariş #${updated.orderNo} durumu '${newStatus}' olarak güncellendi.`);
      setTimeout(() => setActionSuccess(null), 3500);
    }
  };

  const getStatusBadge = (status: CustomerOrderRecord['status']) => {
    switch (status) {
      case 'Onaylandı':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#e6f4ea] text-[#00685f] border border-[#a3e6cd]">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Onaylandı</span>
          </span>
        );
      case 'Reddedildi':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#ffdad6] text-[#ba1a1a] border border-[#ffb4ab]">
            <XCircle className="w-3.5 h-3.5" />
            <span>Reddedildi</span>
          </span>
        );
      case 'Yolda':
      case 'Kargoda':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
            <Truck className="w-3.5 h-3.5" />
            <span>Yolda (Kargoda)</span>
          </span>
        );
      case 'Hazırlanıyor':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#dce9ff] text-[#006194] border border-[#b8d5ff]">
            <Clock className="w-3.5 h-3.5" />
            <span>Hazırlanıyor</span>
          </span>
        );
      case 'Teslim Edildi':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#e6f4ea] text-[#00685f] border border-[#a3e6cd]">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Teslim Edildi</span>
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

  const totalVolume = orders.reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <div className="p-4 sm:p-6 max-w-[1600px] w-full mx-auto space-y-4">
      {/* Top Banner */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#e5eeff] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-[#006194] text-white text-[10px] font-extrabold uppercase tracking-wider">
              YÖNETİCİ PANELİ
            </span>
            <h1 className="font-heading text-lg sm:text-xl font-bold text-[#0b1c30]">
              Sipariş Yönetimi
            </h1>
          </div>
          <p className="text-xs text-[#565e74] mt-1">
            Gelen tüm müşteri siparişlerini inceleyin, onaylayın, reddedin veya yola çıkarın.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-[#eff4ff] border border-[#dce9ff] text-right">
            <span className="text-[10px] text-[#565e74] block font-semibold">Toplam Sipariş Hacmi:</span>
            <span className="font-mono font-extrabold text-sm sm:text-base text-[#006194]">
              ₺{totalVolume.toLocaleString('tr-TR')}
            </span>
          </div>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-[#e6f4ea] border border-[#00685f]/30 rounded-xl text-xs font-semibold text-[#00685f] flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Filter and Search */}
      <div className="bg-white p-3.5 rounded-2xl border border-[#e5eeff] shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[280px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#707881] w-4 h-4 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Sipariş No, Kullanıcı veya Ürün ara..."
            className="w-full h-9 pl-9 pr-8 bg-[#eff4ff] border border-transparent rounded-xl text-xs font-medium text-[#0b1c30] placeholder:text-[#707881] focus:outline-none focus:bg-white focus:border-[#006194]"
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

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {['ALL', 'Hazırlanıyor', 'Onaylandı', 'Yolda', 'Reddedildi', 'Teslim Edildi'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`h-8 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-[#006194] text-white shadow-xs'
                  : 'bg-[#eff4ff] text-[#565e74] hover:bg-[#dce9ff]'
              }`}
            >
              {st === 'ALL' ? 'Tümü' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-[#e5eeff] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#eff4ff] border-b border-[#dce9ff] text-[#565e74] text-[11px] uppercase tracking-wider font-bold">
                <th className="py-3 px-4">Sipariş Numarası</th>
                <th className="py-3 px-4">Sipariş Tarihi</th>
                <th className="py-3 px-4">Siparişi Oluşturan Kullanıcı</th>
                <th className="py-3 px-4 text-right">Toplam Tutar</th>
                <th className="py-3 px-4 text-center">Sipariş Durumu</th>
                <th className="py-3 px-4 text-center">Durum Güncelle (Yönetici)</th>
                <th className="py-3 px-4 text-center">Detay</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9] text-[#0b1c30]">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#707881]">
                    Kayıtlı sipariş bulunamadı.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className="hover:bg-[#eff4ff]/50 transition-colors cursor-pointer group"
                  >
                    {/* Sipariş Numarası */}
                    <td className="py-3.5 px-4 font-mono font-bold text-xs text-[#006194] group-hover:underline">
                      {order.orderNo}
                    </td>

                    {/* Sipariş Tarihi */}
                    <td className="py-3.5 px-4 font-mono text-xs text-[#565e74]">
                      {order.orderDate}
                    </td>

                    {/* Sipariş Oluşturan Kullanıcı */}
                    <td className="py-3.5 px-4">
                      <div>
                        <span className="font-bold text-[#0b1c30] block">{order.customerName}</span>
                        <span className="font-mono text-[10px] text-[#707881] block">
                          ID: {order.customerId} {order.companyName ? `• ${order.companyName}` : ''}
                        </span>
                      </div>
                    </td>

                    {/* Sipariş Toplam Tutar & Ödeme Yöntemi */}
                    <td className="py-3.5 px-4 text-right">
                      <span className="font-mono font-extrabold text-sm text-[#0b1c30] block">
                        ₺{order.totalAmount.toLocaleString('tr-TR')}
                      </span>
                      <span className="inline-block mt-0.5 px-2 py-0.2 rounded-full text-[10px] font-bold bg-[#eff4ff] text-[#006194] border border-[#dce9ff]">
                        {order.paymentMethod || 'Nakit'}
                      </span>
                    </td>

                    {/* Sipariş Durumu */}
                    <td className="py-3.5 px-4 text-center">
                      {getStatusBadge(order.status)}
                    </td>

                    {/* Durum Güncelle (Yönetici Aksiyonları) */}
                    <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                      {order.status === 'Hazırlanıyor' && (
                        <div className="inline-flex items-center gap-1.5 flex-wrap justify-center">
                          <button
                            type="button"
                            onClick={() => handleStatusChange(order.id, 'Onaylandı')}
                            className="px-2.5 py-1 rounded-lg bg-[#e6f4ea] hover:bg-[#d0f0db] text-[#00685f] text-[11px] font-bold transition-all cursor-pointer shadow-xs"
                            title="Siparişi Onayla"
                          >
                            ✓ Onayla
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(order.id, 'Reddedildi')}
                            className="px-2.5 py-1 rounded-lg bg-[#ffdad6] hover:bg-[#ffc5be] text-[#ba1a1a] text-[11px] font-bold transition-all cursor-pointer shadow-xs"
                            title="Siparişi Reddet (Stoklar Geri Yüklenir)"
                          >
                            ✕ Reddet
                          </button>
                        </div>
                      )}

                      {order.status === 'Onaylandı' && (
                        <div className="inline-flex items-center gap-1.5 justify-center">
                          <button
                            type="button"
                            onClick={() => handleStatusChange(order.id, 'Yolda')}
                            className="px-3 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 text-[11px] font-bold transition-all cursor-pointer shadow-xs inline-flex items-center gap-1"
                            title="Siparişi Yola Çıkar (Reddedilemez)"
                          >
                            <Truck className="w-3.5 h-3.5" />
                            <span>Yola Çıkar</span>
                          </button>
                        </div>
                      )}

                      {order.status === 'Yolda' && (
                        <div className="inline-flex items-center gap-1.5 justify-center">
                          <button
                            type="button"
                            onClick={() => handleStatusChange(order.id, 'Teslim Edildi')}
                            className="px-3 py-1 rounded-lg bg-[#e6f4ea] hover:bg-[#d0f0db] text-[#00685f] border border-[#a3e6cd] text-[11px] font-bold transition-all cursor-pointer shadow-xs inline-flex items-center gap-1"
                            title="Siparişi Teslim Edildi Olarak İşaretle"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Teslim Et</span>
                          </button>
                        </div>
                      )}

                      {order.status === 'Teslim Edildi' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#eff4ff] text-[#00685f] text-[11px] font-bold border border-[#dce9ff]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Teslim Edildi (Kilitli)</span>
                        </span>
                      )}

                      {order.status === 'Reddedildi' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#fff1f0] text-[#ba1a1a] text-[11px] font-bold border border-[#ffdad6]">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reddedildi (Kilitli)</span>
                        </span>
                      )}
                    </td>

                    {/* Detay */}
                    <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => setSelectedOrder(order)}
                        className="p-1.5 rounded-lg text-[#006194] hover:bg-[#dce9ff] transition-colors"
                        title="Sipariş Detayını Görüntüle"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SİPARİŞ DETAY MODALI */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-4xl rounded-3xl border border-[#dce9ff] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 bg-[#eff4ff] border-b border-[#dce9ff] flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-heading text-base sm:text-lg font-bold text-[#0b1c30]">
                    Sipariş Detayı & Kalemleri
                  </h2>
                  <span className="px-2 py-0.5 rounded bg-[#006194] text-white text-xs font-mono font-bold">
                    {selectedOrder.orderNo}
                  </span>
                </div>
                <span className="text-[11px] text-[#565e74]">
                  Kullanıcı: <strong>{selectedOrder.customerName}</strong> (ID: {selectedOrder.customerId})
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-lg text-[#565e74] hover:bg-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              {/* Meta Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="p-3 rounded-xl bg-[#f8f9ff] border border-[#e5eeff]">
                  <span className="text-[10px] text-[#707881] uppercase font-bold block">Sipariş Numarası</span>
                  <p className="font-mono font-bold text-xs text-[#006194] mt-0.5">{selectedOrder.orderNo}</p>
                </div>
                <div className="p-3 rounded-xl bg-[#f8f9ff] border border-[#e5eeff]">
                  <span className="text-[10px] text-[#707881] uppercase font-bold block">Sipariş Tarihi</span>
                  <p className="font-mono font-bold text-xs text-[#0b1c30] mt-0.5">{selectedOrder.orderDate}</p>
                </div>
                <div className="p-3 rounded-xl bg-[#f8f9ff] border border-[#e5eeff]">
                  <span className="text-[10px] text-[#707881] uppercase font-bold block">Sipariş Durumu</span>
                  <div className="mt-0.5">{getStatusBadge(selectedOrder.status)}</div>
                </div>
                <div className="p-3 rounded-xl bg-[#f8f9ff] border border-[#e5eeff]">
                  <span className="text-[10px] text-[#707881] uppercase font-bold block">Ödeme Yöntemi</span>
                  <p className="font-mono font-bold text-xs text-[#006194] mt-0.5">
                    <span className="px-2 py-0.5 rounded bg-[#eff4ff] border border-[#dce9ff] inline-block">
                      {selectedOrder.paymentMethod || 'Nakit'}
                    </span>
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-[#eff4ff] border border-[#dce9ff]">
                  <span className="text-[10px] text-[#006194] uppercase font-bold block">Toplam Tutar</span>
                  <p className="font-mono font-extrabold text-sm text-[#006194] mt-0.5">
                    ₺{selectedOrder.totalAmount.toLocaleString('tr-TR')}
                  </p>
                </div>
              </div>

              {/* Kalemler Tablosu: ürün, ürün kodu, adet, birim fiyatı, toplam fiyat */}
              <div className="space-y-2">
                <h3 className="font-heading text-xs font-bold text-[#0b1c30] uppercase tracking-wider">
                  Sipariş Kalemleri ({selectedOrder.items.length} Kalem)
                </h3>
                <div className="border border-[#e5eeff] rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#eff4ff] border-b border-[#dce9ff] text-[#565e74] text-[10px] uppercase tracking-wider font-bold">
                        <th className="py-2.5 px-3">Ürün</th>
                        <th className="py-2.5 px-3">Ürün Kodu</th>
                        <th className="py-2.5 px-3 text-center">Adet</th>
                        <th className="py-2.5 px-3 text-right">Birim Fiyatı</th>
                        <th className="py-2.5 px-3 text-right">Toplam Fiyat</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f1f5f9]">
                      {selectedOrder.items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-[#eff4ff]/30">
                          <td className="py-2.5 px-3 font-semibold text-[#0b1c30]">
                            {item.productName}
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-[#006194]">
                            {item.productCode}
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono font-bold text-[#0b1c30]">
                            {item.quantity} Adet
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-[#565e74]">
                            ₺{item.unitPrice.toLocaleString('tr-TR')}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-[#0b1c30]">
                            ₺{item.totalPrice.toLocaleString('tr-TR')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Status Manager Buttons inside modal */}
              <div className="p-4 rounded-2xl bg-[#eff4ff]/60 border border-[#dce9ff] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <span className="font-bold text-[#0b1c30]">Yönetici Sipariş Durumu İşlemi:</span>
                <div className="flex items-center gap-2 flex-wrap">
                  {selectedOrder.status === 'Hazırlanıyor' && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleStatusChange(selectedOrder.id, 'Onaylandı')}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#00685f] text-white hover:bg-[#007b70] transition-all cursor-pointer shadow-xs inline-flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Siparişi Onayla</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStatusChange(selectedOrder.id, 'Reddedildi')}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#ba1a1a] text-white hover:bg-[#d32f2f] transition-all cursor-pointer shadow-xs inline-flex items-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Siparişi Reddet (Stok İadesi)</span>
                      </button>
                    </>
                  )}

                  {selectedOrder.status === 'Onaylandı' && (
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-[#00685f] font-semibold">
                        Sipariş onaylanmıştır (reddedilemez).
                      </span>
                      <button
                        type="button"
                        onClick={() => handleStatusChange(selectedOrder.id, 'Yolda')}
                        className="px-4 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white transition-all cursor-pointer shadow-xs inline-flex items-center gap-1.5"
                      >
                        <Truck className="w-4 h-4" />
                        <span>Yola Çıkar (Kargoya Ver)</span>
                      </button>
                    </div>
                  )}

                  {selectedOrder.status === 'Yolda' && (
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-amber-900 font-semibold">
                        Sipariş yoldadır.
                      </span>
                      <button
                        type="button"
                        onClick={() => handleStatusChange(selectedOrder.id, 'Teslim Edildi')}
                        className="px-4 py-1.5 rounded-xl text-xs font-bold bg-[#00685f] hover:bg-[#007b70] text-white transition-all cursor-pointer shadow-xs inline-flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Teslim Edildi Olarak Tamamla</span>
                      </button>
                    </div>
                  )}

                  {selectedOrder.status === 'Teslim Edildi' && (
                    <div className="flex items-center gap-2 text-[#00685f] bg-[#e6f4ea] px-3 py-1.5 rounded-xl border border-[#a3e6cd] font-bold text-xs">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Sipariş başarıyla teslim edilmiştir. Durumu kilitlidir ve değiştirilemez.</span>
                    </div>
                  )}

                  {selectedOrder.status === 'Reddedildi' && (
                    <div className="flex items-center gap-2 text-[#ba1a1a] bg-[#ffdad6] px-3 py-1.5 rounded-xl border border-[#ffb4ab] font-bold text-xs">
                      <XCircle className="w-4 h-4" />
                      <span>Sipariş reddedilmiştir. Durumu kilitlidir ve değiştirilemez.</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="px-6 py-3 bg-[#f8f9ff] border-t border-[#e5eeff] flex items-center justify-end">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 rounded-xl bg-[#006194] text-white text-xs font-bold hover:bg-[#007bb9]"
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
