import React, { useState } from 'react';
import { X, ArrowRightLeft, Send, Building2 } from 'lucide-react';
import { VariantItem, Product, StoreLocation } from '../../types';

interface QuickTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  variant: VariantItem | null;
  locations: StoreLocation[];
  currentLocation: StoreLocation;
  onCreateTransfer: (fromLoc: string, toLoc: string, quantity: number, notes: string) => void;
}

export const QuickTransferModal: React.FC<QuickTransferModalProps> = ({
  isOpen,
  onClose,
  product,
  variant,
  locations,
  currentLocation,
  onCreateTransfer,
}) => {
  if (!isOpen || !variant) return null;

  // default transfer quantity is deficit absolute value + 5 or minimum 5
  const defaultQty = variant.onHand < 0 ? Math.abs(variant.onHand) + 5 : 10;
  const [quantity, setQuantity] = useState<number>(defaultQty);
  const [sourceLocation, setSourceLocation] = useState<string>(
    locations.find((l) => l.id !== currentLocation.id)?.name || 'Ana Depo (Stokk)'
  );
  const [notes, setNotes] = useState<string>('Ters bakiye ve raf eksiğini tamamlama talebi');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateTransfer(sourceLocation, currentLocation.name, quantity, notes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#dce9ff] max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#f1f5f9] flex items-center justify-between bg-[#eff4ff]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#006194] text-white flex items-center justify-center">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading text-sm font-bold text-[#0b1c30]">
                Mağazalar Arası Transfer Talebi
              </h3>
              <p className="text-[11px] text-[#565e74]">
                {product.name} ({variant.colorName} / {variant.size})
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
          <div className="p-3 bg-[#f8f9ff] rounded-xl border border-[#e5eeff] space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[#707881]">SKU:</span>
              <span className="font-mono font-bold text-[#0b1c30]">{variant.sku}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#707881]">Kayseri Mağaza Mevcut:</span>
              <span className={`font-mono font-bold ${variant.onHand < 0 ? 'text-[#ba1a1a]' : 'text-[#0b1c30]'}`}>
                {variant.onHand} Adet {variant.onHand < 0 && '(Ters Bakiye)'}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0b1c30] mb-1">
              Çıkış Lokasyonu (Kaynak Depo/Şube)
            </label>
            <select
              value={sourceLocation}
              onChange={(e) => setSourceLocation(e.target.value)}
              className="w-full h-9 px-3 bg-white border border-[#bfc7d2] rounded-lg text-xs text-[#0b1c30] focus:outline-none focus:border-[#006194]"
            >
              {locations
                .filter((l) => l.name !== currentLocation.name)
                .map((loc) => (
                  <option key={loc.id} value={loc.name}>
                    {loc.name} ({loc.type})
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0b1c30] mb-1">
              Varış Lokasyonu (Hedef)
            </label>
            <div className="w-full h-9 px-3 bg-[#eff4ff] border border-[#dce9ff] rounded-lg text-xs text-[#0b1c30] font-semibold flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#006194]" />
              <span>{currentLocation.name}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0b1c30] mb-1">
              Transfer Edilecek Miktar (Adet) <span className="text-[#ba1a1a]">*</span>
            </label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
              className="w-full h-9 px-3 bg-white border border-[#bfc7d2] rounded-lg text-xs font-mono font-bold text-[#0b1c30] focus:outline-none focus:border-[#006194]"
              required
            />
            <p className="text-[11px] text-[#565e74] mt-1">
              Önerilen: Ters bakiyeyi kapatmak için en az {Math.abs(variant.onHand)} adet gereklidir.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0b1c30] mb-1">
              Açıklama / İrsaliye Notu
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full h-9 px-3 bg-white border border-[#bfc7d2] rounded-lg text-xs text-[#0b1c30] focus:outline-none focus:border-[#006194]"
            />
          </div>

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
              <Send className="w-3.5 h-3.5" />
              <span>Transfer Emri Oluştur</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
