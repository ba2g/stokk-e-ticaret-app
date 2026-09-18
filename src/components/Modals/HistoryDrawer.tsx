import React from 'react';
import { X, History, ArrowDownRight, ArrowUpRight, FileText, User } from 'lucide-react';
import { VariantItem, Product, StockHistoryLog } from '../../types';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  variant: VariantItem | null;
  historyLogs: StockHistoryLog[];
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  product,
  variant,
  historyLogs,
}) => {
  if (!isOpen || !variant) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/30 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl border-l border-[#dce9ff] flex flex-col animate-in slide-in-from-right duration-200">
          {/* Header */}
          <div className="px-5 py-4 bg-[#eff4ff] border-b border-[#dce9ff] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#006194] text-white flex items-center justify-center">
                <History className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-heading text-sm font-bold text-[#0b1c30]">
                  Envanter Hareket Geçmişi
                </h3>
                <p className="text-[11px] text-[#565e74]">
                  {variant.sku} ({variant.colorName} / {variant.size})
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

          {/* Current Status Box */}
          <div className="p-4 bg-[#f8f9ff] border-b border-[#e5eeff] flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] text-[#707881] uppercase font-bold block">Ürün</span>
              <span className="font-semibold text-[#0b1c30]">{product.name}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-[#707881] uppercase font-bold block">Eldeki Bakiye</span>
              <span className={`font-mono font-bold text-sm ${variant.onHand < 0 ? 'text-[#ba1a1a]' : 'text-[#0b1c30]'}`}>
                {variant.onHand} Adet
              </span>
            </div>
          </div>

          {/* Log Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <div className="flex items-center justify-between pb-1">
              <span className="text-xs font-bold text-[#0b1c30]">Son Hareketler & Denetim İzi</span>
              <span className="text-[11px] text-[#707881]">ERP (Stokk V3) Anlık Kayıtları</span>
            </div>

            {historyLogs.length === 0 ? (
              <div className="text-center py-12 text-[#707881] text-xs">
                Bu varyant için kayıtlı eski hareket bulunamadı.
              </div>
            ) : (
              historyLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl border border-[#e5eeff] bg-white hover:bg-[#eff4ff]/60 transition-colors space-y-2 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#dce9ff] text-[#006194]">
                      {log.type}
                    </span>
                    <span className="text-[10px] text-[#707881] font-mono">{log.date}</span>
                  </div>

                  <p className="text-xs text-[#0b1c30] font-medium leading-snug">
                    {log.description}
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-[#f1f5f9] text-[11px]">
                    <div className="flex items-center gap-1 text-[#707881]">
                      <FileText className="w-3 h-3" />
                      <span className="font-mono">{log.referenceNo}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`font-mono font-bold flex items-center gap-0.5 ${
                          log.changeAmount < 0 ? 'text-[#ba1a1a]' : 'text-[#00685f]'
                        }`}
                      >
                        {log.changeAmount < 0 ? (
                          <ArrowDownRight className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        )}
                        {log.changeAmount > 0 ? `+${log.changeAmount}` : log.changeAmount}
                      </span>
                      <span className="text-[#707881] text-[10px]">
                        (Bakiye: <strong className="text-[#0b1c30]">{log.balanceAfter}</strong>)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-[10px] text-[#707881] pt-0.5">
                    <User className="w-3 h-3" />
                    <span>İşlem Yapan: {log.operator}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-4 bg-white border-t border-[#f1f5f9] flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-[#eff4ff] text-[#006194] text-xs font-bold hover:bg-[#e5eeff] transition-colors"
            >
              Kapat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
