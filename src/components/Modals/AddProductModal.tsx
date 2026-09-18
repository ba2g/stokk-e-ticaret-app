import React, { useState } from 'react';
import { X, Plus, Package } from 'lucide-react';
import { Product } from '../../types';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProduct: (prod: Product) => void;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  onAddProduct,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [brand, setBrand] = useState('Stokk Collection');
  const [manufacturer, setManufacturer] = useState('Stokk Tekstil San. Tic. A.Ş.');
  const [category, setCategory] = useState('Kadın Tekstil');
  const [productType, setProductType] = useState('Pantolon');
  const [season, setSeason] = useState('Sonbahar/Kış 2026');
  const [price, setPrice] = useState<number>(750);
  const [criticalThreshold, setCriticalThreshold] = useState<number>(15);
  const [shelfLocation, setShelfLocation] = useState('D-04');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code) return;

    const newProd: Product = {
      id: `prod-${Date.now()}`,
      name,
      code,
      brand,
      manufacturer,
      category,
      productType,
      season,
      features: ['B2B Asortili Üretim', 'Kalıplı Dikiş', 'Yüksek Kalite'],
      description: description || `${brand} tarafından üretilen ${season} koleksiyonu ${productType}.`,
      image:
        'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=500&auto=format&fit=crop&q=60',
      price: price || 750,
      currency: '₺',
      criticalStockThreshold: criticalThreshold || 15,
      totalOnHand: 30,
      totalIncoming: 40,
      availableStock: 25,
      toShipTotal: 5,
      location: `Kayseri Mağaza (Raf: ${shelfLocation})`,
      shelfLocation,
      incomingDeliveryDate: '4 Gün İçinde',
      colors: [
        { name: 'Antrasit', hex: '#374151' },
        { name: 'Bej', hex: '#d1d5db' },
      ],
      variants: [
        {
          id: `v-${Date.now()}-1`,
          colorName: 'Antrasit',
          colorHex: '#374151',
          size: '36',
          sku: `${code}-ANT-36`,
          toShip: 2,
          available: 13,
          onHand: 15,
          incoming: 20,
          status: 'Normal',
          barcode: `868000${Math.floor(100000 + Math.random() * 900000)}`,
          shelfLocation: `${shelfLocation}-01`,
        },
        {
          id: `v-${Date.now()}-2`,
          colorName: 'Antrasit',
          colorHex: '#374151',
          size: '38',
          sku: `${code}-ANT-38`,
          toShip: 3,
          available: 12,
          onHand: 15,
          incoming: 20,
          status: 'Normal',
          barcode: `868000${Math.floor(100000 + Math.random() * 900000)}`,
          shelfLocation: `${shelfLocation}-02`,
        },
      ],
    };

    onAddProduct(newProd);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#dce9ff] max-w-lg w-full overflow-hidden">
        <div className="px-5 py-4 bg-[#eff4ff] border-b border-[#dce9ff] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-[#006194]" />
            <h3 className="font-heading text-sm font-bold text-[#0b1c30]">Yeni Model / Ürün Ekle</h3>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded-lg text-[#707881] hover:text-[#0b1c30]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3 text-xs">
          <div>
            <label className="block text-xs font-semibold text-[#0b1c30] mb-1">Ürün Adı</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Örn: Yün Karışımlı Kaşe Kaban"
              className="w-full h-9 px-3 border border-[#bfc7d2] rounded-lg text-xs focus:outline-none focus:border-[#006194]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#0b1c30] mb-1">Model / SKU Kodu</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="25KTKBN6021"
                className="w-full h-9 px-3 border border-[#bfc7d2] rounded-lg text-xs font-mono focus:outline-none focus:border-[#006194]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#0b1c30] mb-1">Marka</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full h-9 px-3 border border-[#bfc7d2] rounded-lg text-xs focus:outline-none focus:border-[#006194]"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#0b1c30] mb-1">Kategori</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-9 px-2 border border-[#bfc7d2] rounded-lg text-xs focus:outline-none focus:border-[#006194]"
              >
                <option value="Kadın Tekstil">Kadın Tekstil</option>
                <option value="Erkek Tekstil">Erkek Tekstil</option>
                <option value="Dış Giyim">Dış Giyim</option>
                <option value="Triko">Triko</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#0b1c30] mb-1">Ürün Türü</label>
              <input
                type="text"
                value={productType}
                onChange={(e) => setProductType(e.target.value)}
                placeholder="Pantolon"
                className="w-full h-9 px-2 border border-[#bfc7d2] rounded-lg text-xs focus:outline-none focus:border-[#006194]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#0b1c30] mb-1">Sezon</label>
              <select
                value={season}
                onChange={(e) => setSeason(e.target.value)}
                className="w-full h-9 px-2 border border-[#bfc7d2] rounded-lg text-xs focus:outline-none focus:border-[#006194]"
              >
                <option value="Sonbahar/Kış 2026">Sonbahar/Kış 2026</option>
                <option value="İlkbahar/Yaz 2026">İlkbahar/Yaz 2026</option>
                <option value="Dört Mevsim">Dört Mevsim</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#0b1c30] mb-1">Toptan Fiyat (₺)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full h-9 px-3 border border-[#bfc7d2] rounded-lg text-xs font-mono focus:outline-none focus:border-[#006194]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#0b1c30] mb-1">Kritik Stok Eşiği</label>
              <input
                type="number"
                value={criticalThreshold}
                onChange={(e) => setCriticalThreshold(Number(e.target.value))}
                className="w-full h-9 px-3 border border-[#bfc7d2] rounded-lg text-xs font-mono focus:outline-none focus:border-[#006194]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0b1c30] mb-1">Merkez Raf Konumu</label>
            <input
              type="text"
              value={shelfLocation}
              onChange={(e) => setShelfLocation(e.target.value)}
              className="w-full h-9 px-3 border border-[#bfc7d2] rounded-lg text-xs font-mono focus:outline-none focus:border-[#006194]"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-[#565e74] hover:bg-[#eff4ff] rounded-lg"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#006194] text-white text-xs font-bold rounded-lg hover:bg-[#007bb9]"
            >
              Modeli Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
