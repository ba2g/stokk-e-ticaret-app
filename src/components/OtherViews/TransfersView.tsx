import React, { useState } from 'react';
import {
  Truck,
  Plus,
  ArrowRightLeft,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Package
} from 'lucide-react';
import { TransferRecord } from '../../types';

interface TransfersViewProps {
  transfers: TransferRecord[];
  onApproveTransfer: (id: string) => void;
  onOpenNewTransfer: () => void;
  isRequestsOnly?: boolean;
}

export const TransfersView: React.FC<TransfersViewProps> = ({
  transfers,
  onApproveTransfer,
  onOpenNewTransfer,
  isRequestsOnly = false,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filtered = transfers.filter((t) => {
    if (isRequestsOnly && t.status !== 'Onay Bekliyor' && t.status !== 'Hazırlanıyor') {
      return false;
    }
    if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        t.code.toLowerCase().includes(q) ||
        t.productName.toLowerCase().includes(q) ||
        t.fromLocation.toLowerCase().includes(q) ||
        t.toLocation.toLowerCase().includes(q) ||
        t.sku.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="p-4 sm:p-6 max-w-[1600px] w-full mx-auto space-y-4">
      {/* Top action bar */}
      <div className="bg-white p-4 rounded-xl border border-[#e5eeff] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          <h2 className="font-heading text-lg font-bold text-[#0b1c30]">
            {isRequestsOnly ? 'Şubeler Arası Transfer İstekleri' : 'Depo ve Mağaza Transferleri'}
          </h2>
          <p className="text-xs text-[#565e74]">
            Kayseri Mağaza, Ana Depo ve İstanbul Merkez şubeler arası irsaliyeli stok hareketleri
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenNewTransfer}
            className="px-3.5 py-2 rounded-lg bg-[#006194] hover:bg-[#007bb9] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Transfer Emri</span>
          </button>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="bg-white p-3 rounded-xl border border-[#e5eeff] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#707881]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Transfer kodu, ürün veya şube ara..."
            className="w-full h-8 px-2 bg-[#eff4ff] rounded-lg text-xs focus:outline-none focus:bg-white border border-transparent focus:border-[#006194]"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[#707881]">Durum:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-8 px-2 bg-[#eff4ff] rounded-lg border border-[#dce9ff] text-xs font-semibold text-[#0b1c30] focus:outline-none"
          >
            <option value="ALL">Tümü</option>
            <option value="Onay Bekliyor">Onay Bekliyor</option>
            <option value="Hazırlanıyor">Hazırlanıyor</option>
            <option value="Yolda">Yolda</option>
            <option value="Teslim Alındı">Teslim Alındı</option>
          </select>
        </div>
      </div>

      {/* Transfer List Table */}
      <div className="bg-white rounded-xl border border-[#e5eeff] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#eff4ff] text-[#565e74] uppercase text-[10px] font-bold border-b border-[#dce9ff]">
              <tr>
                <th className="py-3 px-4">Transfer Fiş No</th>
                <th className="py-3 px-4">Tarih</th>
                <th className="py-3 px-4">Çıkış (Kaynak)</th>
                <th className="py-3 px-4">Varış (Hedef)</th>
                <th className="py-3 px-4">Ürün & Varyant</th>
                <th className="py-3 px-4 text-center">Miktar</th>
                <th className="py-3 px-4 text-center">Durum</th>
                <th className="py-3 px-4 text-center">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9] text-[#0b1c30]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[#707881]">
                    Transfer kaydı bulunamadı.
                  </td>
                </tr>
              ) : (
                filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-[#eff4ff]/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#006194]">
                      {t.code}
                    </td>
                    <td className="py-3 px-4 font-mono text-[#707881]">{t.date}</td>
                    <td className="py-3 px-4 font-medium">{t.fromLocation}</td>
                    <td className="py-3 px-4 font-bold text-[#0b1c30]">{t.toLocation}</td>
                    <td className="py-3 px-4">
                      <div>
                        <span className="font-semibold block">{t.productName}</span>
                        <span className="text-[11px] text-[#707881] font-mono">
                          {t.variant} ({t.sku})
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-sm">
                      {t.quantity} Adet
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                          t.status === 'Yolda'
                            ? 'bg-[#dce9ff] text-[#006194]'
                            : t.status === 'Teslim Alındı'
                            ? 'bg-[#e6f4ea] text-[#00685f]'
                            : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {t.status !== 'Teslim Alındı' ? (
                        <button
                          type="button"
                          onClick={() => onApproveTransfer(t.id)}
                          className="px-2.5 py-1 rounded bg-[#00685f] hover:bg-[#008378] text-white text-[11px] font-bold shadow-xs transition-colors"
                        >
                          Kabul Et & Stoğa Al
                        </button>
                      ) : (
                        <span className="text-[11px] text-[#00685f] font-semibold flex items-center justify-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Tamamlandı
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
