import React, { useState } from 'react';
import {
  Home,
  Users,
  Package,
  Layers,
  ChevronRight,
  ChevronDown,
  Receipt,
  ShoppingCart,
  BarChart2,
  Settings,
  LogOut,
  Sparkles,
  Tag,
  Calendar,
  Sliders,
  Check,
  ClipboardList,
  ShieldCheck,
  Building2
} from 'lucide-react';
import { Customer, StoreLocation } from '../types';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  cartCount: number;
  productFilter?: { type: string; value?: string } | null;
  onSelectProductFilter?: (type: string, value?: string) => void;
  onLogout?: () => void;
  currentUser?: Customer | { name: string; email: string; role: string; companyName?: string } | null;
  currentLocation?: StoreLocation;
  locations?: StoreLocation[];
  onSelectLocation?: (loc: StoreLocation) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  cartCount,
  productFilter,
  onSelectProductFilter,
  onLogout,
  currentUser,
}) => {
  const [urunlerOpen, setUrunlerOpen] = useState(true);
  const [openSubSection, setOpenSubSection] = useState<string | null>(null);

  const isAdmin =
    currentUser?.role === 'Admin' ||
    currentUser?.role?.includes('Admin') ||
    currentUser?.role?.includes('Yönetici');

  const toggleSubSection = (section: string) => {
    setOpenSubSection(openSubSection === section ? null : section);
  };

  const handleProductFilterClick = (type: string, value?: string) => {
    onSelectTab('urunler');
    if (onSelectProductFilter) {
      onSelectProductFilter(type, value);
    }
  };

  // Helper initials
  const getInitials = () => {
    if (!currentUser) return 'BG';
    if ('firstName' in currentUser && currentUser.firstName) {
      return `${currentUser.firstName[0]}${currentUser.lastName ? currentUser.lastName[0] : ''}`.toUpperCase();
    }
    if ('name' in currentUser && currentUser.name) {
      return currentUser.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
    }
    return 'BG';
  };

  const getDisplayName = () => {
    if (!currentUser) return 'Batu Güdek';
    if ('firstName' in currentUser && currentUser.firstName) {
      return `${currentUser.firstName} ${currentUser.lastName}`;
    }
    if ('name' in currentUser && currentUser.name) {
      return currentUser.name;
    }
    return 'Batu Güdek';
  };

  const getDisplayCompany = () => {
    if (isAdmin) return 'Sistem Yöneticisi';
    if (currentUser && 'companyName' in currentUser && currentUser.companyName) {
      return currentUser.companyName;
    }
    return 'Bayi Müşterisi';
  };

  return (
    <aside
      id="sidebar-container"
      className="fixed left-0 top-0 h-full w-72 bg-white border-r border-[#e5eeff] shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-50 flex flex-col justify-between overflow-y-auto"
    >
      <div className="flex flex-col">
        {/* Logo and Brand Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-[#f1f5f9] bg-white">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => onSelectTab(isAdmin ? 'admin-siparisler' : 'urunler')}
          >
            <img
              alt="Stokk Logo"
              className="h-8 w-auto object-contain"
              src="https://lh3.googleusercontent.com/aida/AEtjO1XCoRuGHxE3bSo2RAKZscuspiz2y3F0--bxK9nCGrD1x-l_hTdHIhRbzwLZl_i5rekiqXg-Y8qiqCzjZvjfsgLHIShwyYg766CT_RdCbD3JIrhQ59cVkE2cRWkayJswO96cpihfQS4ytu22soVWUhjk-0B3O-GRH3X_c4t2tqpenY7PABkP7TONHETm-Msam7Y7_vCLxVVbZukq4dNa-spVR2mCEU7M6oGebjZJVf5JvV-mJiMB3-hqvQ"
            />
            <span className="font-heading text-lg font-extrabold text-[#0b1c30] tracking-tight">
              stokk.
            </span>
          </div>
          <span
            className={`px-2 py-0.5 rounded text-[10px] text-white uppercase font-bold tracking-wider ${
              isAdmin ? 'bg-amber-600' : 'bg-[#006194]'
            }`}
          >
            {isAdmin ? 'YÖNETİCİ PANELİ' : 'B2B PORTAL'}
          </span>
        </div>

        {/* Navigation Menu */}
        <nav className="px-3 py-4 space-y-1 flex flex-col">
          {/* ========================================================================= */}
          {/* ADMIN SIDEBAR MENU (ONLY 4 BUTTONS) */}
          {/* ========================================================================= */}
          {isAdmin ? (
            <>
              <div className="px-3 pb-2">
                <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  YÖNETİM İŞLEMLERİ
                </span>
              </div>

              {/* 1. Sipariş Yönetimi */}
              <button
                type="button"
                onClick={() => onSelectTab('admin-siparisler')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                  currentTab === 'admin-siparisler'
                    ? 'bg-[#006194] text-white font-semibold shadow-sm'
                    : 'text-[#3f4850] hover:bg-[#eff4ff] hover:text-[#0b1c30]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ClipboardList className="w-[18px] h-[18px]" />
                  <span className="font-medium text-[13px]">Sipariş Yönetimi</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </button>

              {/* 2. Ürün Yönetimi */}
              <button
                type="button"
                onClick={() => onSelectTab('admin-urunler')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                  currentTab === 'admin-urunler'
                    ? 'bg-[#006194] text-white font-semibold shadow-sm'
                    : 'text-[#3f4850] hover:bg-[#eff4ff] hover:text-[#0b1c30]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Package className="w-[18px] h-[18px]" />
                  <span className="font-medium text-[13px]">Ürün Yönetimi</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </button>

              {/* 3. Kullanıcı Yönetimi */}
              <button
                type="button"
                onClick={() => onSelectTab('admin-kullanicilar')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                  currentTab === 'admin-kullanicilar'
                    ? 'bg-[#006194] text-white font-semibold shadow-sm'
                    : 'text-[#3f4850] hover:bg-[#eff4ff] hover:text-[#0b1c30]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-[18px] h-[18px]" />
                  <span className="font-medium text-[13px]">Kullanıcı Yönetimi</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </button>

              {/* 4. Slider & Kampanya Yönetimi */}
              <button
                type="button"
                onClick={() => onSelectTab('admin-kampanyalar')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                  currentTab === 'admin-kampanyalar'
                    ? 'bg-[#006194] text-white font-semibold shadow-sm'
                    : 'text-[#3f4850] hover:bg-[#eff4ff] hover:text-[#0b1c30]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-[18px] h-[18px]" />
                  <span className="font-medium text-[13px]">Slider & Kampanya Yönetimi</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </button>
            </>
          ) : (
            /* ========================================================================= */
            /* CUSTOMER SIDEBAR MENU (KATALOG, SEPETİM, SİPARİŞLERİM, ANASAYFA) */
            /* ========================================================================= */
            <>
              {/* Anasayfa / Vitrin */}
              <button
                type="button"
                onClick={() => onSelectTab('anasayfa')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all cursor-pointer ${
                  currentTab === 'anasayfa'
                    ? 'bg-[#007bb9] text-white font-semibold shadow-sm'
                    : 'text-[#3f4850] hover:bg-[#eff4ff] hover:text-[#0b1c30]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Home className="w-[18px] h-[18px]" />
                  <span className="font-medium text-[13px]">Vitrin & Fırsatlar</span>
                </div>
              </button>

              {/* Ürünler (Katalog) */}
              <div className="flex flex-col">
                <div
                  className={`w-full flex items-center justify-between px-2.5 py-1 rounded-xl text-xs transition-all ${
                    currentTab === 'urunler'
                      ? 'bg-[#007bb9] text-white font-semibold shadow-sm'
                      : 'text-[#3f4850] hover:bg-[#eff4ff] hover:text-[#0b1c30]'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      onSelectTab('urunler');
                      setUrunlerOpen(true);
                    }}
                    className="flex items-center gap-2.5 flex-1 py-1.5 text-left cursor-pointer focus:outline-none"
                  >
                    <Package className="w-[18px] h-[18px]" />
                    <span className="font-medium text-[13px]">Ürünler (Katalog)</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setUrunlerOpen((prev) => !prev);
                    }}
                    aria-label={urunlerOpen ? 'Ürünler menüsünü kapat' : 'Ürünler menüsünü aç'}
                    className={`p-1.5 rounded-lg transition-all flex items-center justify-center cursor-pointer ${
                      currentTab === 'urunler'
                        ? 'text-white/80 hover:text-white hover:bg-white/10'
                        : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <ChevronDown
                      className={`w-4 h-4 transform transition-transform duration-200 ${
                        urunlerOpen ? 'rotate-180' : 'rotate-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Ürünler Sub-accordion filters */}
                {urunlerOpen && (
                  <div className="pl-4 pr-1 py-1.5 space-y-1 border-l-2 border-[#eff4ff] ml-3 mt-1 text-xs">
                    {/* Tüm Ürünler */}
                    <button
                      type="button"
                      onClick={() => handleProductFilterClick('all')}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                        !productFilter || productFilter.type === 'all'
                          ? 'bg-[#e0f2fe] text-[#0369a1] font-bold'
                          : 'text-[#565e74] hover:bg-[#f1f5f9] hover:text-[#0b1c30]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                        <span>Tüm Ürünler</span>
                      </div>
                    </button>

                    {/* Kategori Filtresi */}
                    <div className="flex flex-col">
                      <button
                        type="button"
                        onClick={() => toggleSubSection('kategori')}
                        className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[#565e74] hover:bg-[#f1f5f9] hover:text-[#0b1c30] transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <Tag className="w-3.5 h-3.5 opacity-60" />
                          <span>Kategori</span>
                        </div>
                        <ChevronDown
                          className={`w-3 h-3 transition-transform ${
                            openSubSection === 'kategori' ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      {openSubSection === 'kategori' && (
                        <div className="pl-5 py-1 space-y-1">
                          {['Elbise', 'Gömlek', 'Pantolon', 'Ceket'].map((cat) => (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => handleProductFilterClick('category', cat)}
                              className={`w-full text-left px-2 py-1 rounded text-[11px] transition-colors cursor-pointer ${
                                productFilter?.type === 'category' && productFilter?.value === cat
                                  ? 'bg-[#e0f2fe] text-[#0369a1] font-bold'
                                  : 'text-[#707881] hover:text-[#0b1c30] hover:bg-[#f8f9fa]'
                              }`}
                            >
                              • {cat}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Sezon Filtresi */}
                    <div className="flex flex-col">
                      <button
                        type="button"
                        onClick={() => toggleSubSection('sezon')}
                        className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[#565e74] hover:bg-[#f1f5f9] hover:text-[#0b1c30] transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 opacity-60" />
                          <span>Sezon</span>
                        </div>
                        <ChevronDown
                          className={`w-3 h-3 transition-transform ${
                            openSubSection === 'sezon' ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      {openSubSection === 'sezon' && (
                        <div className="pl-5 py-1 space-y-1">
                          {['2026 Yaz', '2025 Sonbahar', '2026 Kış'].map((season) => (
                            <button
                              key={season}
                              type="button"
                              onClick={() => handleProductFilterClick('season', season)}
                              className={`w-full text-left px-2 py-1 rounded text-[11px] transition-colors cursor-pointer ${
                                productFilter?.type === 'season' && productFilter?.value === season
                                  ? 'bg-[#e0f2fe] text-[#0369a1] font-bold'
                                  : 'text-[#707881] hover:text-[#0b1c30] hover:bg-[#f8f9fa]'
                              }`}
                            >
                              • {season}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Sepetim */}
              <button
                type="button"
                onClick={() => onSelectTab('sepetim')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all cursor-pointer ${
                  currentTab === 'sepetim'
                    ? 'bg-[#007bb9] text-white font-semibold shadow-sm'
                    : 'text-[#3f4850] hover:bg-[#eff4ff] hover:text-[#0b1c30]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ShoppingCart className="w-[18px] h-[18px]" />
                  <span className="font-medium text-[13px]">Sepetim</span>
                </div>
                {cartCount > 0 && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      currentTab === 'sepetim'
                        ? 'bg-white text-[#007bb9]'
                        : 'bg-[#ba1a1a] text-white'
                    }`}
                  >
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Siparişlerim (Strict User Isolated) */}
              <button
                type="button"
                onClick={() => onSelectTab('siparislerim')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all cursor-pointer ${
                  currentTab === 'siparislerim'
                    ? 'bg-[#007bb9] text-white font-semibold shadow-sm'
                    : 'text-[#3f4850] hover:bg-[#eff4ff] hover:text-[#0b1c30]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Receipt className="w-[18px] h-[18px]" />
                  <span className="font-medium text-[13px]">Siparişlerim</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </button>
            </>
          )}
        </nav>
      </div>

      {/* User Footer Profile & Logout */}
      <div className="p-3 border-t border-[#f1f5f9] bg-white">
        <div className="p-2.5 rounded-xl bg-[#eff4ff] flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold tracking-tight shadow-sm flex-shrink-0 ${
                isAdmin ? 'bg-amber-600' : 'bg-[#006194]'
              }`}
            >
              {getInitials()}
            </div>
            <div className="truncate">
              <p className="text-xs text-[#0b1c30] font-bold truncate leading-tight">
                {getDisplayName()}
              </p>
              <p className="text-[10px] text-[#565e74] truncate font-medium">
                {getDisplayCompany()}
              </p>
            </div>
          </div>
          <button
            type="button"
            title="Oturumu Kapat"
            onClick={() => {
              if (onLogout) onLogout();
            }}
            className="text-[#707881] hover:text-[#ba1a1a] p-1.5 rounded-lg hover:bg-[#fff8f7] transition-colors cursor-pointer flex-shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
