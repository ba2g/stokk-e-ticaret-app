import React, { useState } from 'react';
import {
  Plus,
  Search,
  Trash2,
  Edit,
  Package,
  CheckCircle2,
  X,
  Image as ImageIcon,
  Tag,
  Building,
  DollarSign,
  Layers,
  Sparkles
} from 'lucide-react';
import { Product } from '../../types';
import { productService, CreateProductDto } from '../../services/productService';

interface AdminProductsViewProps {
  products?: Product[];
  onProductsChanged?: () => void;
}

export const AdminProductsView: React.FC<AdminProductsViewProps> = ({
  products: propProducts,
  onProductsChanged,
}) => {
  const [localProducts, setLocalProducts] = useState<Product[]>(() => {
    return propProducts || productService.getProducts();
  });
  const [searchTerm, setSearchTerm] = useState('');

  const products = propProducts || localProducts;

  const reloadProducts = () => {
    setLocalProducts(productService.getProducts());
    if (onProductsChanged) onProductsChanged();
  };
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State with ALL required fields:
  // ürün kodu, ürün adı, açıklama, üretici kodu, üretici, marka, özel kod 1, özel kod 2, resim, stok miktarı, fiyat
  const [formCode, setFormCode] = useState('');
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formManufacturerCode, setFormManufacturerCode] = useState('');
  const [formManufacturer, setFormManufacturer] = useState('Stokk Tekstil San. Tic. A.Ş.');
  const [formBrand, setFormBrand] = useState('Stokk Collection');
  const [formSpecialCode1, setFormSpecialCode1] = useState('');
  const [formSpecialCode2, setFormSpecialCode2] = useState('');
  const [formImage, setFormImage] = useState('');
  const [formStockQuantity, setFormStockQuantity] = useState<number>(50);
  const [formCriticalStockThreshold, setFormCriticalStockThreshold] = useState<number>(5);
  const [formPrice, setFormPrice] = useState<number>(750);
  const [formCategory, setFormCategory] = useState('Kadın Tekstil');
  const [formProductType, setFormProductType] = useState('Pantolon');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const resetForm = () => {
    setFormCode('');
    setFormName('');
    setFormDescription('');
    setFormManufacturerCode('');
    setFormManufacturer('Stokk Tekstil San. Tic. A.Ş.');
    setFormBrand('Stokk Collection');
    setFormSpecialCode1('');
    setFormSpecialCode2('');
    setFormImage('');
    setFormStockQuantity(50);
    setFormCriticalStockThreshold(5);
    setFormPrice(750);
    setFormCategory('Kadın Tekstil');
    setFormProductType('Pantolon');
    setEditingProduct(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormCode(p.code);
    setFormName(p.name);
    setFormDescription(p.description);
    setFormManufacturerCode(p.manufacturerCode || '');
    setFormManufacturer(p.manufacturer);
    setFormBrand(p.brand);
    setFormSpecialCode1(p.specialCode1 || '');
    setFormSpecialCode2(p.specialCode2 || '');
    setFormImage(p.image);
    setFormStockQuantity(p.totalOnHand);
    setFormCriticalStockThreshold(p.criticalStockThreshold !== undefined ? p.criticalStockThreshold : 5);
    setFormPrice(p.price);
    setFormCategory(p.category);
    setFormProductType(p.productType);
    setIsAddModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCode.trim() || !formName.trim() || formPrice <= 0) {
      alert('Lütfen ürün kodu, ürün adı ve geçerli bir fiyat giriniz.');
      return;
    }

    if (editingProduct) {
      // Update
      const updated: Product = {
        ...editingProduct,
        code: formCode.trim().toUpperCase(),
        name: formName.trim(),
        description: formDescription.trim(),
        manufacturerCode: formManufacturerCode.trim(),
        manufacturer: formManufacturer.trim(),
        brand: formBrand.trim(),
        specialCode1: formSpecialCode1.trim(),
        specialCode2: formSpecialCode2.trim(),
        image: formImage.trim() || editingProduct.image,
        totalOnHand: formStockQuantity,
        availableStock: formStockQuantity,
        criticalStockThreshold: Math.max(1, formCriticalStockThreshold || 5),
        price: formPrice,
        category: formCategory,
        productType: formProductType,
      };
      productService.updateProduct(updated);
      showToast(`'${updated.name}' ürünü başarıyla güncellendi.`);
    } else {
      // Create new
      const dto: CreateProductDto = {
        code: formCode,
        name: formName,
        description: formDescription,
        manufacturerCode: formManufacturerCode,
        manufacturer: formManufacturer,
        brand: formBrand,
        specialCode1: formSpecialCode1,
        specialCode2: formSpecialCode2,
        image: formImage || 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&q=80',
        stockQuantity: formStockQuantity,
        criticalStockThreshold: Math.max(1, formCriticalStockThreshold || 5),
        price: formPrice,
        category: formCategory,
        productType: formProductType,
      };
      const created = productService.addProduct(dto);
      showToast(`'${created.name}' (${created.code}) sisteme eklendi.`);
    }

    setIsAddModalOpen(false);
    resetForm();
    reloadProducts();
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`'${name}' ürününü sistemden silmek istediğinize emin misiniz?`)) {
      productService.deleteProduct(id);
      showToast(`'${name}' ürünü silindi.`);
      reloadProducts();
    }
  };

  const filtered = products.filter((p) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.code.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.manufacturer.toLowerCase().includes(q) ||
      (p.specialCode1 && p.specialCode1.toLowerCase().includes(q)) ||
      (p.specialCode2 && p.specialCode2.toLowerCase().includes(q))
    );
  });

  return (
    <div className="p-4 sm:p-6 max-w-[1600px] w-full mx-auto space-y-4">
      {/* Header */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#e5eeff] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-[#006194] text-white text-[10px] font-extrabold uppercase tracking-wider">
              YÖNETİCİ PANELİ
            </span>
            <h1 className="font-heading text-lg sm:text-xl font-bold text-[#0b1c30]">
              Ürün Yönetimi
            </h1>
          </div>
          <p className="text-xs text-[#565e74] mt-1">
            Ürün kodları, üretici kodları, özel kodlar, stok miktarı ve fiyat bilgilerini yönetici olarak tanımlayın ve düzenleyin.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="px-4 py-2 rounded-xl bg-[#006194] hover:bg-[#007bb9] text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni Ürün Ekle</span>
        </button>
      </div>

      {toastMessage && (
        <div className="p-3 bg-[#e6f4ea] border border-[#00685f]/30 rounded-xl text-xs font-semibold text-[#00685f] flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white p-3 rounded-2xl border border-[#e5eeff] flex items-center gap-2">
        <Search className="w-4 h-4 text-[#707881]" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Ürün kodu, adı, üretici kodu, özel kod 1 veya özel kod 2 ile ara..."
          className="w-full h-8 px-2 bg-[#eff4ff] rounded-lg text-xs text-[#0b1c30] placeholder:text-[#707881] focus:outline-none focus:bg-white focus:border-[#006194]"
        />
        {searchTerm && (
          <button type="button" onClick={() => setSearchTerm('')} className="text-[#707881]">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-[#e5eeff] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#eff4ff] border-b border-[#dce9ff] text-[#565e74] text-[11px] uppercase tracking-wider font-bold">
                <th className="py-3 px-3">Görsel</th>
                <th className="py-3 px-3">Ürün Kodu</th>
                <th className="py-3 px-3">Ürün Adı</th>
                <th className="py-3 px-3">Marka / Üretici</th>
                <th className="py-3 px-3">Üretici Kodu</th>
                <th className="py-3 px-3">Özel Kodlar</th>
                <th className="py-3 px-3 text-center">Stok Miktarı</th>
                <th className="py-3 px-3 text-right">Fiyat</th>
                <th className="py-3 px-3 text-center">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9] text-[#0b1c30]">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-[#eff4ff]/40 transition-colors">
                  <td className="py-2.5 px-3">
                    <div className="w-12 h-12 rounded-xl bg-[#eff4ff] border border-[#dce9ff] overflow-hidden">
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                    </div>
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-[#006194]">{p.code}</td>
                  <td className="py-2.5 px-3">
                    <span className="font-bold text-[#0b1c30] block">{p.name}</span>
                    <span className="text-[10px] text-[#707881] line-clamp-1">{p.description}</span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="font-semibold text-[#0b1c30] block">{p.brand}</span>
                    <span className="text-[10px] text-[#707881] block">{p.manufacturer}</span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-xs text-[#565e74]">
                    {p.manufacturerCode || '-'}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[10px] text-[#565e74]">
                    <div>Ö1: {p.specialCode1 || '-'}</div>
                    <div>Ö2: {p.specialCode2 || '-'}</div>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full font-mono font-bold text-xs ${
                        p.totalOnHand <= 0
                          ? 'bg-[#ffdad6] text-[#ba1a1a]'
                          : p.totalOnHand <= (p.criticalStockThreshold ?? 5)
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-[#e6f4ea] text-[#00685f]'
                      }`}
                    >
                      {p.totalOnHand <= 0 ? 'Tükendi (0)' : `${p.totalOnHand} Adet`}
                    </span>
                    <span className="block text-[10px] text-[#707881] font-mono mt-0.5">
                      Eşik: {p.criticalStockThreshold ?? 5}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-extrabold text-sm text-[#0b1c30]">
                    ₺{p.price.toLocaleString('tr-TR')}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <div className="inline-flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(p)}
                        className="p-1.5 rounded-lg text-[#006194] hover:bg-[#dce9ff] transition-colors"
                        title="Düzenle"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(p.id, p.name)}
                        className="p-1.5 rounded-lg text-[#ba1a1a] hover:bg-[#ffdad6] transition-colors"
                        title="Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ÜRÜN EKLEME / DÜZENLEME MODALI */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-2xl rounded-3xl border border-[#dce9ff] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 bg-[#eff4ff] border-b border-[#dce9ff] flex items-center justify-between">
              <h2 className="font-heading text-base sm:text-lg font-bold text-[#0b1c30]">
                {editingProduct ? 'Ürün Bilgilerini Güncelle' : 'Yeni Ürün Tanımla (Yönetici)'}
              </h2>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-[#565e74] hover:bg-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Ürün Kodu */}
                <div>
                  <label className="font-bold text-[#0b1c30] block mb-1">Ürün Kodu *</label>
                  <input
                    type="text"
                    required
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    placeholder="örn: 25KTPNT9999"
                    className="w-full h-9 px-3 bg-[#eff4ff] border border-[#dce9ff] rounded-xl font-mono focus:bg-white focus:outline-none focus:border-[#006194]"
                  />
                </div>

                {/* Ürün Adı */}
                <div>
                  <label className="font-bold text-[#0b1c30] block mb-1">Ürün Adı *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="örn: İtalyan Dokuma Kaşe Kaban"
                    className="w-full h-9 px-3 bg-[#eff4ff] border border-[#dce9ff] rounded-xl focus:bg-white focus:outline-none focus:border-[#006194]"
                  />
                </div>

                {/* Marka */}
                <div>
                  <label className="font-bold text-[#0b1c30] block mb-1">Marka</label>
                  <input
                    type="text"
                    value={formBrand}
                    onChange={(e) => setFormBrand(e.target.value)}
                    placeholder="örn: Stokk Collection"
                    className="w-full h-9 px-3 bg-[#eff4ff] border border-[#dce9ff] rounded-xl focus:bg-white focus:outline-none focus:border-[#006194]"
                  />
                </div>

                {/* Üretici */}
                <div>
                  <label className="font-bold text-[#0b1c30] block mb-1">Üretici Firma</label>
                  <input
                    type="text"
                    value={formManufacturer}
                    onChange={(e) => setFormManufacturer(e.target.value)}
                    placeholder="örn: Stokk Tekstil San. Tic. A.Ş."
                    className="w-full h-9 px-3 bg-[#eff4ff] border border-[#dce9ff] rounded-xl focus:bg-white focus:outline-none focus:border-[#006194]"
                  />
                </div>

                {/* Üretici Kodu */}
                <div>
                  <label className="font-bold text-[#0b1c30] block mb-1">Üretici Kodu</label>
                  <input
                    type="text"
                    value={formManufacturerCode}
                    onChange={(e) => setFormManufacturerCode(e.target.value)}
                    placeholder="örn: URT-STK-5138"
                    className="w-full h-9 px-3 bg-[#eff4ff] border border-[#dce9ff] rounded-xl font-mono focus:bg-white focus:outline-none focus:border-[#006194]"
                  />
                </div>

                {/* Resim URL */}
                <div>
                  <label className="font-bold text-[#0b1c30] block mb-1">Resim URL</label>
                  <input
                    type="url"
                    value={formImage}
                    onChange={(e) => setFormImage(e.target.value)}
                    placeholder="https://..."
                    className="w-full h-9 px-3 bg-[#eff4ff] border border-[#dce9ff] rounded-xl focus:bg-white focus:outline-none focus:border-[#006194]"
                  />
                </div>

                {/* Özel Kod 1 */}
                <div>
                  <label className="font-bold text-[#0b1c30] block mb-1">Özel Kod 1</label>
                  <input
                    type="text"
                    value={formSpecialCode1}
                    onChange={(e) => setFormSpecialCode1(e.target.value)}
                    placeholder="örn: OZEL-SERI-A"
                    className="w-full h-9 px-3 bg-[#eff4ff] border border-[#dce9ff] rounded-xl font-mono focus:bg-white focus:outline-none focus:border-[#006194]"
                  />
                </div>

                {/* Özel Kod 2 */}
                <div>
                  <label className="font-bold text-[#0b1c30] block mb-1">Özel Kod 2</label>
                  <input
                    type="text"
                    value={formSpecialCode2}
                    onChange={(e) => setFormSpecialCode2(e.target.value)}
                    placeholder="örn: SEZON-2026-KIS"
                    className="w-full h-9 px-3 bg-[#eff4ff] border border-[#dce9ff] rounded-xl font-mono focus:bg-white focus:outline-none focus:border-[#006194]"
                  />
                </div>

                {/* Stok Miktarı */}
                <div>
                  <label className="font-bold text-[#0b1c30] block mb-1">Stok Miktarı (Adet) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formStockQuantity}
                    onChange={(e) => setFormStockQuantity(Number(e.target.value))}
                    className="w-full h-9 px-3 bg-[#eff4ff] border border-[#dce9ff] rounded-xl font-mono font-bold focus:bg-white focus:outline-none focus:border-[#006194]"
                  />
                </div>

                {/* Fiyat Bilgisi */}
                <div>
                  <label className="font-bold text-[#0b1c30] block mb-1">Fiyat Bilgisi (₺) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full h-9 px-3 bg-[#eff4ff] border border-[#dce9ff] rounded-xl font-mono font-bold text-[#00685f] focus:bg-white focus:outline-none focus:border-[#006194]"
                  />
                </div>

                {/* Kritik Stok Eşiği (Sarı Uyarı) */}
                <div>
                  <label className="font-bold text-[#0b1c30] block mb-1">
                    Kritik Stok Eşiği (Sarı Renk Uyarısı) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formCriticalStockThreshold}
                    onChange={(e) => setFormCriticalStockThreshold(Number(e.target.value))}
                    className="w-full h-9 px-3 bg-[#eff4ff] border border-amber-300 rounded-xl font-mono font-bold text-amber-900 focus:bg-white focus:outline-none focus:border-[#006194]"
                    placeholder="örn: 3 veya 7"
                  />
                  <span className="text-[10px] text-[#707881] block mt-0.5">
                    Stok bu adede veya altına düştüğünde yeşilden sarıya döner. 0 olunca kırmızı olur.
                  </span>
                </div>
              </div>

              {/* Açıklama */}
              <div>
                <label className="font-bold text-[#0b1c30] block mb-1">Açıklama</label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Ürün kumaş detayı, kalıp ve özellikleri..."
                  className="w-full p-2.5 bg-[#eff4ff] border border-[#dce9ff] rounded-xl focus:bg-white focus:outline-none focus:border-[#006194]"
                />
              </div>

              {/* Modal Buttons */}
              <div className="pt-3 border-t border-[#f1f5f9] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-[#565e74] hover:bg-[#eff4ff]"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#006194] hover:bg-[#007bb9] text-white font-bold transition-all shadow-sm"
                >
                  {editingProduct ? 'Değişiklikleri Kaydet' : 'Ürünü Kaydet & Stoğa Ekle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
