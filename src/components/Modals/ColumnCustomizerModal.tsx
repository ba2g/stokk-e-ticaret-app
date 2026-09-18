import React from 'react';
import { X, Check } from 'lucide-react';

export interface ColumnVisibility {
  variant: boolean;
  toShip: boolean;
  available: boolean;
  onHand: boolean;
  incoming: boolean;
  status: boolean;
  history: boolean;
  actions: boolean;
}

interface ColumnCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  columns: ColumnVisibility;
  onToggleColumn: (col: keyof ColumnVisibility) => void;
  onReset: () => void;
}

export const ColumnCustomizerModal: React.FC<ColumnCustomizerModalProps> = ({
  isOpen,
  onClose,
  columns,
  onToggleColumn,
  onReset,
}) => {
  if (!isOpen) return null;

  const columnLabels: { key: keyof ColumnVisibility; label: string }[] = [
    { key: 'variant', label: 'Varyant (Renk / Beden / SKU)' },
    { key: 'toShip', label: 'Sevk Edilecek Miktar' },
    { key: 'available', label: 'Kullanılabilir Stok' },
    { key: 'onHand', label: 'Eldeki Stok' },
    { key: 'incoming', label: 'Gelecek Miktar (PO)' },
    { key: 'status', label: 'Durum Rozeti' },
    { key: 'history', label: 'Envanter Geçmişi (Log)' },
    { key: 'actions', label: 'Hızlı İşlemler (Transfer / Menü)' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#dce9ff] max-w-sm w-full overflow-hidden">
        <div className="px-5 py-4 bg-[#eff4ff] border-b border-[#dce9ff] flex items-center justify-between">
          <h3 className="font-heading text-sm font-bold text-[#0b1c30]">
            Tablo Kolonlarını Özelleştir
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-[#707881] hover:text-[#0b1c30] hover:bg-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-2.5">
          <p className="text-[11px] text-[#565e74]">
            Görmek istediğiniz sütunları işaretleyin. Ayarlarınız anında yansıtılacaktır.
          </p>

          <div className="space-y-1.5 pt-1">
            {columnLabels.map((col) => (
              <label
                key={col.key}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-[#eff4ff] cursor-pointer text-xs font-medium text-[#0b1c30] transition-colors"
              >
                <span>{col.label}</span>
                <input
                  type="checkbox"
                  checked={columns[col.key]}
                  onChange={() => onToggleColumn(col.key)}
                  className="rounded text-[#006194] focus:ring-0 w-4 h-4 cursor-pointer"
                />
              </label>
            ))}
          </div>

          <div className="pt-3 border-t border-[#f1f5f9] flex items-center justify-between">
            <button
              type="button"
              onClick={onReset}
              className="text-xs text-[#006194] hover:underline font-semibold"
            >
              Varsayılana Sıfırla
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-[#006194] text-white text-xs font-bold hover:bg-[#007bb9] transition-colors"
            >
              Tamam
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
