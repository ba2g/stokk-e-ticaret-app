import React, { useState } from 'react';
import { X, Check, AlertCircle, Edit3 } from 'lucide-react';
import { VariantItem, Product } from '../../types';

interface EditStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  variant: VariantItem | null;
  onSave: (variantId: string, newOnHand: number, newAvailable: number, reason: string) => void;
}

export const EditStockModal: React.FC<EditStockModalProps> = ({
  isOpen,
  onClose,
  product,
  variant,
  onSave,
}) => {
  if (!isOpen || !variant) return null;

  const [onHandInput, setOnHandInput] = useState<number>(variant.onHand);
  const [availableInput, setAvailableInput] = useState<number>(variant.available);
  const [reason, setReason] = useState<string>('Fiziksel Sayım Düzeltmesi');
  const [notes, setNotes] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(variant.id, Number(onHandInput), Number(availableInput), reason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#dce9ff] max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#f1f5f9] flex items-center justify-between bg-[#eff4ff]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#006194] text-white flex items-center justify-center">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading text-sm font-bold text-[#0b1c30]">
                Stok Düzenle (Hızlı Düzeltme)
              </h3>
              <p className="text-[11px] text-[#565e74]">
                {product.name} • {variant.colorName} / {variant.size}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#707881] hover:text-[#0b1c30] p-1 rounded-lg hover:bg-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="p-3 bg-[#f8f9ff] rounded-xl border border-[#e5eeff] flex items-center justify-between text-xs">
            <div>
              <span className="text-[#707881] block text-[10px] uppercase font-bold">SKU Kodu</span>
              <span className="font-mono font-bold text-[#0b1c30]">{variant.sku}</span>
            </div>
            <div>
              <span className="text-[#707881] block text-[10px] uppercase font-bold">Mevcut Eldeki</span>
              <span className={`font-mono font-bold ${variant.onHand < 0 ? 'text-[#ba1a1a]' : 'text-[#0b1c30]'}`}>
                {variant.onHand} Adet
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#0b1c30] mb-1">
                Yeni Eldeki Stok <span className="text-[#ba1a1a]">*</span>
              </label>
              <input
                type="number"
                value={onHandInput}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setOnHandInput(val);
                  setAvailableInput(val - variant.toShip);
                }}
                className="w-full h-9 px-3 bg-white border border-[#bfc7d2] rounded-lg text-xs font-mono font-bold text-[#0b1c30] focus:outline-none focus:border-[#006194] focus:ring-1 focus:ring-[#006194]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#0b1c30] mb-1">
                Kullanılabilir Stok
              </label>
              <input
                type="number"
                value={availableInput}
                onChange={(e) => setAvailableInput(Number(e.target.value))}
                className="w-full h-9 px-3 bg-[#eff4ff] border border-[#dce9ff] rounded-lg text-xs font-mono font-bold text-[#0b1c30] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0b1c30] mb-1">
              Düzenleme Nedeni / Fiş Türü
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full h-9 px-3 bg-white border border-[#bfc7d2] rounded-lg text-xs text-[#0b1c30] focus:outline-none focus:border-[#006194]"
            >
              <option value="Fiziksel Sayım Düzeltmesi">Fiziksel Sayım Düzeltmesi (Fazlalık/Eksiklik)</option>
              <option value="Hasarlı / Kusurlu Ürün Zayiatı">Hasarlı / Kusurlu Ürün Zayiatı</option>
              <option value="Hatalı İrsaliye Eşleştirmesi">Hatalı İrsaliye Eşleştirmesi</option>
              <option value="Numune / Teşhir Çıkışı">Numune / Teşhir Çıkışı</option>
              <option value="Ters Bakiye Sıfırlama">Ters Bakiye Sıfırlama (Stokk ERP Senk.)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0b1c30] mb-1">
              Açıklama / Referans Belge No (Opsiyonel)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Örn: 2026/09 Kayseri Mağaza Raf Sayımı"
              className="w-full h-9 px-3 bg-white border border-[#bfc7d2] rounded-lg text-xs text-[#0b1c30] placeholder:text-[#707881] focus:outline-none focus:border-[#006194]"
            />
          </div>

          {onHandInput < 0 && (
            <div className="p-2.5 rounded-lg bg-[#ffdad6] text-[#93000a] text-[11px] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>
                Dikkat: Negatif (ters) bakiye kaydediyorsunuz. Bu durum sipariş karşılamada uyarı verecektir.
              </span>
            </div>
          )}

          {/* Footer buttons */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg text-xs font-semibold text-[#565e74] hover:bg-[#eff4ff] transition-colors"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-[#006194] hover:bg-[#007bb9] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Değişiklikleri Kaydet</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
