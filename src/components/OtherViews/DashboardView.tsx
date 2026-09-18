import React from 'react';
import {
  TrendingUp,
  AlertTriangle,
  Truck,
  Layers,
  ArrowRight,
  Package,
  Clock,
  ArrowUpRight,
  CheckCircle2,
  AlertOctagon,
  Sparkles,
  ShoppingBag
} from 'lucide-react';
import { Product, TransferRecord, OrderItem, CampaignSlide } from '../../types';
import { PromotionSlider } from '../Dashboard/PromotionSlider';
import { CAMPAIGN_SLIDES } from '../../data/mockData';

interface DashboardViewProps {
  products: Product[];
  transfers: TransferRecord[];
  orders: OrderItem[];
  slides?: CampaignSlide[];
  onGoToInventory: () => void;
  onGoToTransfers: () => void;
  onGoToOrders: () => void;
  onGoToProducts?: () => void;
  onSelectCampaign?: (slide: CampaignSlide) => void;
  onQuickOrderCampaign?: (slide: CampaignSlide) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  products,
  transfers,
  orders,
  slides,
  onGoToInventory,
  onGoToTransfers,
  onGoToOrders,
  onGoToProducts,
  onSelectCampaign,
  onQuickOrderCampaign,
}) => {
  const activeSlides = slides && slides.length > 0 ? slides : CAMPAIGN_SLIDES;
  // Aggregate stats
  const criticalVariants = products.flatMap((p) =>
    p.variants.filter((v) => v.onHand <= (p.criticalStockThreshold || 5))
  );
  const pendingTransfers = transfers.filter((t) => t.status === 'Hazırlanıyor' || t.status === 'Onay Bekliyor').length;
  const inTransitTransfers = transfers.filter((t) => t.status === 'Yolda').length;
  const totalOrdersAmount = orders.reduce((sum, o) => sum + o.totalAmount, 0);

  const handleSelectCampaignDefault = (slide: CampaignSlide) => {
    if (onSelectCampaign) {
      onSelectCampaign(slide);
    } else if (onGoToProducts) {
      onGoToProducts();
    }
  };

  const handleQuickOrderCampaignDefault = (slide: CampaignSlide) => {
    if (onQuickOrderCampaign) {
      onQuickOrderCampaign(slide);
    } else if (onGoToProducts) {
      onGoToProducts();
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-[1600px] w-full mx-auto space-y-6">
      {/* 1. Giriş Sayfası B2B İndirimli & Kampanyalı Ürünler Slider'ı */}
      <PromotionSlider
        slides={activeSlides}
        onSelectCampaign={handleSelectCampaignDefault}
        onQuickOrderCampaign={handleQuickOrderCampaignDefault}
      />

      {/* Welcome Banner */}
      <div className="bg-[#007bb9] text-white rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 rounded-md bg-white/20 text-white text-[11px] font-bold uppercase tracking-wider">
            B2B KURUMSAL KONSOL
          </span>
          <h2 className="font-heading text-xl sm:text-2xl font-bold mt-1 tracking-tight">
            Hoş Geldiniz, Batu Güdek (Stokk Tekstil)
          </h2>
          <p className="text-white/80 text-xs mt-1 max-w-xl">
            Kayseri Mağaza ve Ana Depo canlı envanter takibi, B2B kampanya siparişleri ve sevkiyat yönetimi.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {onGoToProducts && (
            <button
              type="button"
              onClick={onGoToProducts}
              className="px-4 py-2 rounded-xl bg-white text-[#006194] text-xs font-bold hover:bg-[#eff4ff] transition-all shadow-sm flex items-center gap-1.5"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Ürün Listesine Git</span>
            </button>
          )}
          <button
            type="button"
            onClick={onGoToInventory}
            className="px-4 py-2 rounded-xl bg-white/15 text-white text-xs font-bold hover:bg-white/25 transition-all shadow-sm flex items-center gap-1.5"
          >
            <span>Varyant Matrisi</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={onGoToInventory}
          className="bg-white p-4 rounded-xl border border-amber-200 shadow-xs cursor-pointer hover:border-amber-400 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#707881] uppercase font-bold tracking-wider">
              Kritik & Azalan Stoklar
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="font-heading text-2xl font-bold text-amber-900 mt-2">
            {criticalVariants.length}{' '}
            <span className="text-xs text-[#707881] font-normal font-sans">Varyant</span>
          </p>
          <p className="text-[11px] text-amber-800 font-semibold mt-1 flex items-center gap-1">
            <span>Eşik seviyesi altında veya tükenmek üzere</span>
          </p>
        </div>

        <div
          onClick={onGoToProducts || onGoToInventory}
          className="bg-white p-4 rounded-xl border border-[#e5eeff] shadow-xs cursor-pointer hover:border-[#006194] transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#707881] uppercase font-bold tracking-wider">
              Aktif B2B Kampanyaları
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#eff4ff] text-[#006194] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <p className="font-heading text-2xl font-bold text-[#006194] mt-2">
            {activeSlides.length}{' '}
            <span className="text-xs text-[#707881] font-normal font-sans">Özel Seri Kampanya</span>
          </p>
          <p className="text-[11px] text-[#565e74] mt-1">
            İndirimli toptan asorti avantajları aktif
          </p>
        </div>

        <div
          onClick={onGoToOrders}
          className="bg-white p-4 rounded-xl border border-[#e5eeff] shadow-xs cursor-pointer hover:border-[#006194] transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#707881] uppercase font-bold tracking-wider">
              B2B Günlük Sipariş Cirosu
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#e6f4ea] text-[#00685f] flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="font-heading text-2xl font-bold text-[#00685f] mt-2">
            ₺{totalOrdersAmount.toLocaleString('tr-TR')}
          </p>
          <p className="text-[11px] text-[#565e74] mt-1">
            {orders.length} adet toptan bayi siparişi
          </p>
        </div>

        <div
          onClick={onGoToProducts || onGoToInventory}
          className="bg-white p-4 rounded-xl border border-[#e5eeff] shadow-xs cursor-pointer hover:border-[#006194] transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#707881] uppercase font-bold tracking-wider">
              Katalog & Aktif Ürün
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#eff4ff] text-[#006194] flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="font-heading text-2xl font-bold text-[#0b1c30] mt-2">
            {products.length} Ana Model
          </p>
          <p className="text-[11px] text-[#565e74] mt-1">
            Kadife Flare Pantolon, Gömlek, Triko, Kaban
          </p>
        </div>
      </div>

      {/* Two-column layout: Critical Low Stock Alerts & Recent Transfers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Critical Low Stock Box */}
        <div className="bg-white p-5 rounded-2xl border border-[#e5eeff] shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <h3 className="font-heading text-sm font-bold text-[#0b1c30]">
                Kritik & Azalan Stok Takibi
              </h3>
            </div>
            <button
              type="button"
              onClick={onGoToInventory}
              className="text-xs text-[#006194] font-bold hover:underline"
            >
              Matrise Git
            </button>
          </div>

          <div className="space-y-2">
            {criticalVariants.slice(0, 5).map((v) => {
              const parentProd = products.find((p) => p.variants.some((pv) => pv.id === v.id));
              return (
                <div
                  key={v.id}
                  className="p-3 rounded-xl bg-[#fffbf5] border border-amber-200 flex items-center justify-between text-xs hover:bg-[#fff7ed] transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3 h-3 rounded-full ring-2 ring-white"
                      style={{ backgroundColor: v.colorHex }}
                    />
                    <div>
                      <p className="font-bold text-[#0b1c30]">
                        {parentProd?.name || 'Ürün'} ({v.colorName} / {v.size})
                      </p>
                      <p className="text-[11px] text-[#707881] font-mono">{v.sku}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-0.5 rounded font-mono font-bold ${
                      v.onHand === 0
                        ? 'bg-[#ffdad6] text-[#93000a]'
                        : 'bg-amber-100 text-amber-900'
                    }`}>
                      {v.onHand === 0 ? 'Tükendi (0)' : `${v.onHand} Adet`}
                    </span>
                    <span className="block text-[10px] text-[#707881] mt-0.5">
                      Gelecek: {v.incoming} Adet
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Öne Çıkan B2B Kampanyalı Ürünler */}
        <div className="bg-white p-5 rounded-2xl border border-[#e5eeff] shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#006194]" />
              <h3 className="font-heading text-sm font-bold text-[#0b1c30]">
                Öne Çıkan Toptan Fırsatlar & Kampanyalar
              </h3>
            </div>
            {onGoToProducts && (
              <button
                type="button"
                onClick={onGoToProducts}
                className="text-xs text-[#006194] font-bold hover:underline"
              >
                Kataloğa Git
              </button>
            )}
          </div>

          <div className="space-y-2">
            {activeSlides.slice(0, 4).map((slide) => (
              <div
                key={slide.id}
                onClick={() => handleSelectCampaignDefault(slide)}
                className="p-3 rounded-xl bg-[#f8f9ff] border border-[#e5eeff] flex items-center justify-between text-xs hover:bg-[#eff4ff] transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-[#eff4ff] border border-[#dce9ff] overflow-hidden flex-shrink-0">
                    <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-[#0b1c30] group-hover:text-[#006194] transition-colors">
                        {slide.title}
                      </span>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#ffdad6] text-[#ba1a1a]">
                        %{slide.discountPercent} İndirim
                      </span>
                    </div>
                    <p className="text-[11px] text-[#565e74] line-clamp-1 mt-0.5">
                      {slide.description}
                    </p>
                    <span className="font-mono text-[10px] text-[#006194] font-semibold block">
                      Min. {slide.minOrderQty} Adet Asorti • Stok: {slide.availableStock} Adet
                    </span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 pl-2">
                  <span className="font-mono font-bold text-xs sm:text-sm text-[#00685f] block">
                    ₺{slide.discountedPrice.toLocaleString('tr-TR')}
                  </span>
                  <span className="font-mono text-[10px] text-[#707881] line-through block">
                    ₺{slide.originalPrice.toLocaleString('tr-TR')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
