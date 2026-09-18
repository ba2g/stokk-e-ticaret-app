import React from 'react';
import { Settings, Database, RefreshCw, CheckCircle2, Shield, Bell } from 'lucide-react';

export const SettingsView: React.FC = () => {
  return (
    <div className="p-4 sm:p-6 max-w-[1600px] w-full mx-auto space-y-4">
      <div className="bg-white p-4 rounded-xl border border-[#e5eeff] shadow-xs">
        <h2 className="font-heading text-lg font-bold text-[#0b1c30]">
          Sistem & Entegrasyon Ayarları
        </h2>
        <p className="text-xs text-[#565e74]">
          Stokk ERP bağlantısı, mağaza parametreleri ve toptan B2B kuralları
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Stokk ERP Integration */}
        <div className="bg-white p-5 rounded-2xl border border-[#e5eeff] shadow-sm space-y-3">
          <div className="flex items-center gap-2.5 pb-2 border-b border-[#f1f5f9]">
            <Database className="w-5 h-5 text-[#006194]" />
            <h3 className="font-heading text-sm font-bold text-[#0b1c30]">
              Stokk ERP Entegrasyon Durumu
            </h3>
          </div>

          <div className="p-3 rounded-xl bg-[#e6f4ea] text-[#00685f] text-xs font-semibold flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Canlı API Köprüsü Bağlı (REST API v2)</span>
            </span>
            <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded">200 OK</span>
          </div>

          <div className="space-y-2 text-xs text-[#565e74]">
            <div className="flex justify-between py-1 border-b border-[#f8fafc]">
              <span>Sunucu:</span>
              <span className="font-mono font-bold text-[#0b1c30]">erp.stokktekstil.com.tr</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#f8fafc]">
              <span>Şirket Kodu / Veritabanı:</span>
              <span className="font-mono font-bold text-[#0b1c30]">STOKK_2026_LIVE</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#f8fafc]">
              <span>Otomatik Senkronizasyon Aralığı:</span>
              <span className="font-bold text-[#0b1c30]">Her 60 saniyede bir</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => alert('Stokk ERP ile tüm stok ve irsaliyeler senkronize edildi.')}
            className="w-full py-2 rounded-xl bg-[#eff4ff] hover:bg-[#dce9ff] text-[#006194] text-xs font-bold transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Şimdi Manuel Senkronize Et</span>
          </button>
        </div>

        {/* Negative Stock Rules */}
        <div className="bg-white p-5 rounded-2xl border border-[#e5eeff] shadow-sm space-y-3">
          <div className="flex items-center gap-2.5 pb-2 border-b border-[#f1f5f9]">
            <Shield className="w-5 h-5 text-[#006194]" />
            <h3 className="font-heading text-sm font-bold text-[#0b1c30]">
              Ters Bakiye & İrsaliye Kuralları
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input type="checkbox" defaultChecked className="mt-0.5 rounded text-[#006194]" />
              <div>
                <span className="font-bold text-[#0b1c30] block">Ters Bakiyeli Satışa İzin Ver</span>
                <span className="text-[#565e74] text-[11px]">
                  Fiziki irsaliyesi henüz girilmemiş mallar için B2B fatura kesilmesine müsaade eder.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-2.5 cursor-pointer">
              <input type="checkbox" defaultChecked className="mt-0.5 rounded text-[#006194]" />
              <div>
                <span className="font-bold text-[#0b1c30] block">Otomatik Kritik Stok Bildirimi</span>
                <span className="text-[#565e74] text-[11px]">
                  Eldeki stok 0'ın altına düştüğünde depo yöneticisine anlık e-posta ve push uyarısı gönderir.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-2.5 cursor-pointer">
              <input type="checkbox" defaultChecked className="mt-0.5 rounded text-[#006194]" />
              <div>
                <span className="font-bold text-[#0b1c30] block">Gelecek PO ile Otomatik Mahsup</span>
                <span className="text-[#565e74] text-[11px]">
                  Ters bakiyeler, mal kabul yapıldığında otomatik olarak ilk sıradan düşülür.
                </span>
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
