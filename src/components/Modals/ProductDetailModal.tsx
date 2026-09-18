import React, { useState } from 'react';
import {
  X,
  Package,
  Layers,
  Building,
  Calendar,
  Tag,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ShoppingCart,
  Plus,
  Minus,
  Edit2,
  ExternalLink
} from 'lucide-react';
import { Product } from '../../types';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onGoToVariantMatrix: (product: Product) => void;
  onUpdateThreshold: (productId: string, newThreshold: number) => void;
  onUpdatePrice?: (productId: string, newPrice: number) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
  onGoToVariantMatrix,
  onUpdateThreshold,
  onUpdatePrice,
}) => {
  if (!isOpen || !product) return null;

  const [quantity, setQuantity] = useState<number>(1);
  const [editingThreshold, setEditingThreshold] = useState<boolean>(false);
  const [thresholdInput, setThresholdInput] = useState<number>(product.criticalStockThreshold);
  const [editingPrice, setEditingPrice] = useState<boolean>(false);
  const [priceInput, setPriceInput] = useState<number>(product.price);

  // Stock indicator computation based on custom threshold
  const isAvailable = product.totalOnHand > product.criticalStockThreshold;
  const isCritical = product.totalOnHand > 0 && product.totalOnHand <= product.criticalStockThreshold;
  const isOutOfStock = product.totalOnHand <= 0;

  const handleSaveThreshold = () => {
    onUpdateThreshold(product.id, thresholdInput);
    setEditingThreshold(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#dce9ff] max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-[#eff4ff] border-b border-[#dce9ff] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="px-2 py-0.5 rounded bg-[#006194] text-white text-[11px] font-bold uppercase tracking-wider font-mono">
              {product.code}
            </span>
            <h3 className="font-heading text-base sm:text-lg font-bold text-[#0b1c30]">
              {product.name}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#707881] hover:text-[#0b1c30] hover:bg-white/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Top Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Product Image */}
            <div className="md:col-span-4 flex flex-col items-center">
              <div className="w-full aspect-square rounded-2xl overflow-hidden border border-[#dce9ff] bg-[#f8f9ff] shadow-inner relative group">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="flex items-center gap-2 mt-3">
                {product.colors.map((c, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <span
                      className="w-3.5 h-3.5 rounded-full ring-1 ring-black/20"
                      style={{ backgroundColor: c.hex }}
                    />
                    <span className="text-[11px] text-[#565e74]">{c.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Technical Specifications */}
            <div className="md:col-span-8 space-y-4">
              <div>
                <span className="text-[10px] text-[#707881] uppercase tracking-wider font-bold">
                  {product.category} • {product.productType}
                </span>
                <h4 className="font-heading text-xl font-bold text-[#0b1c30] mt-0.5">
                  {product.name}
                </h4>
                <p className="text-[#565e74] mt-1 text-xs leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Badges & Meta */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-2.5 rounded-xl bg-[#f8f9ff] border border-[#e5eeff]">
                  <span className="text-[10px] text-[#707881] block">Marka:</span>
                  <span className="font-bold text-[#0b1c30] text-xs">{product.brand}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#f8f9ff] border border-[#e5eeff]">
                  <span className="text-[10px] text-[#707881] block">Üretici Firma:</span>
                  <span className="font-bold text-[#0b1c30] text-xs truncate block">{product.manufacturer}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#f8f9ff] border border-[#e5eeff]">
                  <span className="text-[10px] text-[#707881] block">Sezon:</span>
                  <span className="font-semibold text-[#0b1c30] text-xs">{product.season}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#f8f9ff] border border-[#e5eeff]">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#707881] block">Toptan Fiyat:</span>
                    {onUpdatePrice && !editingPrice && (
                      <button
                        type="button"
                        onClick={() => {
                          setPriceInput(product.price);
                          setEditingPrice(true);
                        }}
                        className="text-[10px] text-[#006194] hover:underline font-bold flex items-center gap-0.5"
                        title="Fiyatı Değiştir (Geçmiş siparişleri etkilemez)"
                      >
                        <Edit2 className="w-2.5 h-2.5" />
                        <span>Değiştir</span>
                      </button>
                    )}
                  </div>
                  {editingPrice ? (
                    <div className="flex items-center gap-1 mt-1">
                      <input
                        type="number"
                        value={priceInput}
                        onChange={(e) => setPriceInput(Number(e.target.value))}
                        className="w-20 h-6 px-1 text-xs font-mono font-bold border border-[#006194] rounded bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (onUpdatePrice && priceInput > 0) {
                            onUpdatePrice(product.id, priceInput);
                          }
                          setEditingPrice(false);
                        }}
                        className="px-2 py-0.5 bg-[#006194] text-white text-[10px] font-bold rounded"
                      >
                        Kaydet
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingPrice(false)}
                        className="px-1.5 py-0.5 text-gray-500 text-[10px]"
                      >
                        İptal
                      </button>
                    </div>
                  ) : (
                    <span className="font-mono font-bold text-[#00685f] text-sm block mt-0.5">
                      ₺{product.price.toLocaleString('tr-TR')} <span className="text-[10px] text-[#707881] font-normal font-sans">+ KDV</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Stock Status Indicator Box */}
              <div className="p-3.5 rounded-xl bg-[#eff4ff] border border-[#dce9ff] flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-[#0b1c30]">Görsel Stok Durumu:</span>
                    {isAvailable && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-[#e6f4ea] text-[#00685f]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Var
                      </span>
                    )}
                    {isCritical && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Kritik
                      </span>
                    )}
                    {isOutOfStock && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-[#ffdad6] text-[#ba1a1a]">
                        <XCircle className="w-3.5 h-3.5" />
                        Yok {product.totalOnHand < 0 && `(Ters Bakiye: ${product.totalOnHand})`}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#565e74] mt-1">
                    Eldeki Miktar: <strong className="font-mono text-[#0b1c30]">{product.totalOnHand} Adet</strong> | Gelecek Satınalma:{' '}
                    <strong className="font-mono text-[#00685f]">+{product.totalIncoming} Adet</strong>
                  </p>
                </div>

                {/* Critical Stock Threshold setting for this specific product */}
                <div className="text-right">
                  <span className="text-[10px] text-[#707881] block">Kritik Eşik Seviyesi:</span>
                  {editingThreshold ? (
                    <div className="flex items-center gap-1 mt-1">
                      <input
                        type="number"
                        value={thresholdInput}
                        onChange={(e) => setThresholdInput(Number(e.target.value))}
                        className="w-14 h-7 px-1.5 text-center font-mono font-bold bg-white border border-[#006194] rounded text-xs"
                      />
                      <button
                        type="button"
                        onClick={handleSaveThreshold}
                        className="px-2 py-1 bg-[#006194] text-white rounded text-[10px] font-bold"
                      >
                        Kaydet
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setEditingThreshold(true)}
                      className="inline-flex items-center gap-1 text-xs font-mono font-bold text-[#006194] hover:underline mt-0.5"
                    >
                      <span>{product.criticalStockThreshold} Adet</span>
                      <Edit2 className="w-3 h-3 text-[#707881]" />
                    </button>
                  )}
                </div>
              </div>

              {/* Features Tags */}
              <div>
                <span className="text-[10px] text-[#707881] uppercase tracking-wider font-bold block mb-1">
                  Öne Çıkan Ürün Özellikleri:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {product.features.map((feat, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-white border border-[#dce9ff] text-[#3f4850] text-[11px] font-medium"
                    >
                      {feat}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Variant breakdown preview table */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-[#0b1c30] text-xs">
                Varyant ve Beden Kırılımı ({product.variants.length} Varyant)
              </span>
              <button
                type="button"
                onClick={() => {
                  onGoToVariantMatrix(product);
                  onClose();
                }}
                className="text-[#006194] hover:underline font-bold text-xs flex items-center gap-1"
              >
                <span>Varyant Matrisini Aç</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="rounded-xl border border-[#e5eeff] overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#eff4ff] text-[#565e74] text-[10px] uppercase font-bold">
                  <tr>
                    <th className="py-2 px-3">Renk / Beden</th>
                    <th className="py-2 px-3">SKU</th>
                    <th className="py-2 px-3 text-right">Eldeki Stok</th>
                    <th className="py-2 px-3 text-right">Kullanılabilir</th>
                    <th className="py-2 px-3 text-right">Gelecek</th>
                    <th className="py-2 px-3 text-center">Durum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f1f5f9]">
                  {product.variants.map((v) => (
                    <tr key={v.id} className="hover:bg-[#eff4ff]/40">
                      <td className="py-2 px-3 font-semibold">
                        {v.colorName} / {v.size}
                      </td>
                      <td className="py-2 px-3 font-mono text-[#707881]">{v.sku}</td>
                      <td
                        className={`py-2 px-3 text-right font-mono font-bold ${
                          v.onHand < 0 ? 'text-[#ba1a1a]' : 'text-[#0b1c30]'
                        }`}
                      >
                        {v.onHand}
                      </td>
                      <td
                        className={`py-2 px-3 text-right font-mono font-semibold ${
                          v.available < 0 ? 'text-[#ba1a1a]' : 'text-[#00685f]'
                        }`}
                      >
                        {v.available}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-[#00685f]">
                        {v.incoming}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            v.status === 'Ters Bakiye'
                              ? 'bg-[#ffdad6] text-[#93000a]'
                              : v.status === 'Tükendi'
                              ? 'bg-[#eff4ff] text-[#565e74]'
                              : 'bg-[#dce9ff] text-[#006194]'
                          }`}
                        >
                          {v.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Footer with Direct Add to Cart Action */}
        <div className="px-6 py-4 bg-[#eff4ff]/70 border-t border-[#dce9ff] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-[#565e74]">Sipariş Miktarı:</span>
            <div className="flex items-center border border-[#bfc7d2] rounded-lg bg-white overflow-hidden shadow-xs">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-8 h-8 flex items-center justify-center text-[#565e74] hover:bg-[#eff4ff]"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                className="w-14 h-8 text-center font-mono font-bold text-xs text-[#0b1c30] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="w-8 h-8 flex items-center justify-center text-[#565e74] hover:bg-[#eff4ff]"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <span className="text-xs text-[#707881]">
              Toplam:{' '}
              <strong className="font-mono text-[#00685f] font-bold">
                ₺{(quantity * product.price).toLocaleString('tr-TR')}
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs text-[#565e74] hover:bg-white transition-colors"
            >
              Kapat
            </button>
            <button
              type="button"
              onClick={() => {
                onAddToCart(product, quantity);
                onClose();
              }}
              className="px-5 py-2.5 rounded-xl bg-[#006194] hover:bg-[#007bb9] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2 active:scale-95"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Sepete Ekle ({quantity} Adet)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
