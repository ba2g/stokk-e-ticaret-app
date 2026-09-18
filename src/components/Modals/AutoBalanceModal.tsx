import React, { useState } from 'react';
import { X, CheckCircle2, RefreshCw, AlertTriangle, Layers, ArrowRight } from 'lucide-react';
import { Product, VariantItem } from '../../types';

interface AutoBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  mode: 'auto-balance' | 'stock-count';
  onApplyBalance: (actionType: 'reset-zeros' | 'po-match' | 'count-sheet', updatedVariants: VariantItem[]) => void;
}

export const AutoBalanceModal: React.FC<AutoBalanceModalProps> = ({
  isOpen,
  onClose,
  product,
  mode,
  onApplyBalance,
}) => {
  if (!isOpen) return null;

  const negativeVariants = product.variants.filter((v) => v.onHand < 0);
  const totalNegativeDeficit = negativeVariants.reduce((sum, v) => sum + Math.abs(v.onHand), 0);

  const [selectedStrategy, setSelectedStrategy] = useState<'po-match' | 'reset-zeros' | 'count-sheet'>(
    mode === 'stock-count' ? 'count-sheet' : 'po-match'
  );

  const handleExecute = () => {
    let updated: VariantItem[];
    if (selectedStrategy === 'reset-zeros') {
      // Set negative stocks to 0 with note
      updated = product.variants.map((v) => {
        if (v.onHand < 0) {
          return {
            ...v,
            onHand: 0,
            available: 0,
            status: 'Tükendi',
          };
        }
        return v;
      });
      onApplyBalance('reset-zeros', updated);
    } else if (selectedStrategy === 'po-match') {
      // Reconcile against incoming PO: deduct from incoming, set onHand to balanced
      updated = product.variants.map((v) => {
        if (v.onHand < 0) {
          const deficit = Math.abs(v.onHand);
          const newIncoming = Math.max(0, v.incoming - deficit);
          return {
            ...v,
            onHand: 0,
            available: 0,
            incoming: newIncoming,
            status: 'Tükendi',
          };
        }
        return v;
      });
      onApplyBalance('po-match', updated);
    } else {
      // Physical count sheet
      updated = product.variants.map((v) => {
        if (v.onHand < 0) {
          return {
            ...v,
            onHand: 2, // count physically confirmed as positive stock
            available: 2,
            status: 'Normal',
          };
        }
        return v;
      });
      onApplyBalance('count-sheet', updated);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#dce9ff] max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 bg-[#eff4ff] border-b border-[#dce9ff] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#006194] text-white flex items-center justify-center">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading text-sm font-bold text-[#0b1c30]">
                {mode === 'stock-count' ? 'Fiziksel Sayım Fişi Oluştur' : 'Otomatik Envanter Dengeleme'}
              </h3>
              <p className="text-[11px] text-[#565e74]">
                Stokk ERP & B2B Sipariş Motoru Eşitlemesi
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-[#707881] hover:text-[#0b1c30] hover:bg-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Summary Box */}
          <div className="p-3.5 rounded-xl bg-[#fff8f7] border border-[#ffdad6] flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[#ba1a1a] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-[#ba1a1a]">
                {negativeVariants.length} Varyantta Toplam -{totalNegativeDeficit} Adet Ters Bakiye Tespit Edildi
              </p>
              <p className="text-[11px] text-[#565e74] mt-0.5">
                Ters bakiyeler, fiziki irsaliyesi henüz girilmemiş satış faturalarından veya sayım eksikliklerinden kaynaklanır.
              </p>
            </div>
          </div>

          {/* Affected Variants list preview */}
          <div>
            <span className="text-[11px] font-bold text-[#707881] uppercase tracking-wider block mb-1.5">
              Etkilenen Varyantlar:
            </span>
            <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto pr-1">
              {negativeVariants.map((v) => (
                <div
                  key={v.id}
                  className="p-2 rounded-lg bg-[#f8f9ff] border border-[#e5eeff] text-xs flex items-center justify-between"
                >
                  <span className="font-semibold text-[#0b1c30] truncate">{v.colorName} / {v.size}</span>
                  <span className="font-mono font-bold text-[#ba1a1a]">{v.onHand} Adet</span>
                </div>
              ))}
            </div>
          </div>

          {/* Balancing Method Selector */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-[#0b1c30] block">
              Uygulanacak Eşitleme Yöntemi:
            </span>

            <label
              className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-colors ${
                selectedStrategy === 'po-match'
                  ? 'bg-[#eff4ff] border-[#006194]'
                  : 'bg-white border-[#bfc7d2] hover:bg-[#f8f9ff]'
              }`}
            >
              <input
                type="radio"
                name="balanceStrategy"
                checked={selectedStrategy === 'po-match'}
                onChange={() => setSelectedStrategy('po-match')}
                className="mt-1 text-[#006194] focus:ring-0"
              />
              <div>
                <p className="text-xs font-bold text-[#0b1c30]">
                  Gelecek Satınalma (PO) Siparişinden Mahsup Et (Önerilen)
                </p>
                <p className="text-[11px] text-[#565e74] mt-0.5">
                  Depoya gelecek 120 adet sevkiyattan ters bakiye kadar peşin tahsis yapılır, eldeki stok sıfırlanır.
                </p>
              </div>
            </label>

            <label
              className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-colors ${
                selectedStrategy === 'count-sheet'
                  ? 'bg-[#eff4ff] border-[#006194]'
                  : 'bg-white border-[#bfc7d2] hover:bg-[#f8f9ff]'
              }`}
            >
              <input
                type="radio"
                name="balanceStrategy"
                checked={selectedStrategy === 'count-sheet'}
                onChange={() => setSelectedStrategy('count-sheet')}
                className="mt-1 text-[#006194] focus:ring-0"
              />
              <div>
                <p className="text-xs font-bold text-[#0b1c30]">
                  Fiziksel Raf Sayım Fişi ile Eşitle (+2 Adet Emniyet Stoğu)
                </p>
                <p className="text-[11px] text-[#565e74] mt-0.5">
                  Mağaza rafı fiilen sayılmış kabul edilir, ERP'ye sayım fazlası fişi işlenerek stok normale döndürülür.
                </p>
              </div>
            </label>

            <label
              className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-colors ${
                selectedStrategy === 'reset-zeros'
                  ? 'bg-[#eff4ff] border-[#006194]'
                  : 'bg-white border-[#bfc7d2] hover:bg-[#f8f9ff]'
              }`}
            >
              <input
                type="radio"
                name="balanceStrategy"
                checked={selectedStrategy === 'reset-zeros'}
                onChange={() => setSelectedStrategy('reset-zeros')}
                className="mt-1 text-[#006194] focus:ring-0"
              />
              <div>
                <p className="text-xs font-bold text-[#0b1c30]">
                  Ters Bakiyeleri Sıfıra Eşitle (Düzeltme Fişi)
                </p>
                <p className="text-[11px] text-[#565e74] mt-0.5">
                  Tüm eksi bakiyeler 0 olarak güncellenir ve durumu 'Tükendi' olarak etiketlenir.
                </p>
              </div>
            </label>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#f1f5f9]">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg text-xs font-semibold text-[#565e74] hover:bg-[#eff4ff] transition-colors"
            >
              Vazgeç
            </button>
            <button
              type="button"
              onClick={handleExecute}
              className="px-4 py-2 rounded-lg bg-[#006194] hover:bg-[#007bb9] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Fişi Onayla & ERP'ye Gönder</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
