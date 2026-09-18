import React, { useState, useMemo } from 'react';
import {
  Search,
  X,
  SlidersHorizontal,
  Plus,
  Minus,
  ShoppingCart,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  Layers,
  Download,
  Filter,
  ArrowUpDown,
  Tag,
  Package
} from 'lucide-react';
import { Product, GridColumnConfig } from '../../types';

interface B2BProductGridProps {
  products: Product[];
  columns: GridColumnConfig[];
  onOpenColumnConfig: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onOpenProductDetail: (product: Product) => void;
  onGoToVariantMatrix: (product: Product) => void;
  onOpenAddProduct: () => void;
  searchTerm: string;
  onSearchChange: (val: string) => void;
  activeFilterType?: string;
  activeFilterValue?: string;
  onClearFilter?: () => void;
}

export const B2BProductGrid: React.FC<B2BProductGridProps> = ({
  products,
  columns,
  onOpenColumnConfig,
  onAddToCart,
  onOpenProductDetail,
  onGoToVariantMatrix,
  onOpenAddProduct,
  searchTerm,
  onSearchChange,
  activeFilterType,
  activeFilterValue,
  onClearFilter,
}) => {
  // Local quantity inputs for each row: { [productId]: quantity }
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  // Dynamic Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedSeason, setSelectedSeason] = useState<string>('ALL');
  const [selectedBrand, setSelectedBrand] = useState<string>('ALL');
  const [selectedStockFilter, setSelectedStockFilter] = useState<'ALL' | 'VAR' | 'KRITIK' | 'YOK'>('ALL');
  const [sortField, setSortField] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Quantity helper with stock clamp
  const getQty = (id: string, maxStock: number) => {
    if (maxStock <= 0) return 0;
    const current = quantities[id];
    if (current === undefined) return 1;
    return Math.min(maxStock, Math.max(1, current));
  };

  const setQty = (id: string, val: number, maxStock: number) => {
    if (maxStock <= 0) {
      setQuantities((prev) => ({ ...prev, [id]: 0 }));
      return;
    }
    const clamped = Math.min(maxStock, Math.max(1, val));
    setQuantities((prev) => ({ ...prev, [id]: clamped }));
  };

  // Stock status calculator based on dynamic per-product critical threshold
  const getStockStatus = (p: Product): { type: 'VAR' | 'KRITIK' | 'YOK'; label: string; sub: string } => {
    if (p.totalOnHand > p.criticalStockThreshold) {
      return {
        type: 'VAR',
        label: 'Stokta Var',
        sub: `Eldeki: ${p.totalOnHand} Adet`,
      };
    } else if (p.totalOnHand > 0 && p.totalOnHand <= p.criticalStockThreshold) {
      return {
        type: 'KRITIK',
        label: 'Kritik Stok',
        sub: `Eldeki: ${p.totalOnHand} (Eşik: ${p.criticalStockThreshold})`,
      };
    } else {
      return {
        type: 'YOK',
        label: 'Stok Yok',
        sub: 'Tükendi',
      };
    }
  };

  // Filtered & Sorted products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Stock Status filter
      const status = getStockStatus(p);
      if (selectedStockFilter !== 'ALL' && status.type !== selectedStockFilter) return false;

      // Category filter
      if (selectedCategory !== 'ALL' && p.category !== selectedCategory) return false;

      // Season filter
      if (selectedSeason !== 'ALL' && p.season !== selectedSeason) return false;

      // Brand filter
      if (selectedBrand !== 'ALL' && p.brand !== selectedBrand) return false;

      // Sidebar context filter if passed
      if (activeFilterType === 'kategori' && activeFilterValue && p.category !== activeFilterValue) return false;
      if (activeFilterType === 'sezon' && activeFilterValue && p.season !== activeFilterValue) return false;
      if (activeFilterType === 'turleri' && activeFilterValue && p.productType !== activeFilterValue) return false;
      if (activeFilterType === 'ozellikler' && activeFilterValue) {
        const matchesFeature = p.features.some((f) => f.toLowerCase().includes(activeFilterValue.toLowerCase()));
        if (!matchesFeature) return false;
      }

      // Search
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesCode = p.code.toLowerCase().includes(q);
        const matchesBrand = p.brand.toLowerCase().includes(q);
        const matchesManufacturer = p.manufacturer.toLowerCase().includes(q);
        const matchesDesc = p.description.toLowerCase().includes(q);
        const matchesCategory = p.category.toLowerCase().includes(q);
        const matchesType = p.productType.toLowerCase().includes(q);
        const matchesColors = p.colors.some((c) => c.name.toLowerCase().includes(q));
        const matchesVariants = p.variants.some(
          (v) =>
            v.sku.toLowerCase().includes(q) ||
            v.colorName.toLowerCase().includes(q) ||
            v.barcode.toLowerCase().includes(q)
        );
        const matchesFeatures = p.features.some((f) => f.toLowerCase().includes(q));

        return (
          matchesName ||
          matchesCode ||
          matchesBrand ||
          matchesManufacturer ||
          matchesDesc ||
          matchesCategory ||
          matchesType ||
          matchesColors ||
          matchesVariants ||
          matchesFeatures
        );
      }

      return true;
    }).sort((a, b) => {
      let valA: any = (a as any)[sortField];
      let valB: any = (b as any)[sortField];

      if (typeof valA === 'string') {
        return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      if (typeof valA === 'number') {
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      }
      return 0;
    });
  }, [
    products,
    searchTerm,
    selectedStockFilter,
    selectedCategory,
    selectedSeason,
    selectedBrand,
    activeFilterType,
    activeFilterValue,
    sortField,
    sortDirection,
  ]);

  // Aggregate stats
  const varCount = products.filter((p) => getStockStatus(p).type === 'VAR').length;
  const kritikCount = products.filter((p) => getStockStatus(p).type === 'KRITIK').length;
  const yokCount = products.filter((p) => getStockStatus(p).type === 'YOK').length;

  // Active filter items for removable chips/pills
  const activeFilters = useMemo(() => {
    const list: { id: string; label: string; onRemove: () => void }[] = [];

    if (searchTerm.trim()) {
      list.push({
        id: 'search',
        label: `Arama: "${searchTerm}"`,
        onRemove: () => onSearchChange(''),
      });
    }

    if (selectedStockFilter !== 'ALL') {
      const label =
        selectedStockFilter === 'VAR'
          ? 'Stok Durumu: Stokta Var'
          : selectedStockFilter === 'KRITIK'
          ? 'Stok Durumu: Kritik Stok'
          : 'Stok Durumu: Stok Yok';
      list.push({
        id: 'stock',
        label,
        onRemove: () => setSelectedStockFilter('ALL'),
      });
    }

    if (selectedCategory !== 'ALL') {
      list.push({
        id: 'cat',
        label: `Kategori: ${selectedCategory}`,
        onRemove: () => setSelectedCategory('ALL'),
      });
    }

    if (selectedSeason !== 'ALL') {
      list.push({
        id: 'season',
        label: `Sezon: ${selectedSeason}`,
        onRemove: () => setSelectedSeason('ALL'),
      });
    }

    if (selectedBrand !== 'ALL') {
      list.push({
        id: 'brand',
        label: `Marka: ${selectedBrand}`,
        onRemove: () => setSelectedBrand('ALL'),
      });
    }

    if (activeFilterType && activeFilterValue) {
      list.push({
        id: 'sidebar',
        label: `${activeFilterType.toUpperCase()}: ${activeFilterValue}`,
        onRemove: () => {
          if (onClearFilter) onClearFilter();
        },
      });
    }

    return list;
  }, [
    searchTerm,
    selectedStockFilter,
    selectedCategory,
    selectedSeason,
    selectedBrand,
    activeFilterType,
    activeFilterValue,
    onSearchChange,
    onClearFilter,
  ]);

  const handleClearAllFilters = () => {
    setSelectedCategory('ALL');
    setSelectedSeason('ALL');
    setSelectedBrand('ALL');
    setSelectedStockFilter('ALL');
    onSearchChange('');
    if (onClearFilter) onClearFilter();
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'Ürün Kodu',
      'Ürün Adı',
      'Marka',
      'Üretici',
      'Kategori',
      'Sezon',
      'Stok Durumu',
      'Eldeki Stok',
      'Kritik Eşik',
      'B2B Fiyat'
    ];
    const rows = filteredProducts.map((p) => {
      const st = getStockStatus(p);
      return [
        `"${p.code}"`,
        `"${p.name}"`,
        `"${p.brand}"`,
        `"${p.manufacturer}"`,
        `"${p.category}"`,
        `"${p.season}"`,
        `"${st.label}"`,
        p.totalOnHand,
        p.criticalStockThreshold,
        p.price,
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `B2B_Urun_Listesi_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const visibleColumns = useMemo(() => {
    return [...columns].filter((c) => c.visible).sort((a, b) => a.order - b.order);
  }, [columns]);

  return (
    <div id="b2b-product-grid-container" className="p-4 sm:p-6 max-w-[1600px] w-full mx-auto space-y-4">
      {/* 1. Top Title & Summary Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#e5eeff] shadow-[0_1px_4px_rgba(0,0,0,0.03)] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 rounded bg-[#006194] text-white text-[11px] font-extrabold uppercase tracking-wider">
              ÜRÜN LİSTESİ (B2B GRID)
            </span>
            <h2 className="font-heading text-lg sm:text-xl font-bold text-[#0b1c30]">
              Toptan Ürün Kataloğu & Hızlı Sipariş Tablosu
            </h2>
          </div>
          <p className="text-xs text-[#565e74] mt-1 max-w-3xl">
            Tablo / grid satır bazlı liste mimarisi: Ürün görseli, ürün kodu, adı, markası, renkli stok durumu, fiyatı ve doğrudan adet girerek sepete ekleme aksiyonu.
          </p>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={onOpenColumnConfig}
            className="h-9 px-3 rounded-xl bg-[#eff4ff] text-[#006194] hover:bg-[#dce9ff] text-xs font-bold flex items-center gap-1.5 transition-all border border-[#dce9ff] cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Kolonları Yapılandır</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="h-9 px-3 rounded-xl bg-[#eff4ff] text-[#0b1c30] hover:bg-[#e5eeff] text-xs font-semibold flex items-center gap-1.5 transition-all border border-[#dce9ff] cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#00685f]" />
            <span>Excel / CSV</span>
          </button>

          <button
            type="button"
            onClick={onOpenAddProduct}
            className="h-9 px-3.5 rounded-xl bg-[#006194] hover:bg-[#007bb9] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Model Ekle</span>
          </button>
        </div>
      </div>

      {/* 2. Visual Stock Status Counters & Fast Filter Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* All Products */}
        <div
          onClick={() => setSelectedStockFilter('ALL')}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            selectedStockFilter === 'ALL'
              ? 'bg-[#dce9ff] border-[#006194] shadow-xs'
              : 'bg-white border-[#e5eeff] hover:bg-[#eff4ff]'
          }`}
        >
          <span className="text-[10px] text-[#707881] uppercase font-bold tracking-wider block">
            Tüm Modeller
          </span>
          <p className="font-heading text-xl font-bold text-[#0b1c30] mt-1">
            {products.length} <span className="text-xs font-normal font-sans text-[#707881]">Model</span>
          </p>
        </div>

        {/* Var (Yeşil) */}
        <div
          onClick={() => setSelectedStockFilter('VAR')}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            selectedStockFilter === 'VAR'
              ? 'bg-[#e6f4ea] border-[#00685f] shadow-xs'
              : 'bg-white border-[#e5eeff] hover:bg-[#f0fdf4]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#00685f] uppercase font-bold tracking-wider flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00685f]"></span>
              Stokta "Var"
            </span>
            <CheckCircle2 className="w-3.5 h-3.5 text-[#00685f]" />
          </div>
          <p className="font-heading text-xl font-bold text-[#00685f] mt-1">
            {varCount} <span className="text-xs font-normal font-sans opacity-80">Model</span>
          </p>
          <span className="text-[10px] text-[#565e74]">Kritik eşiğin üzerinde</span>
        </div>

        {/* Kritik (Sarı/Amber) */}
        <div
          onClick={() => setSelectedStockFilter('KRITIK')}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            selectedStockFilter === 'KRITIK'
              ? 'bg-amber-100 border-amber-500 shadow-xs'
              : 'bg-white border-[#e5eeff] hover:bg-amber-50/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-amber-900 uppercase font-bold tracking-wider flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              Stokta "Kritik"
            </span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <p className="font-heading text-xl font-bold text-amber-900 mt-1">
            {kritikCount} <span className="text-xs font-normal font-sans opacity-80">Model</span>
          </p>
          <span className="text-[10px] text-amber-800">Tanımlı eşiğin altında</span>
        </div>

        {/* Yok (Kırmızı) */}
        <div
          onClick={() => setSelectedStockFilter('YOK')}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            selectedStockFilter === 'YOK'
              ? 'bg-[#ffdad6] border-[#ba1a1a] shadow-xs'
              : 'bg-white border-[#e5eeff] hover:bg-[#fff5f5]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#ba1a1a] uppercase font-bold tracking-wider flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ba1a1a]"></span>
              Stokta "Yok"
            </span>
            <XCircle className="w-3.5 h-3.5 text-[#ba1a1a]" />
          </div>
          <p className="font-heading text-xl font-bold text-[#ba1a1a] mt-1">
            {yokCount} <span className="text-xs font-normal font-sans opacity-80">Model</span>
          </p>
          <span className="text-[10px] text-[#93000a]">Ters bakiye veya tükendi</span>
        </div>
      </div>

      {/* 3. Filter & Search Toolbar */}
      <div className="bg-white p-3.5 rounded-2xl border border-[#e5eeff] shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Comprehensive Search Input */}
          <div className="relative flex-1 min-w-[260px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#707881] w-4 h-4 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Ürün adı, kod, marka, üretici, renk veya açıklama ara..."
              className="w-full h-9 pl-9 pr-8 bg-[#eff4ff] border border-transparent rounded-xl text-xs font-medium text-[#0b1c30] placeholder:text-[#707881] focus:outline-none focus:bg-white focus:border-[#006194] transition-all"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#707881] hover:text-[#0b1c30]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filters: Category, Season, Brand */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Category Dropdown */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-9 px-2.5 bg-[#eff4ff] border border-[#dce9ff] rounded-xl text-xs font-semibold text-[#0b1c30] focus:outline-none focus:bg-white"
            >
              <option value="ALL">Tüm Kategoriler</option>
              <option value="Kadın Tekstil">Kadın Tekstil</option>
              <option value="Erkek Tekstil">Erkek Tekstil</option>
              <option value="Dış Giyim">Dış Giyim</option>
              <option value="Triko">Triko</option>
            </select>

            {/* Season Dropdown */}
            <select
              value={selectedSeason}
              onChange={(e) => setSelectedSeason(e.target.value)}
              className="h-9 px-2.5 bg-[#eff4ff] border border-[#dce9ff] rounded-xl text-xs font-semibold text-[#0b1c30] focus:outline-none focus:bg-white"
            >
              <option value="ALL">Tüm Sezonlar</option>
              <option value="Sonbahar/Kış 2026">Sonbahar/Kış 2026</option>
              <option value="İlkbahar/Yaz 2026">İlkbahar/Yaz 2026</option>
              <option value="Dört Mevsim">Dört Mevsim</option>
            </select>

            {/* Brand Dropdown */}
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="h-9 px-2.5 bg-[#eff4ff] border border-[#dce9ff] rounded-xl text-xs font-semibold text-[#0b1c30] focus:outline-none focus:bg-white"
            >
              <option value="ALL">Tüm Markalar</option>
              <option value="Stokk Collection">Stokk Collection</option>
              <option value="Stokk Studio">Stokk Studio</option>
              <option value="Stokk Luxe">Stokk Luxe</option>
              <option value="ModaLab Erkek">ModaLab Erkek</option>
            </select>
          </div>
        </div>

        {/* Removable Active Filter Chips / Tags */}
        {activeFilters.length > 0 && (
          <div className="pt-2 border-t border-[#f1f5f9] flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold text-[#565e74] flex items-center gap-1">
              <Filter className="w-3 h-3" />
              <span>Aktif Filtreler:</span>
            </span>

            {activeFilters.map((f) => (
              <span
                key={f.id}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#dce9ff] text-[#006194] text-xs font-semibold border border-[#b8d5ff]"
              >
                <span>{f.label}</span>
                <button
                  type="button"
                  onClick={f.onRemove}
                  className="w-3.5 h-3.5 rounded-full hover:bg-[#006194] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                  title="Bu filtreyi kaldır"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            ))}

            <button
              type="button"
              onClick={handleClearAllFilters}
              className="text-xs text-[#ba1a1a] hover:underline font-bold ml-1 cursor-pointer"
            >
              Tüm Filtreleri Temizle
            </button>
          </div>
        )}
      </div>

      {/* 4. The B2B Grid Table (Desktop >= 1024px) */}
      <div className="hidden lg:block bg-white rounded-2xl border border-[#e5eeff] shadow-sm overflow-hidden">
        <div className="px-4 py-2.5 bg-[#eff4ff]/60 border-b border-[#dce9ff] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#0b1c30]">B2B Sipariş Tablosu</span>
            <span className="px-2 py-0.5 rounded-full bg-[#dce9ff] text-[#006194] text-[11px] font-bold">
              {filteredProducts.length} Ürün Listeleniyor
            </span>
          </div>
          <span className="text-[11px] text-[#565e74]">
            Her satırdan adet seçip doğrudan <strong className="text-[#006194]">"Sepete Ekle"</strong> yapabilirsiniz.
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#eff4ff] border-b border-[#dce9ff] text-[#565e74] text-[11px] uppercase tracking-wider font-bold select-none">
                {visibleColumns.map((col) => (
                  <th
                    key={col.id}
                    className={`py-3 px-4 ${
                      col.align === 'right'
                        ? 'text-right'
                        : col.align === 'center'
                        ? 'text-center'
                        : 'text-left'
                    }`}
                  >
                    {col.sortable ? (
                      <button
                        type="button"
                        onClick={() => handleSort(col.field as string)}
                        className="inline-flex items-center gap-1 hover:text-[#0b1c30] transition-colors"
                      >
                        <span>{col.label}</span>
                        <ArrowUpDown className="w-3 h-3 text-[#707881]" />
                      </button>
                    ) : (
                      <span>{col.label}</span>
                    )}
                  </th>
                ))}
                <th className="py-3 px-4 text-center">Detay / Matris</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9] text-[#0b1c30]">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={visibleColumns.length + 1} className="py-14 text-center text-[#707881]">
                    Arama kriterlerine uygun ürün bulunamadı.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const stockStatus = getStockStatus(product);
                  const hasStock = product.totalOnHand > 0;
                  const qty = getQty(product.id, product.totalOnHand);

                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-[#eff4ff]/50 transition-colors group"
                    >
                      {visibleColumns.map((col) => {
                        // Render Type 1: Image
                        if (col.renderType === 'image') {
                          return (
                            <td key={col.id} className="py-2.5 px-4">
                              <div
                                onClick={() => onOpenProductDetail(product)}
                                className="w-12 h-12 rounded-xl bg-[#eff4ff] border border-[#dce9ff] overflow-hidden cursor-pointer hover:ring-2 hover:ring-[#006194] transition-all flex-shrink-0"
                              >
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </td>
                          );
                        }

                        // Render Type 2: Code
                        if (col.renderType === 'code') {
                          return (
                            <td key={col.id} className="py-2.5 px-4 font-mono font-bold text-[#006194]">
                              <span
                                onClick={() => onOpenProductDetail(product)}
                                className="cursor-pointer hover:underline"
                              >
                                {product.code}
                              </span>
                            </td>
                          );
                        }

                        // Render Type 3: Text / Name
                        if (col.renderType === 'text') {
                          return (
                            <td key={col.id} className="py-2.5 px-4">
                              <div className="max-w-xs">
                                <span
                                  onClick={() => onOpenProductDetail(product)}
                                  className="font-bold text-[#0b1c30] hover:text-[#006194] cursor-pointer block truncate"
                                  title={product.name}
                                >
                                  {product.name}
                                </span>
                                <span className="text-[11px] text-[#707881] line-clamp-1">
                                  {product.description}
                                </span>
                              </div>
                            </td>
                          );
                        }

                        // Render Type 4: Brand
                        if (col.renderType === 'brand') {
                          return (
                            <td key={col.id} className="py-2.5 px-4">
                              <div>
                                <span className="font-semibold text-[#0b1c30] block">
                                  {product.brand}
                                </span>
                                <span className="text-[10px] text-[#707881] block truncate max-w-[150px]">
                                  {product.manufacturer}
                                </span>
                              </div>
                            </td>
                          );
                        }

                        // Render Type 5: Category & Product Type
                        if (col.renderType === 'category') {
                          return (
                            <td key={col.id} className="py-2.5 px-4">
                              <div>
                                <span className="px-2 py-0.5 rounded-md bg-[#eff4ff] text-[#006194] text-[11px] font-semibold inline-block">
                                  {product.category}
                                </span>
                                <span className="block text-[10px] text-[#707881] mt-0.5">
                                  {product.productType} • {product.season}
                                </span>
                              </div>
                            </td>
                          );
                        }

                        // Render Type 6: Stock Badge (Renkli Stok Göstergesi: Var/Kritik/Yok)
                        if (col.renderType === 'stock_badge') {
                          return (
                            <td key={col.id} className="py-2.5 px-4">
                              <div>
                                {stockStatus.type === 'VAR' && (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#e6f4ea] text-[#00685f] border border-[#a3e6cd]">
                                    <span className="w-2 h-2 rounded-full bg-[#00685f]"></span>
                                    <span>Var</span>
                                  </span>
                                )}

                                {stockStatus.type === 'KRITIK' && (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                    <span>Kritik</span>
                                  </span>
                                )}

                                {stockStatus.type === 'YOK' && (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#ffdad6] text-[#ba1a1a] border border-[#ffb4ab]">
                                    <span className="w-2 h-2 rounded-full bg-[#ba1a1a]"></span>
                                    <span>Yok</span>
                                  </span>
                                )}

                                <span className="block text-[10px] text-[#707881] mt-0.5 font-mono">
                                  {stockStatus.sub}
                                </span>
                              </div>
                            </td>
                          );
                        }

                        // Render Type 7: Price
                        if (col.renderType === 'price') {
                          return (
                            <td key={col.id} className="py-2.5 px-4 text-right">
                              <span className="font-mono font-bold text-sm text-[#0b1c30] block">
                                ₺{product.price.toLocaleString('tr-TR')}
                              </span>
                              <span className="text-[10px] text-[#707881] block">+ KDV</span>
                            </td>
                          );
                        }

                        // Render Type 8: Quick Order Action
                        if (col.renderType === 'quick_order_action') {
                          return (
                            <td key={col.id} className="py-2.5 px-4 text-center">
                              {hasStock ? (
                                <div className="inline-flex items-center gap-2">
                                  <div className="flex items-center border border-[#bfc7d2] rounded-lg bg-white overflow-hidden shadow-xs">
                                    <button
                                      type="button"
                                      disabled={qty <= 1}
                                      onClick={() => setQty(product.id, qty - 1, product.totalOnHand)}
                                      className="w-7 h-7 flex items-center justify-center text-[#565e74] hover:bg-[#eff4ff] active:bg-[#dce9ff] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                                    >
                                      <Minus className="w-3 h-3" />
                                    </button>
                                    <input
                                      type="number"
                                      min="1"
                                      max={product.totalOnHand}
                                      value={qty}
                                      onChange={(e) => setQty(product.id, Number(e.target.value), product.totalOnHand)}
                                      className="w-10 h-7 text-center font-mono font-bold text-xs text-[#0b1c30] focus:outline-none"
                                      title={`Maksimum sipariş edilebilir stok: ${product.totalOnHand} Adet`}
                                    />
                                    <button
                                      type="button"
                                      disabled={qty >= product.totalOnHand}
                                      onClick={() => setQty(product.id, qty + 1, product.totalOnHand)}
                                      className="w-7 h-7 flex items-center justify-center text-[#565e74] hover:bg-[#eff4ff] active:bg-[#dce9ff] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                                      title={qty >= product.totalOnHand ? 'Maksimum stok miktarına ulaşıldı' : 'Artır'}
                                    >
                                      <Plus className="w-3 h-3" />
                                    </button>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => onAddToCart(product, qty)}
                                    className="h-7 px-3 rounded-lg bg-[#006194] hover:bg-[#007bb9] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1 active:scale-95 whitespace-nowrap cursor-pointer"
                                    title={`Sepete ${qty} adet ekle (Mevcut Stok: ${product.totalOnHand})`}
                                  >
                                    <ShoppingCart className="w-3.5 h-3.5" />
                                    <span>Sepete Ekle</span>
                                  </button>
                                </div>
                              ) : (
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gray-100 border border-gray-200 text-gray-500 text-xs font-medium cursor-not-allowed select-none">
                                  <XCircle className="w-3.5 h-3.5 text-gray-400" />
                                  <span>Stok Yok</span>
                                </div>
                              )}
                            </td>
                          );
                        }

                        return null;
                      })}

                      {/* Detail & Variant Matrix Column */}
                      <td className="py-2.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onOpenProductDetail(product)}
                            className="p-1.5 rounded-lg text-[#565e74] hover:text-[#006194] hover:bg-[#eff4ff] transition-colors cursor-pointer"
                            title="Ürün Detay Kartını Aç"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onGoToVariantMatrix(product)}
                            className="p-1.5 rounded-lg text-[#006194] hover:text-white hover:bg-[#006194] transition-colors cursor-pointer"
                            title="Varyant & Beden Kırılım Matrisini Aç"
                          >
                            <Layers className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info bar */}
        <div className="px-4 py-3 bg-[#eff4ff]/60 border-t border-[#e5eeff] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#565e74]">
          <div>
            Toplam <strong>{filteredProducts.length}</strong> ürün gösteriliyor.
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#00685f]"></span> Var ({varCount})
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span> Kritik ({kritikCount})
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#ba1a1a]"></span> Yok ({yokCount})
            </span>
          </div>
        </div>
      </div>

      {/* 5. Mobile & Tablet Responsive Card-List (< 1024px) */}
      <div className="lg:hidden space-y-3">
        <div className="flex items-center justify-between px-1 text-xs text-[#565e74]">
          <span className="font-bold text-[#0b1c30]">
            {filteredProducts.length} Ürün Listeleniyor (Mobil/Tablet Görünümü)
          </span>
          <span className="text-[11px]">Adet belirleyip sepete ekleyin</span>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-[#e5eeff] text-center text-xs text-[#707881]">
            Arama kriterlerine uygun ürün bulunamadı.
          </div>
        ) : (
          filteredProducts.map((product) => {
            const stockStatus = getStockStatus(product);
            const hasStock = product.totalOnHand > 0;
            const qty = getQty(product.id, product.totalOnHand);

            return (
              <div
                key={product.id}
                className="bg-white p-4 rounded-2xl border border-[#e5eeff] shadow-xs space-y-3"
              >
                {/* Product Header Row */}
                <div className="flex items-start gap-3">
                  {/* Thumbnail Image */}
                  <div
                    onClick={() => onOpenProductDetail(product)}
                    className="w-16 h-16 rounded-xl bg-[#eff4ff] border border-[#dce9ff] overflow-hidden flex-shrink-0 cursor-pointer"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-mono font-bold text-xs text-[#006194]">
                        {product.code}
                      </span>
                      {/* Stock Badge with color */}
                      {stockStatus.type === 'VAR' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#e6f4ea] text-[#00685f] border border-[#a3e6cd]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#00685f]"></span>
                          <span>Stokta Var</span>
                        </span>
                      )}
                      {stockStatus.type === 'KRITIK' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                          <span>Kritik Stok</span>
                        </span>
                      )}
                      {stockStatus.type === 'YOK' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#ffdad6] text-[#ba1a1a] border border-[#ffb4ab]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a]"></span>
                          <span>Stok Yok</span>
                        </span>
                      )}
                    </div>

                    <h3
                      onClick={() => onOpenProductDetail(product)}
                      className="font-bold text-xs sm:text-sm text-[#0b1c30] truncate cursor-pointer hover:text-[#006194]"
                    >
                      {product.name}
                    </h3>

                    <div className="flex items-center gap-2 text-[11px] text-[#707881]">
                      <span>Marka: <strong className="text-[#565e74]">{product.brand}</strong></span>
                      <span>•</span>
                      <span>{product.category}</span>
                    </div>

                    <span className="text-[10px] font-mono text-[#565e74] block">
                      {stockStatus.sub}
                    </span>
                  </div>
                </div>

                {/* Price and Add to Cart Row */}
                <div className="flex items-center justify-between pt-2 border-t border-[#f1f5f9]">
                  <div>
                    <span className="text-[10px] text-[#707881] block">B2B Fiyat</span>
                    <span className="font-mono font-bold text-sm text-[#0b1c30]">
                      ₺{product.price.toLocaleString('tr-TR')}
                    </span>
                  </div>

                  {/* Actions */}
                  {hasStock ? (
                    <div className="flex items-center gap-2">
                      {/* Stepper */}
                      <div className="flex items-center border border-[#bfc7d2] rounded-lg bg-white overflow-hidden shadow-xs">
                        <button
                          type="button"
                          disabled={qty <= 1}
                          onClick={() => setQty(product.id, qty - 1, product.totalOnHand)}
                          className="w-7 h-7 flex items-center justify-center text-[#565e74] hover:bg-[#eff4ff] disabled:opacity-30"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <input
                          type="number"
                          min="1"
                          max={product.totalOnHand}
                          value={qty}
                          onChange={(e) => setQty(product.id, Number(e.target.value), product.totalOnHand)}
                          className="w-9 h-7 text-center font-mono font-bold text-xs text-[#0b1c30] focus:outline-none"
                        />
                        <button
                          type="button"
                          disabled={qty >= product.totalOnHand}
                          onClick={() => setQty(product.id, qty + 1, product.totalOnHand)}
                          className="w-7 h-7 flex items-center justify-center text-[#565e74] hover:bg-[#eff4ff] disabled:opacity-30"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => onAddToCart(product, qty)}
                        className="h-8 px-3 rounded-lg bg-[#006194] hover:bg-[#007bb9] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer whitespace-nowrap"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>Sepete Ekle</span>
                      </button>
                    </div>
                  ) : (
                    <div className="px-3 py-1 rounded-lg bg-gray-100 text-gray-500 text-xs font-medium">
                      Sipariş Verilemez
                    </div>
                  )}
                </div>

                {/* Quick links to detail and matrix */}
                <div className="flex items-center justify-end gap-2 pt-1 text-xs">
                  <button
                    type="button"
                    onClick={() => onOpenProductDetail(product)}
                    className="text-[#565e74] hover:text-[#006194] text-[11px] font-semibold flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Detay</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onGoToVariantMatrix(product)}
                    className="text-[#006194] hover:underline text-[11px] font-bold flex items-center gap-1"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Varyant Matrisi</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
