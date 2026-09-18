import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Tag,
  Flame,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  Clock,
  ShieldCheck,
  CheckCircle2,
  PackageCheck
} from 'lucide-react';
import { CampaignSlide } from '../../types';

interface PromotionSliderProps {
  slides: CampaignSlide[];
  onSelectCampaign: (slide: CampaignSlide) => void;
  onQuickOrderCampaign: (slide: CampaignSlide) => void;
}

export const PromotionSlider: React.FC<PromotionSliderProps> = ({
  slides,
  onSelectCampaign,
  onQuickOrderCampaign,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-advance every 4.5 seconds unless hovered
  useEffect(() => {
    if (slides.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 4500);

    return () => clearInterval(timer);
  }, [slides.length, isPaused]);

  if (!slides || slides.length === 0) return null;

  const currentSlide = slides[currentIndex];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  return (
    <div
      id="b2b-promotion-slider"
      className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#0b1c30] via-[#0f2d4e] to-[#004b75] text-white shadow-md border border-[#1e3a5f]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Decorative Accent Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#007bb9]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-[#00685f]/15 rounded-full blur-2xl pointer-events-none" />

      {/* Main Slide Content Grid */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 items-center min-h-[340px] sm:min-h-[360px] p-6 sm:p-8 md:p-10 gap-6 lg:gap-10">
        {/* Left Column: Text, Badges, Offer details */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
          {/* Badges row */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#d9383a] text-white shadow-xs animate-pulse">
              <Flame className="w-3.5 h-3.5" />
              <span>{currentSlide.badge}</span>
            </span>

            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/15 text-white/90 backdrop-blur-xs">
              <Tag className="w-3 h-3 text-[#38bdf8]" />
              <span className="font-mono">{currentSlide.productCode}</span>
            </span>

            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#e6f4ea]/20 text-[#a3e6cd] border border-[#a3e6cd]/30">
              <CheckCircle2 className="w-3 h-3" />
              <span>Stokta Var: {currentSlide.availableStock} Adet</span>
            </span>
          </div>

          {/* Heading and description */}
          <div>
            <span className="text-xs uppercase tracking-widest font-bold text-[#38bdf8] block">
              {currentSlide.subtitle}
            </span>
            <h3 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 text-white leading-tight">
              {currentSlide.title}
            </h3>
            <p className="text-xs sm:text-sm text-white/80 mt-2 max-w-xl leading-relaxed">
              {currentSlide.description}
            </p>
          </div>

          {/* Pricing & Terms Box */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 flex flex-wrap items-center justify-between gap-4 max-w-xl">
            <div className="flex items-baseline gap-3">
              <div>
                <span className="text-[10px] text-white/60 block uppercase font-bold">
                  Birim Toptan Liste Fiyatı
                </span>
                <span className="text-sm line-through text-white/50 font-mono">
                  ₺{currentSlide.originalPrice.toLocaleString('tr-TR')}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#38bdf8] block uppercase font-extrabold">
                  Kampanyalı Net Fiyat
                </span>
                <span className="text-xl sm:text-2xl font-black font-mono text-emerald-400">
                  ₺{currentSlide.discountedPrice.toLocaleString('tr-TR')}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/30 text-emerald-300 font-extrabold text-xs border border-emerald-400/40">
                -%{currentSlide.discountPercent}
              </span>
            </div>

            <div className="text-right text-[11px] text-white/70">
              <div className="flex items-center gap-1 justify-end text-white/90 font-medium">
                <PackageCheck className="w-3.5 h-3.5 text-amber-300" />
                <span>Min. {currentSlide.minOrderQty} Adet Sipariş</span>
              </div>
              <div className="flex items-center gap-1 justify-end text-white/60 text-[10px] mt-0.5">
                <Clock className="w-3 h-3" />
                <span>Son Gün: {currentSlide.validUntil}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-1 flex-wrap">
            <button
              type="button"
              onClick={() => onSelectCampaign(currentSlide)}
              className="px-5 py-2.5 rounded-xl bg-[#006194] hover:bg-[#007bb9] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 active:scale-95"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{currentSlide.actionLabel}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => onQuickOrderCampaign(currentSlide)}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-xs border border-white/20 transition-all flex items-center gap-1.5"
            >
              <span>Hızlı Asorti Sipariş Girişi</span>
            </button>
          </div>
        </div>

        {/* Right Column: Featured Image with Badge */}
        <div className="lg:col-span-5 flex items-center justify-center relative">
          <div className="relative w-full max-w-[320px] aspect-4/3 sm:aspect-square rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl bg-white/5 group">
            <img
              src={currentSlide.image}
              alt={currentSlide.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

            {/* Float badge over image */}
            <div className="absolute bottom-3 left-3 right-3 p-2.5 rounded-xl bg-black/40 backdrop-blur-md border border-white/20 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#38bdf8] block">Kampanya Kodu</span>
                <span className="text-xs font-mono font-bold">{currentSlide.productCode}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-white/70 block">Sipariş Durumu</span>
                <span className="text-xs font-bold text-emerald-400">Stokta Var</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Controls & Pagination */}
      <div className="relative z-10 px-6 sm:px-8 pb-5 flex items-center justify-between border-t border-white/10 pt-3">
        {/* Indicators / Dots */}
        <div className="flex items-center gap-2">
          {slides.map((slide, idx) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Slayt ${idx + 1}`}
              className={`h-2.5 transition-all rounded-full ${
                idx === currentIndex
                  ? 'w-8 bg-white shadow-xs'
                  : 'w-2.5 bg-white/30 hover:bg-white/60'
              }`}
            />
          ))}
          <span className="text-[11px] text-white/60 ml-2 font-mono">
            {currentIndex + 1} / {slides.length}
          </span>
        </div>

        {/* Prev / Next Arrows */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Önceki Kampanya"
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-all border border-white/10 active:scale-90"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            aria-label="Sonraki Kampanya"
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-all border border-white/10 active:scale-90"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
