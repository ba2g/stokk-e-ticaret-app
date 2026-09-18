import React from 'react';
import { BarChart2, TrendingDown, AlertTriangle, CheckCircle2, Download } from 'lucide-react';
import { Product } from '../../types';

interface ReportsViewProps {
  products: Product[];
  onGoToMatrix: () => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ products, onGoToMatrix }) => {
  const activeProduct = products[0];
  const negativeVariants = activeProduct.variants.filter((v) => v.onHand < 0);

  return (
    <div className="p-4 sm:p-6 max-w-[1600px] w-full mx-auto space-y-4">
      <div className="bg-white p-4 rounded-xl border border-[#e5eeff] shadow-xs flex items-center justify-between">
        <div>
          <h2 className="font-heading text-lg font-bold text-[#0b1c30]">
            Operasyonel Envanter ve Stok Fark Raporları
          </h2>
          <p className="text-xs text-[#565e74]">
            Ters bakiye analizleri, sipariş karşılama oranı ve dönemsel sayım farkları
          </p>
        </div>

        <button
          type="button"
          onClick={() => alert('PDF denetim raporu hazırlanıyor...')}
          className="px-3.5 py-2 rounded-lg bg-[#eff4ff] text-[#006194] hover:bg-[#e5eeff] text-xs font-bold flex items-center gap-1.5 border border-[#dce9ff]"
        >
          <Download className="w-4 h-4" />
          <span>Raporu PDF İndir</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#ffdad6] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-[#ba1a1a]">
              Ters Bakiye Yaratan Hacim
            </span>
            <AlertTriangle className="w-4 h-4 text-[#ba1a1a]" />
          </div>
          <p className="font-heading text-2xl font-bold text-[#ba1a1a] mt-2">-18 Adet</p>
          <p className="text-[11px] text-[#707881] mt-1">
            Kadife Flare Pantolon (Kayseri Mağaza Raf A-14)
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#e5eeff] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-[#006194]">
              Sipariş Karşılama Oranı
            </span>
            <CheckCircle2 className="w-4 h-4 text-[#00685f]" />
          </div>
          <p className="font-heading text-2xl font-bold text-[#00685f] mt-2">%94.2</p>
          <p className="text-[11px] text-[#707881] mt-1">
            Son 30 gün içinde sevk edilen toptan siparişler
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#e5eeff] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-[#006194]">
              ERP Senkronizasyon Gecikmesi
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          </div>
          <p className="font-heading text-2xl font-bold text-[#0b1c30] mt-2">0.4 sn</p>
          <p className="text-[11px] text-[#707881] mt-1">Stokk ERP canlı veri akışı aktif</p>
        </div>
      </div>

      {/* Discrepancy Table */}
      <div className="bg-white rounded-2xl border border-[#e5eeff] shadow-sm p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-sm font-bold text-[#0b1c30]">
            Aktif Stok Fark ve Negatif Bakiye Tablosu
          </h3>
          <button
            type="button"
            onClick={onGoToMatrix}
            className="text-xs text-[#006194] font-bold hover:underline"
          >
            Matriste Düzelt
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#eff4ff] text-[#565e74] uppercase text-[10px] font-bold">
              <tr>
                <th className="py-2.5 px-3">Varyant</th>
                <th className="py-2.5 px-3">SKU</th>
                <th className="py-2.5 px-3 text-center">ERP Kayıtlı Stok</th>
                <th className="py-2.5 px-3 text-center">Gelecek Miktar</th>
                <th className="py-2.5 px-3 text-center">Öngörülen Çözüm</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9]">
              {negativeVariants.map((v) => (
                <tr key={v.id}>
                  <td className="py-2.5 px-3 font-semibold">{v.colorName} / {v.size}</td>
                  <td className="py-2.5 px-3 font-mono text-[#707881]">{v.sku}</td>
                  <td className="py-2.5 px-3 text-center font-mono font-bold text-[#ba1a1a]">{v.onHand}</td>
                  <td className="py-2.5 px-3 text-center font-mono font-semibold text-[#00685f]">{v.incoming}</td>
                  <td className="py-2.5 px-3 text-center text-[11px] text-[#565e74]">
                    {v.incoming >= Math.abs(v.onHand)
                      ? 'Gelecek PO ile mahsup edilebilir'
                      : 'Ana Depo’dan acil transfer gerekli'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
