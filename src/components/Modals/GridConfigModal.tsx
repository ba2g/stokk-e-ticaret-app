import React from 'react';
import {
  X,
  SlidersHorizontal,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Check
} from 'lucide-react';
import { GridColumnConfig, GridRenderType } from '../../types';

interface GridConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  columns: GridColumnConfig[];
  onUpdateColumns: (cols: GridColumnConfig[]) => void;
  onResetColumns: () => void;
}

export const GridConfigModal: React.FC<GridConfigModalProps> = ({
  isOpen,
  onClose,
  columns,
  onUpdateColumns,
  onResetColumns,
}) => {
  if (!isOpen) return null;

  const handleToggle = (id: string) => {
    const updated = columns.map((col) =>
      col.id === id ? { ...col, visible: !col.visible } : col
    );
    onUpdateColumns(updated);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const newCols = [...columns];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newCols.length) return;

    const temp = newCols[index];
    newCols[index] = newCols[targetIdx];
    newCols[targetIdx] = temp;

    // re-assign order numbers
    newCols.forEach((col, idx) => {
      col.order = idx + 1;
    });

    onUpdateColumns(newCols);
  };

  const handleRenderTypeChange = (id: string, renderType: GridRenderType) => {
    const updated = columns.map((col) =>
      col.id === id ? { ...col, renderType } : col
    );
    onUpdateColumns(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#dce9ff] max-w-xl w-full overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-[#eff4ff] border-b border-[#dce9ff] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-[#006194]" />
            <div>
              <h3 className="font-heading text-sm font-bold text-[#0b1c30]">
                B2B Grid Kolon & Dinamik Render Konfigürasyonu
              </h3>
              <p className="text-[11px] text-[#565e74]">
                Hangi alanların, hangi sırada ve hangi render tipiyle gösterileceğini belirleyin
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-[#707881] hover:text-[#0b1c30]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-4 overflow-y-auto space-y-2 flex-1 text-xs">
          <div className="text-[11px] text-[#707881] px-2 flex justify-between font-semibold">
            <span>KOLON VE ALAN ADI</span>
            <span>GÖRÜNÜRLÜK / SIRA</span>
          </div>

          {columns.map((col, idx) => (
            <div
              key={col.id}
              className={`p-2.5 rounded-xl border transition-all flex items-center justify-between ${
                col.visible
                  ? 'bg-white border-[#dce9ff] shadow-xs'
                  : 'bg-[#f8f9ff] border-[#e5eeff] opacity-60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#eff4ff] text-[#006194] font-mono text-[10px] font-bold flex items-center justify-center">
                  {col.order}
                </span>
                <div>
                  <span className="font-bold text-[#0b1c30] block">{col.label}</span>
                  <span className="text-[10px] text-[#707881] font-mono">
                    Alan: {col.field} | Render: {col.renderType}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Move Up/Down buttons */}
                <button
                  type="button"
                  onClick={() => handleMove(idx, 'up')}
                  disabled={idx === 0}
                  className="w-7 h-7 rounded-lg border border-[#e5eeff] flex items-center justify-center text-[#707881] hover:text-[#0b1c30] hover:bg-[#eff4ff] disabled:opacity-30"
                  title="Yukarı Taşı"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleMove(idx, 'down')}
                  disabled={idx === columns.length - 1}
                  className="w-7 h-7 rounded-lg border border-[#e5eeff] flex items-center justify-center text-[#707881] hover:text-[#0b1c30] hover:bg-[#eff4ff] disabled:opacity-30"
                  title="Aşağı Taşı"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>

                {/* Toggle Visibility */}
                <button
                  type="button"
                  onClick={() => handleToggle(col.id)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                    col.visible
                      ? 'bg-[#dce9ff] text-[#006194]'
                      : 'bg-[#eff4ff] text-[#707881]'
                  }`}
                  title={col.visible ? 'Gizle' : 'Göster'}
                >
                  {col.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-[#eff4ff]/60 border-t border-[#dce9ff] flex items-center justify-between">
          <button
            type="button"
            onClick={onResetColumns}
            className="flex items-center gap-1.5 text-xs text-[#565e74] hover:text-[#ba1a1a] font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Varsayılan B2B Şablonuna Dön</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#006194] hover:bg-[#007bb9] text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Uygula & Kapat</span>
          </button>
        </div>
      </div>
    </div>
  );
};
