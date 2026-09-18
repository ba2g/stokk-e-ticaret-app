import React, { useState, useMemo } from 'react';
import {
  Search,
  X,
  Store,
  RefreshCw,
  Download,
  ArrowLeftRight,
  Plus,
  AlertTriangle,
  Truck,
  Inbox,
  SlidersHorizontal,
  Edit3,
  History,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  FileSpreadsheet,
  Package,
  Layers,
  ChevronDown
} from 'lucide-react';
import { Product, VariantItem, StoreLocation, StockHistoryLog } from '../types';
import { ColumnVisibility } from './Modals/ColumnCustomizerModal';

interface InventoryViewProps {
  product: Product;
  allProducts: Product[];
  onSelectProduct: (p: Product) => void;
  currentLocation: StoreLocation;
  locations?: StoreLocation[];
  onSelectLocation?: (loc: StoreLocation) => void;
  onEditStock: (variant: VariantItem) => void;
  onQuickTransfer: (variant: VariantItem) => void;
  onViewHistory: (variant: VariantItem) => void;
  onOpenAutoBalance: (mode: 'auto-balance' | 'stock-count') => void;
  onOpenColumnCustomizer: () => void;
  columns: ColumnVisibility;
  onOpenAddProduct: () => void;
  onOpenBulkStock: () => void;
  searchTerm?: string;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  product,
  allProducts,
  onSelectProduct,
  currentLocation,
  locations,
  onSelectLocation,
  onEditStock,
  onQuickTransfer,
  onViewHistory,
  onOpenAutoBalance,
  onOpenColumnCustomizer,
  columns,
  onOpenAddProduct,
  onOpenBulkStock,
  searchTerm = '',
}) => {
  const [filterType, setFilterType] = useState<'all' | 'critical' | 'zero'>('all');
  const [onlyNegative, setOnlyNegative] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [productDropdownOpen, setProductDropdownOpen] = useState<boolean>(false);
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [activeMenuVariantId, setActiveMenuVariantId] = useState<string | null>(null);

  // Filter variants based on global search, filterType, and onlyNegative checkbox
  const filteredVariants = useMemo(() => {
    return product.variants.filter((v) => {
      // Negative / Critical filter
      if (onlyNegative && v.onHand >= 0) return false;

      if (filterType === 'critical' && v.status !== 'Ters Bakiye' && v.status !== 'Kritik') return false;
      if (filterType === 'zero' && v.onHand !== 0) return false;

      // Search term from global search
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const matchesSku = v.sku.toLowerCase().includes(query);
        const matchesColor = v.colorName.toLowerCase().includes(query);
        const matchesSize = v.size.toLowerCase().includes(query);
        const matchesBarcode = v.barcode.toLowerCase().includes(query);
        const matchesCode = product.code.toLowerCase().includes(query);
        const matchesName = product.name.toLowerCase().includes(query);
        return matchesSku || matchesColor || matchesSize || matchesBarcode || matchesCode || matchesName;
      }

      return true;
    });
  }, [product, searchTerm, filterType, onlyNegative]);

  // Handle Export to CSV
  const handleExportExcel = () => {
    const headers = ['Varyant', 'SKU', 'Barkod', 'Sevk Edilecek', 'Kullanilabilir', 'Eldeki Stok', 'Gelecek Miktar', 'Durum', 'Raf'];
    const rows = filteredVariants.map((v) => [
      `"${v.colorName} / ${v.size}"`,
      `"${v.sku}"`,
      `"${v.barcode}"`,
      v.toShip,
      v.available,
      v.onHand,
      v.incoming,
      `"${v.status}"`,
      `"${v.shelfLocation}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Envanter_${product.code}_${currentLocation.code}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  // Pagination calculation
  const totalVariants = filteredVariants.length;
  const totalPages = Math.ceil(totalVariants / pageSize) || 1;
  const paginatedVariants = filteredVariants.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Status counts for pills
  const criticalCount = product.variants.filter((v) => v.status === 'Ters Bakiye' || v.status === 'Kritik').length;
  const zeroCount = product.variants.filter((v) => v.onHand === 0).length;

  return (
    <div id="envanter-main-view" className="p-4 sm:p-6 max-w-[1600px] w-full mx-auto space-y-4">
      {/* Product Meta Banner / Active Selection Breadcrumb & Action Toolbar */}
      <div className="bg-[#007bb9] text-white rounded-xl px-4 py-3 shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-3">
        <div className="flex items-center flex-wrap gap-x-3 gap-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-white/20 text-white text-[11px] uppercase tracking-wider font-extrabold">
              AKTİF ÜRÜN
            </span>
            <div className="relative">
              <button
                type="button"
                onClick={() => setProductDropdownOpen(!productDropdownOpen)}
                className="font-heading text-base sm:text-lg font-bold tracking-tight text-white hover:underline flex items-center gap-1.5"
              >
                <span>{product.name}</span>
                <ChevronDown className="w-4 h-4 opacity-80" />
              </button>

              {/* Dropdown to switch products */}
              {productDropdownOpen && (
                <div className="absolute left-0 mt-2 w-64 bg-white text-[#0b1c30] rounded-xl shadow-2xl border border-[#dce9ff] py-1.5 z-50 animate-in fade-in duration-100">
                  <div className="px-3 py-1 text-[10px] font-bold text-[#707881] uppercase tracking-wider">
                    Görüntülenecek Ürünü Seçin
                  </div>
                  {allProducts.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        onSelectProduct(p);
                        setProductDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-[#eff4ff] ${
                        p.id === product.id ? 'font-bold text-[#006194] bg-[#eff4ff]' : ''
                      }`}
                    >
                      <img src={p.image} alt={p.name} className="w-6 h-6 rounded object-cover" />
                      <div className="truncate">
                        <span className="block truncate">{p.name}</span>
                        <span className="text-[10px] text-[#707881] font-mono">{p.code}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="hidden sm:inline text-white/50 text-xs">•</div>
          <div className="text-xs text-white/90 flex items-center gap-1">
            <span className="text-white/70">Kod:</span>
            <span className="font-semibold tracking-wide font-mono">{product.code}</span>
          </div>
          <div className="hidden sm:inline text-white/50 text-xs">•</div>
          <div className="text-xs text-white/90 flex items-center gap-1">
            <span className="text-white/70">Lokasyon:</span>
            <span className="font-semibold">{currentLocation.name} (Merkez Raf: {product.shelfLocation})</span>
          </div>
        </div>

        {/* Right side: KPI Chips and Quick Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="bg-white/15 backdrop-blur-md px-3 py-1 rounded-lg flex items-center gap-2 border border-white/10">
            <span className="text-[10px] text-white/80 uppercase tracking-wide font-bold">
              TOPLAM ELDEKİ:
            </span>
            <span className="text-sm font-bold text-white font-mono">{product.totalOnHand} Adet</span>
          </div>
          <div className="bg-white/15 backdrop-blur-md px-3 py-1 rounded-lg flex items-center gap-2 border border-white/10">
            <span className="text-[10px] text-white/80 uppercase tracking-wide font-bold">
              GELECEK:
            </span>
            <span className="text-sm font-bold text-white font-mono">{product.totalIncoming} Adet</span>
          </div>

          <div className="h-4 w-px bg-white/30 hidden sm:block"></div>

          <button
            type="button"
            onClick={handleRefresh}
            title="Listeyi Yenile"
            className="h-8 w-8 flex items-center justify-center rounded-lg bg-white/15 hover:bg-white/25 text-white transition-all border border-white/15"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-white' : ''}`} />
          </button>

          <button
            type="button"
            onClick={handleExportExcel}
            className="h-8 px-2.5 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs font-semibold flex items-center gap-1.5 transition-all border border-white/15"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Excel</span>
          </button>

          <button
            type="button"
            onClick={onOpenBulkStock}
            className="h-8 px-2.5 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs font-semibold flex items-center gap-1.5 transition-all border border-white/15"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>Toplu Stok</span>
          </button>

          <button
            type="button"
            onClick={onOpenAddProduct}
            className="h-8 px-3 rounded-lg bg-white text-[#006194] hover:bg-[#eff4ff] text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ürün Ekle</span>
          </button>
        </div>
      </div>

      {/* 3. Product Summary Card & Micro-Visual Data Layer */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Mini Visual 1: Stock Status Ring */}
        <div className="bg-white p-4 rounded-xl border border-[#e5eeff] shadow-[0_1px_4px_rgba(0,0,0,0.03)] flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-[10px] text-[#707881] uppercase tracking-wider font-bold">
              Kullanılabilir Stok
            </p>
            <p className="font-heading text-2xl font-bold text-[#ba1a1a] leading-tight">
              {product.availableStock}{' '}
              <span className="text-xs text-[#707881] font-normal font-sans">Adet</span>
            </p>
            <span className="inline-block px-1.5 py-0.5 bg-[#ffdad6] text-[#93000a] rounded text-[11px] font-bold">
              Ters Bakiye Mevcut
            </span>
          </div>
          <div className="relative w-14 h-14 flex items-center justify-center flex-shrink-0">
            <svg className="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-[#e5eeff]"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="3.5"
              />
              <path
                className="text-[#ba1a1a]"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeDasharray="25, 100"
                strokeLinecap="round"
                strokeWidth="3.5"
              />
            </svg>
            <AlertTriangle className="w-5 h-5 absolute text-[#ba1a1a]" />
          </div>
        </div>

        {/* Mini Visual 2: Transit Orders */}
        <div className="bg-white p-4 rounded-xl border border-[#e5eeff] shadow-[0_1px_4px_rgba(0,0,0,0.03)] flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-[10px] text-[#707881] uppercase tracking-wider font-bold">
              Sevk Bekleyen
            </p>
            <p className="font-heading text-2xl font-bold text-[#0b1c30] leading-tight">
              {product.toShipTotal}{' '}
              <span className="text-xs text-[#707881] font-normal font-sans">Paket</span>
            </p>
            <span className="inline-block px-1.5 py-0.5 bg-[#eff4ff] text-[#565e74] rounded text-[11px] font-medium">
              Hazırlanan emir yok
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#eff4ff] flex items-center justify-center text-[#006194] flex-shrink-0">
            <Truck className="w-6 h-6" />
          </div>
        </div>

        {/* Mini Visual 3: Incoming POs */}
        <div className="bg-white p-4 rounded-xl border border-[#e5eeff] shadow-[0_1px_4px_rgba(0,0,0,0.03)] flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-[10px] text-[#707881] uppercase tracking-wider font-bold">
              Satınalma / Gelecek
            </p>
            <p className="font-heading text-2xl font-bold text-[#00685f] leading-tight">
              +{product.totalIncoming}{' '}
              <span className="text-xs text-[#707881] font-normal font-sans">Adet</span>
            </p>
            <span className="inline-block px-1.5 py-0.5 bg-[#d3e4fe] text-[#006194] rounded text-[11px] font-semibold">
              Teslimat: {product.incomingDeliveryDate}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#eff4ff] flex items-center justify-center text-[#00685f] flex-shrink-0">
            <Inbox className="w-6 h-6" />
          </div>
        </div>

        {/* Mini Visual 4: Product Image Reference */}
        <div className="bg-white p-2.5 rounded-xl border border-[#e5eeff] shadow-[0_1px_4px_rgba(0,0,0,0.03)] flex items-center gap-3 overflow-hidden">
          <img
            className="w-16 h-16 rounded-lg object-cover bg-[#eff4ff] flex-shrink-0 border border-[#dce9ff]"
            src={product.image}
            alt={product.name}
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-[#0b1c30] truncate">{product.name}</p>
            <p className="text-[11px] text-[#707881] truncate">Kategori: {product.category}</p>
            <div className="flex items-center gap-1.5 mt-1.5">
              {product.colors.map((c, i) => (
                <span
                  key={i}
                  className="w-2.5 h-2.5 rounded-full inline-block ring-1 ring-black/10"
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                />
              ))}
              <span className="text-[11px] text-[#707881] ml-0.5">
                {product.colors.length} Renk Varyantı
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Inventory Data Table Container */}
      <div className="bg-white rounded-xl border border-[#e5eeff] shadow-sm overflow-hidden">
        {/* Table Filter Strip */}
        <div className="px-4 py-2.5 bg-[#eff4ff] border-b border-[#dce9ff] flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-[#0b1c30]">Varyant Matrisi & Beden Kırılımı</span>
            <span className="px-2 py-0.5 rounded-full bg-[#dce9ff] text-[#006194] text-[11px] font-bold">
              {filteredVariants.length} Varyant
            </span>

            <div className="flex items-center gap-1.5 ml-2">
              <button
                type="button"
                onClick={() => setFilterType('all')}
                className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all ${
                  filterType === 'all'
                    ? 'bg-[#006194] text-white'
                    : 'bg-white text-[#565e74] hover:bg-[#dce9ff]'
                }`}
              >
                Tümü ({product.variants.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterType('critical')}
                className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all flex items-center gap-1 ${
                  filterType === 'critical'
                    ? 'bg-[#ba1a1a] text-white'
                    : 'bg-white text-[#565e74] hover:bg-[#ffdad6]'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${filterType === 'critical' ? 'bg-white' : 'bg-[#ba1a1a]'}`}></span>
                Kritik ({criticalCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterType('zero')}
                className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all ${
                  filterType === 'zero'
                    ? 'bg-[#006194] text-white'
                    : 'bg-white text-[#565e74] hover:bg-[#dce9ff]'
                }`}
              >
                Sıfır Stok ({zeroCount})
              </button>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-[#565e74] select-none">
              <input
                type="checkbox"
                checked={onlyNegative}
                onChange={(e) => setOnlyNegative(e.target.checked)}
                className="rounded text-[#006194] focus:ring-0 w-3.5 h-3.5 cursor-pointer"
              />
              <span className="font-medium">Sadece Negatif/Kritik Stokları Göster</span>
            </label>
            <div className="h-4 w-px bg-[#bfc7d2]"></div>
            <button
              type="button"
              onClick={onOpenColumnCustomizer}
              className="text-xs text-[#006194] hover:underline flex items-center gap-1 font-bold"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Kolonları Düzenle</span>
            </button>
          </div>
        </div>

        {/* Main Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#eff4ff]/60 border-b border-[#e5eeff] text-[#707881] text-[11px] uppercase tracking-wider select-none font-bold">
                {columns.variant && <th className="py-3 px-4">Varyant (Renk / Beden)</th>}
                {columns.toShip && <th className="py-3 px-4 text-right">Sevk Edilecek</th>}
                {columns.available && <th className="py-3 px-4 text-right">Kullanılabilir</th>}
                {columns.onHand && <th className="py-3 px-4 text-right">Eldeki Stok</th>}
                {columns.incoming && <th className="py-3 px-4 text-right">Gelecek Miktar</th>}
                {columns.status && <th className="py-3 px-4 text-center">Durum</th>}
                {columns.history && <th className="py-3 px-4 text-center">Envanter Geçmişi</th>}
                {columns.actions && <th className="py-3 px-4 text-center">Hızlı İşlem</th>}
              </tr>
            </thead>
            <tbody className="text-xs divide-y divide-[#f1f5f9] text-[#0b1c30]">
              {paginatedVariants.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#707881]">
                    Seçili filtrelere uygun varyant bulunamadı.
                  </td>
                </tr>
              ) : (
                paginatedVariants.map((v) => (
                  <tr
                    key={v.id}
                    className="hover:bg-[#eff4ff]/70 transition-colors group relative"
                  >
                    {/* Column 1: Variant */}
                    {columns.variant && (
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <span
                            className="w-3 h-3 rounded-full ring-2 ring-[#e5eeff] flex-shrink-0"
                            style={{ backgroundColor: v.colorHex }}
                          />
                          <div className="flex flex-col">
                            <span className="font-semibold text-[#0b1c30]">
                              {v.colorName} / {v.size}
                            </span>
                            <span className="text-[11px] text-[#707881] font-mono">
                              {v.sku}
                            </span>
                          </div>
                        </div>
                      </td>
                    )}

                    {/* Column 2: To Ship */}
                    {columns.toShip && (
                      <td className="py-3 px-4 text-right font-mono text-[#565e74]">
                        {v.toShip}
                      </td>
                    )}

                    {/* Column 3: Available with quick edit button */}
                    {columns.available && (
                      <td
                        className={`py-3 px-4 text-right font-mono font-semibold ${
                          v.available < 0 ? 'text-[#ba1a1a]' : v.available > 0 ? 'text-[#00685f]' : 'text-[#565e74]'
                        }`}
                      >
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          <span>{v.available > 0 ? `+${v.available}` : v.available}</span>
                          <button
                            type="button"
                            onClick={() => onEditStock(v)}
                            title="Hızlı Düzenle"
                            className="opacity-70 group-hover:opacity-100 text-[#006194] hover:text-[#007bb9] p-0.5 rounded transition-opacity"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}

                    {/* Column 4: On Hand with quick edit button */}
                    {columns.onHand && (
                      <td
                        className={`py-3 px-4 text-right font-mono font-semibold ${
                          v.onHand < 0 ? 'text-[#ba1a1a]' : 'text-[#0b1c30]'
                        }`}
                      >
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          <span>{v.onHand}</span>
                          <button
                            type="button"
                            onClick={() => onEditStock(v)}
                            title="Eldeki Stoğu Düzelt"
                            className="opacity-70 group-hover:opacity-100 text-[#006194] hover:text-[#007bb9] p-0.5 rounded transition-opacity"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}

                    {/* Column 5: Incoming PO */}
                    {columns.incoming && (
                      <td className="py-3 px-4 text-right font-mono text-[#00685f] font-semibold">
                        {v.incoming}
                      </td>
                    )}

                    {/* Column 6: Status Badge */}
                    {columns.status && (
                      <td className="py-3 px-4 text-center">
                        {v.status === 'Ters Bakiye' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] bg-[#ffdad6] text-[#93000a] font-bold">
                            Ters Bakiye
                          </span>
                        )}
                        {v.status === 'Tükendi' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] bg-[#eff4ff] text-[#565e74] font-medium">
                            Tükendi
                          </span>
                        )}
                        {v.status === 'Normal' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] bg-[#dce9ff] text-[#006194] font-bold">
                            Normal
                          </span>
                        )}
                        {v.status === 'Kritik' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] bg-amber-100 text-amber-900 font-bold">
                            Kritik
                          </span>
                        )}
                      </td>
                    )}

                    {/* Column 7: History button */}
                    {columns.history && (
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => onViewHistory(v)}
                          title="Hareket Geçmişi (Log)"
                          className="w-7 h-7 inline-flex items-center justify-center rounded-lg text-[#707881] hover:text-[#006194] hover:bg-[#eff4ff] transition-all"
                        >
                          <History className="w-4 h-4" />
                        </button>
                      </td>
                    )}

                    {/* Column 8: Quick Action (Transfer Et & 3-dots) */}
                    {columns.actions && (
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5 relative">
                          <button
                            type="button"
                            onClick={() => onQuickTransfer(v)}
                            className="px-2.5 py-1 rounded bg-[#eff4ff] hover:bg-[#dce9ff] text-[11px] text-[#006194] font-bold transition-colors border border-[#dce9ff]"
                          >
                            Transfer Et
                          </button>
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() =>
                                setActiveMenuVariantId(activeMenuVariantId === v.id ? null : v.id)
                              }
                              className="p-1 rounded text-[#707881] hover:text-[#0b1c30] hover:bg-[#eff4ff] transition-colors"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            {/* Dropdown Menu */}
                            {activeMenuVariantId === v.id && (
                              <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-xl border border-[#dce9ff] py-1 z-50 text-left animate-in fade-in duration-100">
                                <button
                                  type="button"
                                  onClick={() => {
                                    onEditStock(v);
                                    setActiveMenuVariantId(null);
                                  }}
                                  className="w-full px-3 py-1.5 text-xs text-[#0b1c30] hover:bg-[#eff4ff] flex items-center gap-2"
                                >
                                  <Edit3 className="w-3.5 h-3.5 text-[#006194]" />
                                  <span>Manuel Düzeltme</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    alert(`Barkod yazıcıya gönderildi: ${v.barcode} (${v.sku})`);
                                    setActiveMenuVariantId(null);
                                  }}
                                  className="w-full px-3 py-1.5 text-xs text-[#0b1c30] hover:bg-[#eff4ff] flex items-center gap-2"
                                >
                                  <Package className="w-3.5 h-3.5 text-[#565e74]" />
                                  <span>Barkod Etiketi Bas</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    onViewHistory(v);
                                    setActiveMenuVariantId(null);
                                  }}
                                  className="w-full px-3 py-1.5 text-xs text-[#0b1c30] hover:bg-[#eff4ff] flex items-center gap-2"
                                >
                                  <History className="w-3.5 h-3.5 text-[#00685f]" />
                                  <span>Denetim Günlüğü</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Enterprise Pagination Footer Bar */}
        <div className="px-4 py-3 bg-[#eff4ff]/60 border-t border-[#e5eeff] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-[#565e74]">Sayfa Başına Kayıt:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="h-8 px-2 bg-white rounded border border-[#bfc7d2] text-xs font-semibold text-[#0b1c30] shadow-xs focus:outline-none focus:border-[#006194]"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-[#707881]">
              Gösterilen:{' '}
              <strong className="text-[#0b1c30] font-semibold">
                {totalVariants === 0 ? 0 : (currentPage - 1) * pageSize + 1} -{' '}
                {Math.min(currentPage * pageSize, totalVariants)}
              </strong>{' '}
              / {totalVariants} Kayıt
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-8 h-8 rounded-lg bg-white border border-[#dce9ff] text-[#707881] hover:text-[#0b1c30] hover:bg-[#eff4ff] shadow-xs flex items-center justify-center transition-all disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center transition-all shadow-xs ${
                  currentPage === page
                    ? 'bg-[#006194] text-white'
                    : 'bg-white border border-[#dce9ff] text-[#565e74] hover:bg-[#eff4ff]'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="w-8 h-8 rounded-lg bg-white border border-[#dce9ff] text-[#707881] hover:text-[#0b1c30] hover:bg-[#eff4ff] shadow-xs flex items-center justify-center transition-all disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 5. Quick Stock Adjustment Slide-Over Drawer Simulation / Inline Action Card */}
      <div className="bg-white p-4 rounded-xl border border-[#e5eeff] shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        <div className="lg:col-span-8 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#dce9ff] flex items-center justify-center text-[#006194] flex-shrink-0">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading text-sm font-bold text-[#0b1c30]">
              Hızlı Envanter Eşitleme ve Stok Sayım Fişi
            </h3>
            <p className="text-xs text-[#565e74] mt-0.5">
              Ters bakiye veren varyantlar için fiziksel sayım veya depo kabul irsaliyesi eşlemesi
              yapabilirsiniz. Yapılan düzenlemeler anında Stokk ERP ve B2B sipariş motoruna yansır.
            </p>
          </div>
        </div>
        <div className="lg:col-span-4 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => onOpenAutoBalance('stock-count')}
            className="h-9 px-3.5 rounded-lg bg-[#eff4ff] text-[#0b1c30] hover:bg-[#e5eeff] text-xs font-semibold border border-[#dce9ff] transition-all"
          >
            Sayım Fişi Oluştur
          </button>
          <button
            type="button"
            onClick={() => onOpenAutoBalance('auto-balance')}
            className="h-9 px-3.5 rounded-lg bg-[#007bb9] text-white hover:bg-[#006194] text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Otomatik Dengele</span>
          </button>
        </div>
      </div>
    </div>
  );
};
