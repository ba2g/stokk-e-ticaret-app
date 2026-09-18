import React, { useState, useEffect } from 'react';
import {
  Search,
  Store,
  ChevronDown,
  Plus,
  Bell,
  User,
  Menu,
  X,
  AlertTriangle,
  Package,
  Truck,
  CheckCircle2,
  LogOut,
  ShoppingCart,
  Database
} from 'lucide-react';
import { StoreLocation, Customer } from '../types';

interface HeaderProps {
  currentLocation: StoreLocation;
  locations: StoreLocation[];
  onSelectLocation: (loc: StoreLocation) => void;
  onOpenQuickOrder: () => void;
  searchTerm: string;
  onSearchChange: (val: string) => void;
  onToggleMobileSidebar: () => void;
  onLogout?: () => void;
  currentUser?: Customer | { name: string; email: string; role: string } | null;
  cartCount?: number;
  onGoToCart?: () => void;
  onOpenDbInspector?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentLocation,
  locations,
  onSelectLocation,
  onOpenQuickOrder,
  searchTerm,
  onSearchChange,
  onToggleMobileSidebar,
  onLogout,
  currentUser,
  cartCount = 0,
  onGoToCart,
  onOpenDbInspector,
}) => {
  const [locDropdown, setLocDropdown] = useState(false);
  const [notifDropdown, setNotifDropdown] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);

  // Keyboard shortcut Ctrl + K for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const input = document.getElementById('global-search-input');
        if (input) {
          input.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const notifications = [
    {
      id: 'n1',
      title: 'Kritik Ters Bakiye Uyarısı',
      message: 'Kadife Flare Pantolon (KAH-34) stokta -8 adet ters bakiye veriyor.',
      time: '10 dk önce',
      type: 'error',
    },
    {
      id: 'n2',
      title: 'Tedarikçi Sevkiyatı Yolda',
      message: '+120 adet Kadife Flare Pantolon satın alma siparişi 2 gün içinde depoya ulaşacak.',
      time: '45 dk önce',
      type: 'info',
    },
    {
      id: 'n3',
      title: 'Transfer Onayı Bekliyor',
      message: 'Ana Depo -> Kayseri Mağaza 15 adet transfer talebi oluşturuldu.',
      time: '2 saat önce',
      type: 'warning',
    },
  ];

  return (
    <header
      id="top-header"
      className="fixed top-0 left-0 lg:left-72 right-0 h-16 bg-white/95 backdrop-blur-md border-b border-[#e5eeff] shadow-[0_1px_8px_rgba(0,0,0,0.03)] z-40 px-4 sm:px-6 flex items-center justify-between gap-4"
    >
      {/* Left side: Hamburger button on mobile + search bar */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-lg text-[#565e74] hover:bg-[#eff4ff]"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Product Search Input */}
        <div className="relative w-full max-w-lg">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#707881] w-4 h-4 pointer-events-none" />
          <input
            id="global-search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Ürün adı, kod, marka, üretici, renk veya açıklama ara..."
            className="w-full h-9 pl-9 pr-16 bg-[#eff4ff] border border-transparent rounded-xl text-xs text-[#0b1c30] placeholder:text-[#707881] focus:outline-none focus:border-[#006194] focus:bg-white transition-all shadow-inner"
          />
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-[#dce9ff] text-[#3f4850] text-[10px] font-mono font-medium select-none">
            Ctrl + K
          </span>
        </div>
      </div>

      {/* Right side: Quick order button, notifications, Batu Güdek profile */}
      <div className="flex items-center gap-3">
        {/* Live Database Inspector Button (Sadece Yöneticiye Özel) */}
        {currentUser?.role === 'Admin' && onOpenDbInspector && (
          <button
            type="button"
            onClick={onOpenDbInspector}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-200 bg-amber-50 text-amber-900 hover:bg-amber-100 font-bold text-xs transition-all shadow-sm active:scale-95 cursor-pointer"
            title="Yönetici Canlı Veritabanını İzle (Kullanıcılar, Siparişler, Stoklar, Sepetler)"
          >
            <Database className="w-4 h-4 text-amber-700" />
            <span className="hidden sm:inline">Canlı DB İzle</span>
          </button>
        )}

        <button
          type="button"
          onClick={onOpenQuickOrder}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#006194] hover:bg-[#007bb9] text-white text-xs font-bold transition-all shadow-sm active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span className="whitespace-nowrap">Hızlı Sipariş</span>
        </button>

        {/* Cart Quick Access Button */}
        {onGoToCart && (
          <button
            type="button"
            onClick={onGoToCart}
            className="relative p-2 rounded-xl text-[#565e74] hover:bg-[#eff4ff] hover:text-[#006194] transition-colors cursor-pointer"
            title="Sipariş Sepetini Aç"
          >
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#006194] text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                {cartCount}
              </span>
            )}
          </button>
        )}

        {/* Notifications Button & Popover */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setNotifDropdown(!notifDropdown)}
            className="relative p-2 rounded-xl text-[#565e74] hover:bg-[#eff4ff] hover:text-[#0b1c30] transition-colors"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#ba1a1a] ring-2 ring-white"></span>
          </button>

          {notifDropdown && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-[#dce9ff] py-2 z-50 animate-in fade-in duration-150">
              <div className="px-3.5 pb-2 border-b border-[#f1f5f9] flex items-center justify-between">
                <span className="text-xs font-bold text-[#0b1c30]">Bildirimler (3)</span>
                <button
                  type="button"
                  onClick={() => alert('Tüm bildirimler okundu olarak işaretlendi.')}
                  className="text-[11px] text-[#006194] hover:underline font-medium"
                >
                  Tümünü Oku
                </button>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-[#f8fafc]">
                {notifications.map((n) => (
                  <div key={n.id} className="p-3 hover:bg-[#eff4ff] transition-colors cursor-pointer">
                    <div className="flex items-start gap-2">
                      {n.type === 'error' ? (
                        <AlertTriangle className="w-4 h-4 text-[#ba1a1a] mt-0.5 flex-shrink-0" />
                      ) : n.type === 'warning' ? (
                        <Truck className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-[#00685f] mt-0.5 flex-shrink-0" />
                      )}
                      <div>
                        <p className="text-xs font-semibold text-[#0b1c30] leading-tight">{n.title}</p>
                        <p className="text-[11px] text-[#565e74] mt-0.5 leading-normal">{n.message}</p>
                        <span className="text-[10px] text-[#707881] mt-1 block">{n.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User profile dropdown on header */}
        <div className="relative">
          <div
            onClick={() => setUserDropdown(!userDropdown)}
            className="flex items-center gap-2 pl-1 cursor-pointer select-none p-1 rounded-xl hover:bg-[#eff4ff] transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-[#006194] flex items-center justify-center text-white shadow-sm font-bold text-xs">
              {currentUser && 'firstName' in currentUser && currentUser.firstName
                ? `${currentUser.firstName[0]}${currentUser.lastName ? currentUser.lastName[0] : ''}`.toUpperCase()
                : 'BG'}
            </div>
            <div className="hidden sm:flex flex-col items-start text-left">
              <span className="text-xs font-bold text-[#0b1c30] leading-tight">
                {currentUser && 'firstName' in currentUser && currentUser.firstName
                  ? `${currentUser.firstName} ${currentUser.lastName}`
                  : (currentUser && 'name' in currentUser ? currentUser.name : 'Batu Güdek')}
              </span>
              <span className="text-[10px] text-[#565e74] leading-none">
                {currentUser?.role === 'Admin' ? 'Yönetici' : 'Bayi Müşterisi'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#707881]" />
          </div>

          {userDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-[#dce9ff] py-1.5 z-50 animate-in fade-in duration-150">
              <div className="px-3.5 py-2 border-b border-[#f1f5f9]">
                <p className="text-xs font-bold text-[#0b1c30]">
                  {currentUser && 'firstName' in currentUser && currentUser.firstName
                    ? `${currentUser.firstName} ${currentUser.lastName}`
                    : (currentUser && 'name' in currentUser ? currentUser.name : 'Batu Güdek')}
                </p>
                <p className="text-[11px] text-[#707881] truncate">
                  {currentUser?.email || 'batugudek1@gmail.com'}
                </p>
                <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#eff4ff] text-[#006194]">
                  {currentUser?.role === 'Admin' ? 'Sistem Yöneticisi' : 'Bayi Müşterisi'}
                </span>
              </div>
              <div className="p-1">
                <button
                  type="button"
                  id="header-logout-button"
                  onClick={() => {
                    setUserDropdown(false);
                    if (onLogout) {
                      onLogout();
                    }
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-[#ba1a1a] hover:bg-[#fff8f7] transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-[#ba1a1a]" />
                  <span>Çıkış Yap</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
