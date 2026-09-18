import React, { useState } from 'react';
import { X, ShoppingCart, Plus, Minus, Check, PackageCheck } from 'lucide-react';
import { Product } from '../../types';

interface QuickOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onAddToCart: (items: { sku: string; name: string; variant: string; qty: number; price: number }[]) => void;
}

export const QuickOrderModal: React.FC<QuickOrderModalProps> = ({
  isOpen,
  onClose,
  products,
  onAddToCart,
}) => {
  if (!isOpen) return null;

  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [customer, setCustomer] = useState('Moda Vizyon Butik Ltd.');

  const activeProduct = products.find((p) => p.id === selectedProductId) || products[0];

  const handleQtyChange = (sku: string, delta: number) => {
    const variant = activeProduct.variants.find((v) => v.sku === sku);
    const maxStock = variant ? Math.max(0, variant.onHand) : 0;
    if (maxStock <= 0) return;

    setQuantities((prev) => {
      const current = prev[sku] || 0;
      const next = Math.min(maxStock, Math.max(0, current + delta));
      return { ...prev, [sku]: next };
    });
  };

  const handleSetExact = (sku: string, val: number) => {
    const variant = activeProduct.variants.find((v) => v.sku === sku);
    const maxStock = variant ? Math.max(0, variant.onHand) : 0;
    if (maxStock <= 0) {
      setQuantities((prev) => ({ ...prev, [sku]: 0 }));
      return;
    }
    setQuantities((prev) => ({
      ...prev,
      [sku]: Math.min(maxStock, Math.max(0, val)),
    }));
  };

  const totalSelectedQty = Object.values(quantities).reduce((a, b) => a + b, 0);
  const wholesalePricePerUnit = 480; // TL

  const handleConfirmOrder = () => {
    const orderItems = Object.entries(quantities)
      .filter(([_, qty]) => qty > 0)
      .map(([sku, qty]) => {
        const variant = activeProduct.variants.find((v) => v.sku === sku);
        return {
          sku,
          name: activeProduct.name,
          variant: `${variant?.colorName || ''} / ${variant?.size || ''}`,
          qty,
          price: wholesalePricePerUnit,
        };
      });

    if (orderItems.length === 0) {
      alert('Lütfen en az 1 adet varyant miktarı seçin.');
      return;
    }

    onAddToCart(orderItems);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#dce9ff] max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-[#eff4ff] border-b border-[#dce9ff] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#006194] text-white flex items-center justify-center">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading text-sm font-bold text-[#0b1c30]">
                B2B Hızlı Matris Sipariş Girişi
              </h3>
              <p className="text-[11px] text-[#565e74]">
                Renk ve Beden bazında toptan asorti sipariş oluşturma
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

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Customer & Product Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#0b1c30] mb-1">
                Sipariş Veren Müşteri (Bayi)
              </label>
              <select
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
                className="w-full h-9 px-3 bg-white border border-[#bfc7d2] rounded-lg text-xs text-[#0b1c30] focus:outline-none focus:border-[#006194]"
              >
                <option value="Moda Vizyon Butik Ltd.">Moda Vizyon Butik Ltd. (Kayseri)</option>
                <option value="Trendline Giyim A.Ş.">Trendline Giyim A.Ş. (Ankara)</option>
                <option value="Kapadokya Tekstil">Kapadokya Tekstil Mağazacılık</option>
                <option value="Ege Butik Perakende">Ege Butik Perakende (İzmir)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0b1c30] mb-1">
                Seçili Ürün
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full h-9 px-3 bg-white border border-[#bfc7d2] rounded-lg text-xs text-[#0b1c30] focus:outline-none focus:border-[#006194]"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Product Quick Banner */}
          <div className="p-3 bg-[#f8f9ff] rounded-xl border border-[#e5eeff] flex items-center gap-3">
            <img
              src={activeProduct.image}
              alt={activeProduct.name}
              className="w-12 h-12 rounded-lg object-cover bg-white"
            />
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-[#0b1c30] truncate">{activeProduct.name}</h4>
              <p className="text-[11px] text-[#707881]">
                Kod: <span className="font-mono font-semibold">{activeProduct.code}</span> • Toptan Birim Fiyat: ₺{wholesalePricePerUnit} + KDV
              </p>
            </div>
          </div>

          {/* Matrix Grid Input */}
          <div>
            <span className="text-xs font-bold text-[#0b1c30] block mb-2">
              Varyant & Beden Matrisi Miktar Girişi:
            </span>

            <div className="border border-[#e5eeff] rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#eff4ff] text-[#565e74] uppercase text-[10px] font-bold">
                  <tr>
                    <th className="py-2.5 px-3">Varyant</th>
                    <th className="py-2.5 px-3">SKU</th>
                    <th className="py-2.5 px-3 text-center">Eldeki Stok</th>
                    <th className="py-2.5 px-3 text-center w-36">Sipariş Miktarı</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f1f5f9]">
                  {activeProduct.variants.map((v) => (
                    <tr key={v.id} className="hover:bg-[#f8f9ff]">
                      <td className="py-2 px-3 font-semibold text-[#0b1c30]">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full inline-block"
                            style={{ backgroundColor: v.colorHex }}
                          />
                          <span>{v.colorName} / {v.size}</span>
                        </div>
                      </td>
                      <td className="py-2 px-3 font-mono text-[#707881] text-[11px]">{v.sku}</td>
                      <td className="py-2 px-3 text-center font-mono">
                        <span className={v.onHand <= 0 ? 'text-[#ba1a1a] font-bold' : 'text-[#00685f] font-bold'}>
                          {v.onHand <= 0 ? 'Tükendi (0)' : `${v.onHand} Adet`}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-center">
                        {v.onHand > 0 ? (
                          <div className="inline-flex items-center border border-[#bfc7d2] rounded-lg overflow-hidden bg-white shadow-xs">
                            <button
                              type="button"
                              disabled={(quantities[v.sku] || 0) <= 0}
                              onClick={() => handleQtyChange(v.sku, -1)}
                              className="w-7 h-7 flex items-center justify-center hover:bg-[#eff4ff] text-[#565e74] disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <input
                              type="number"
                              min="0"
                              max={v.onHand}
                              value={quantities[v.sku] || 0}
                              onChange={(e) => handleSetExact(v.sku, Number(e.target.value))}
                              className="w-12 h-7 text-center font-mono text-xs font-bold focus:outline-none"
                            />
                            <button
                              type="button"
                              disabled={(quantities[v.sku] || 0) >= v.onHand}
                              onClick={() => handleQtyChange(v.sku, 1)}
                              className="w-7 h-7 flex items-center justify-center hover:bg-[#eff4ff] text-[#006194] disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <span className="inline-block px-2.5 py-1 rounded bg-gray-100 text-gray-400 text-[11px] font-medium border border-gray-200">
                            Stok Yok
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer Summary */}
        <div className="p-4 bg-[#eff4ff] border-t border-[#dce9ff] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <p className="text-xs text-[#565e74]">
              Toplam Sipariş: <strong className="text-[#0b1c30] text-sm">{totalSelectedQty} Adet</strong>
            </p>
            <p className="text-[11px] text-[#707881]">
              Tahmini Sipariş Tutarı: <strong className="text-[#006194]">₺{(totalSelectedQty * wholesalePricePerUnit).toLocaleString('tr-TR')} + KDV</strong>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-[#565e74] hover:bg-white transition-colors"
            >
              Kapat
            </button>
            <button
              type="button"
              onClick={handleConfirmOrder}
              disabled={totalSelectedQty === 0}
              className="px-4 py-2 rounded-lg bg-[#006194] hover:bg-[#007bb9] disabled:opacity-50 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
            >
              <PackageCheck className="w-4 h-4" />
              <span>Sepete Ekle / Sipariş Oluştur</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
