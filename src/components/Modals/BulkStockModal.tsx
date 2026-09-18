import React, { useState } from 'react';
import { X, ArrowLeftRight, Upload, Check, FileSpreadsheet } from 'lucide-react';

interface BulkStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmBulk: (delta: number) => void;
}

export const BulkStockModal: React.FC<BulkStockModalProps> = ({
  isOpen,
  onClose,
  onConfirmBulk,
}) => {
  if (!isOpen) return null;

  const [adjustmentValue, setAdjustmentValue] = useState<number>(10);
  const [targetVariantOption, setTargetVariantOption] = useState<'all-negatives' | 'all'>('all-negatives');

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmBulk(adjustmentValue);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#dce9ff] max-w-md w-full overflow-hidden">
        <div className="px-5 py-4 bg-[#eff4ff] border-b border-[#dce9ff] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 text-[#006194]" />
            <h3 className="font-heading text-sm font-bold text-[#0b1c30]">Toplu Stok Güncelleme</h3>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded-lg text-[#707881] hover:text-[#0b1c30]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleApply} className="p-5 space-y-4">
          <p className="text-xs text-[#565e74]">
            Excel veya CSV'den aktarım yapabilir ya da seçili filtrelere toplu düzeltme miktarı uygulayabilirsiniz.
          </p>

          <div className="p-4 border-2 border-dashed border-[#dce9ff] rounded-xl text-center bg-[#f8f9ff] hover:bg-[#eff4ff] transition-colors cursor-pointer">
            <Upload className="w-6 h-6 text-[#006194] mx-auto mb-1" />
            <span className="text-xs font-bold text-[#0b1c30] block">Excel / CSV Dosyası Yükle</span>
            <span className="text-[10px] text-[#707881]">Sürükleyip bırakın veya seçmek için tıklayın</span>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[#0b1c30]">
              Veya Hızlı Stok Ekleme / Dengeleme:
            </label>
            <select
              value={targetVariantOption}
              onChange={(e) => setTargetVariantOption(e.target.value as any)}
              className="w-full h-9 px-3 border border-[#bfc7d2] rounded-lg text-xs"
            >
              <option value="all-negatives">Sadece Ters Bakiye Veren Varyantlar</option>
              <option value="all">Tüm Varyantlar</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0b1c30] mb-1">
              Eklenecek / Düzeltilecek Miktar (Adet)
            </label>
            <input
              type="number"
              value={adjustmentValue}
              onChange={(e) => setAdjustmentValue(Number(e.target.value))}
              className="w-full h-9 px-3 border border-[#bfc7d2] rounded-lg text-xs font-mono font-bold"
              required
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg text-xs text-[#565e74] hover:bg-[#eff4ff]"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-[#006194] hover:bg-[#007bb9] text-white text-xs font-bold shadow-sm flex items-center gap-1"
            >
              <Check className="w-4 h-4" />
              <span>Toplu Uygula</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
