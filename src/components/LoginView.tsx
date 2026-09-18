import React, { useState, useEffect } from 'react';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Building2,
  Sparkles,
  User,
  Phone,
  AlertCircle,
  CheckCircle2,
  UserPlus,
  ShieldAlert
} from 'lucide-react';
import { Customer, Company } from '../types';
import { userService } from '../services/userService';
import { companyService } from '../services/companyService';

interface LoginViewProps {
  onLogin: (user: Customer) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  // Mode: 'admin' or 'customer'
  const [activePortal, setActivePortal] = useState<'admin' | 'customer'>('admin');

  // Customer sub-tab: 'login' or 'register'
  const [customerTab, setCustomerTab] = useState<'login' | 'register'>('login');

  // Admin form state
  const [adminIdentifier, setAdminIdentifier] = useState('batugudek1@gmail.com');
  const [adminPassword, setAdminPassword] = useState('Password123*');
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  // Customer login form state
  const [customerIdentifier, setCustomerIdentifier] = useState('ayseyilmaz');
  const [customerPassword, setCustomerPassword] = useState('Password123*');
  const [showCustomerPassword, setShowCustomerPassword] = useState(false);

  // Customer register form state
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regCompanyId, setRegCompanyId] = useState('');
  const [isCreatingNewCompany, setIsCreatingNewCompany] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newCompanyCity, setNewCompanyCity] = useState('Kayseri');

  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const compList = companyService.getCompanies();
    setCompanies(compList);
    if (compList.length > 0) {
      setRegCompanyId(compList[0].id);
    }
  }, [customerTab]);

  // Handle Admin Login (Strict Batu Güdek check)
  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!adminIdentifier.trim()) {
      setErrorMessage('Lütfen yönetici kullanıcı adı veya e-posta adresinizi giriniz.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const res = userService.adminLogin(adminIdentifier, adminPassword);
      if (!res.success || !res.user) {
        setErrorMessage(
          res.error ||
            'Yetkisiz Giriş: Bu alandan yalnızca yetkili sistem yöneticisi (Batu Güdek) giriş yapabilir! Diğer kullanıcıların yönetici paneline erişim yetkisi bulunmamaktadır.'
        );
      } else {
        setSuccessMessage('Yönetici yetkisi doğrulandı. Yönlendiriliyorsunuz...');
        setTimeout(() => {
          onLogin(res.user!);
        }, 400);
      }
    }, 400);
  };

  // Handle Customer Login
  const handleCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!customerIdentifier.trim()) {
      setErrorMessage('Lütfen kullanıcı adı veya e-posta adresinizi giriniz.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const res = userService.customerLogin(customerIdentifier, customerPassword);
      if (!res.success || !res.user) {
        setErrorMessage(res.error || 'Giriş yapılamadı. Bilgilerinizi kontrol ediniz.');
      } else {
        setSuccessMessage(`Hoş geldiniz ${res.user.firstName} ${res.user.lastName}! Giriş yapılıyor...`);
        setTimeout(() => {
          onLogin(res.user!);
        }, 400);
      }
    }, 400);
  };

  // Handle Customer Registration with Company
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!regFirstName.trim() || !regLastName.trim() || !regEmail.trim() || !regUsername.trim()) {
      setErrorMessage('Lütfen zorunlu alanları (Ad, Soyad, E-posta, Kullanıcı Adı) eksiksiz doldurunuz.');
      return;
    }

    let targetCompanyId = regCompanyId;
    let targetCompanyName = '';

    if (isCreatingNewCompany) {
      if (!newCompanyName.trim()) {
        setErrorMessage('Lütfen oluşturulacak yeni şirket adını giriniz.');
        return;
      }
      const createdCompany = companyService.createCompany({
        name: newCompanyName.trim(),
        city: newCompanyCity.trim() || 'Kayseri',
      });
      targetCompanyId = createdCompany.id;
      targetCompanyName = createdCompany.name;
    } else {
      const selectedComp = companies.find((c) => c.id === targetCompanyId);
      if (!selectedComp) {
        setErrorMessage('Lütfen geçerli bir şirket seçiniz.');
        return;
      }
      targetCompanyName = selectedComp.name;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const res = userService.registerCustomer({
        firstName: regFirstName,
        lastName: regLastName,
        email: regEmail,
        phone: regPhone || '+90 (555) 000 00 00',
        username: regUsername,
        password: regPassword || 'Password123*',
        companyId: targetCompanyId,
        companyName: targetCompanyName,
        city: newCompanyCity || 'Kayseri',
      });

      if (!res.success || !res.user) {
        setErrorMessage(res.error || 'Kayıt işlemi sırasında bir hata oluştu.');
      } else {
        setSuccessMessage('Kayıt başarıyla oluşturuldu! Sisteme giriş yapılıyor...');
        setTimeout(() => {
          onLogin(res.user!);
        }, 500);
      }
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex flex-col justify-between font-sans antialiased">
      {/* Top Bar / Minimal Header */}
      <header className="h-16 px-6 sm:px-10 border-b border-[#e5eeff] bg-white flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#006194] text-white flex items-center justify-center font-bold font-heading shadow-xs">
            S
          </div>
          <div>
            <span className="font-heading font-bold text-sm tracking-tight text-[#0b1c30] block leading-tight">
              Stokk Tekstil ERP & B2B
            </span>
            <span className="text-[10px] text-[#707881] block">
              Kurumsal E-Ticaret ve Müşteri Yönetim Portalı
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#565e74]">
          <span className="inline-block w-2 h-2 rounded-full bg-[#00685f]"></span>
          <span className="hidden sm:inline font-medium">Veritabanı ve Mikroservisler Aktif</span>
        </div>
      </header>

      {/* Main Login Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="w-full max-w-lg bg-white rounded-2xl border border-[#e5eeff] shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-6 sm:p-8 space-y-5">
          {/* Portal Switch Buttons */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setActivePortal('admin');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activePortal === 'admin'
                  ? 'bg-[#006194] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Yönetici Girişi</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActivePortal('customer');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activePortal === 'customer'
                  ? 'bg-[#006194] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Müşteri / Bayi Girişi</span>
            </button>
          </div>

          {/* Feedback Messages */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5 animate-in fade-in">
              <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span className="font-medium leading-relaxed">{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span className="font-medium">{successMessage}</span>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 1. ADMIN LOGIN PANEL */}
          {/* ========================================================================= */}
          {activePortal === 'admin' && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>
                  <strong>Güvenlik Kuralı:</strong> Bu kapıdan yalnızca sistem yöneticisi{' '}
                  <strong>Batu Güdek</strong> giriş yapabilir. Harici kullanıcılar yetkilendirilmez.
                </span>
              </div>

              <form onSubmit={handleAdminSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#3f4850] mb-1">
                    Yönetici Kullanıcı Adı veya E-posta
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#707881] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={adminIdentifier}
                      onChange={(e) => setAdminIdentifier(e.target.value)}
                      placeholder="batugudek veya batugudek1@gmail.com"
                      className="w-full h-10 pl-10 pr-3 rounded-xl border border-[#bfc7d2] bg-white text-xs text-[#0b1c30] placeholder:text-[#9aa4b2] focus:outline-none focus:border-[#006194] focus:ring-2 focus:ring-[#006194]/10 transition-all font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#3f4850] mb-1">
                    Yönetici Şifresi
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#707881] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showAdminPassword ? 'text' : 'password'}
                      required
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full h-10 pl-10 pr-10 rounded-xl border border-[#bfc7d2] bg-white text-xs text-[#0b1c30] placeholder:text-[#9aa4b2] focus:outline-none focus:border-[#006194] focus:ring-2 focus:ring-[#006194]/10 transition-all font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminPassword(!showAdminPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#707881] hover:text-[#0b1c30] p-0.5"
                    >
                      {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 rounded-xl bg-[#006194] hover:bg-[#007bb9] active:scale-[0.99] text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Yönetici Doğrulanıyor...</span>
                    </>
                  ) : (
                    <>
                      <span>Yönetici Olarak Giriş Yap</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Fast Direct Demo for Batu Güdek */}
              <div className="pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setAdminIdentifier('batugudek1@gmail.com');
                    setAdminPassword('Password123*');
                    const res = userService.adminLogin('batugudek1@gmail.com', 'Password123*');
                    if (res.success && res.user) {
                      onLogin(res.user);
                    }
                  }}
                  className="w-full p-2.5 rounded-xl border border-blue-200 bg-blue-50/60 hover:bg-blue-100/60 transition-all flex items-center justify-between text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-[#006194] text-white flex items-center justify-center font-bold text-xs">
                      BG
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 group-hover:text-blue-700">
                        Batu Güdek (Yönetici)
                      </p>
                      <p className="text-[10px] text-slate-500">batugudek1@gmail.com • Sistem Yöneticisi</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-blue-700 flex items-center gap-1">
                    Doğrudan Giriş <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 2. CUSTOMER / BAYI PANEL */}
          {/* ========================================================================= */}
          {activePortal === 'customer' && (
            <div className="space-y-4">
              {/* Customer Sub-tabs: Login / Register */}
              <div className="flex border-b border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setCustomerTab('login');
                    setErrorMessage(null);
                  }}
                  className={`pb-2 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                    customerTab === 'login'
                      ? 'border-[#006194] text-[#006194]'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Giriş Yap
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCustomerTab('register');
                    setErrorMessage(null);
                  }}
                  className={`pb-2 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                    customerTab === 'register'
                      ? 'border-[#006194] text-[#006194]'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Kayıt Ol (Yeni Bayi & Şirket)
                </button>
              </div>

              {/* Sub-tab 1: Customer Login */}
              {customerTab === 'login' && (
                <div className="space-y-4">
                  <form onSubmit={handleCustomerSubmit} className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-[#3f4850] mb-1">
                        Kullanıcı Adı veya E-posta
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-[#707881] absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={customerIdentifier}
                          onChange={(e) => setCustomerIdentifier(e.target.value)}
                          placeholder="Örn: ayseyilmaz veya velikaya"
                          className="w-full h-10 pl-10 pr-3 rounded-xl border border-[#bfc7d2] bg-white text-xs text-[#0b1c30] placeholder:text-[#9aa4b2] focus:outline-none focus:border-[#006194] focus:ring-2 focus:ring-[#006194]/10 transition-all font-medium"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#3f4850] mb-1">
                        Şifre
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-[#707881] absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type={showCustomerPassword ? 'text' : 'password'}
                          required
                          value={customerPassword}
                          onChange={(e) => setCustomerPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full h-10 pl-10 pr-10 rounded-xl border border-[#bfc7d2] bg-white text-xs text-[#0b1c30] placeholder:text-[#9aa4b2] focus:outline-none focus:border-[#006194] focus:ring-2 focus:ring-[#006194]/10 transition-all font-medium"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCustomerPassword(!showCustomerPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#707881] hover:text-[#0b1c30] p-0.5"
                        >
                          {showCustomerPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-11 rounded-xl bg-slate-800 hover:bg-slate-900 active:scale-[0.99] text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isLoading ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>Müşteri / Bayi Girişi Yap</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>


                </div>
              )}

              {/* Sub-tab 2: Customer Registration with Company */}
              {customerTab === 'register' && (
                <form onSubmit={handleRegisterSubmit} className="space-y-3">
                  <div className="p-2.5 bg-blue-50 border border-blue-100 rounded-xl text-blue-900 text-[11px]">
                    <strong>1-N Şirket Kuralı:</strong> Bir şirket birden fazla çalışana sahip olabilir, ancak her
                    çalışan sisteme tek bir şirket üzerinden kayıt edilir.
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Ad (Yalnızca Harf) *</label>
                      <input
                        type="text"
                        required
                        value={regFirstName}
                        onChange={(e) => setRegFirstName(e.target.value.replace(/[^a-zA-ZçÇğĞıİöÖşŞüÜ\s]/g, ''))}
                        placeholder="Örn: Selin"
                        className="w-full h-9 px-3 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Soyad (Yalnızca Harf) *</label>
                      <input
                        type="text"
                        required
                        value={regLastName}
                        onChange={(e) => setRegLastName(e.target.value.replace(/[^a-zA-ZçÇğĞıİöÖşŞüÜ\s]/g, ''))}
                        placeholder="Örn: Demir"
                        className="w-full h-9 px-3 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">E-posta *</label>
                      <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="selin@firma.com"
                        className="w-full h-9 px-3 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Telefon (Maks. 11 Hane)</label>
                      <input
                        type="tel"
                        inputMode="numeric"
                        maxLength={11}
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                        placeholder="05XXXXXXXXX"
                        className="w-full h-9 px-3 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-blue-500 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Kullanıcı Adı *</label>
                      <input
                        type="text"
                        required
                        value={regUsername}
                        onChange={(e) => setRegUsername(e.target.value)}
                        placeholder="selindemir"
                        className="w-full h-9 px-3 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Şifre</label>
                      <input
                        type="password"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Password123*"
                        className="w-full h-9 px-3 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Company Selection / Creation */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-blue-600" />
                        Bağlı Bulunulan Şirket *
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsCreatingNewCompany(!isCreatingNewCompany)}
                        className="text-[11px] font-semibold text-blue-600 hover:underline cursor-pointer"
                      >
                        {isCreatingNewCompany ? 'Mevcut Şirketlerden Seç' : '+ Yeni Şirket Ekle'}
                      </button>
                    </div>

                    {!isCreatingNewCompany ? (
                      <div>
                        <select
                          value={regCompanyId}
                          onChange={(e) => setRegCompanyId(e.target.value)}
                          className="w-full h-9 px-2.5 rounded-lg border border-slate-300 bg-white text-xs focus:outline-none focus:border-blue-500 font-medium"
                        >
                          {companies.map((c) => (
                            <option key={c.id} value={c.id}>
                              [{c.id}] {c.name} ({c.city})
                            </option>
                          ))}
                        </select>
                        <p className="text-[10px] text-slate-500 mt-1">
                          Kullanıcınız bu şirketin çalışanı olarak eşleştirilecektir.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2 pt-1">
                        <input
                          type="text"
                          required
                          value={newCompanyName}
                          onChange={(e) => setNewCompanyName(e.target.value)}
                          placeholder="Yeni Şirket Ünvanı (Örn: Boğaziçi Tekstil A.Ş.)"
                          className="w-full h-9 px-3 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-blue-500 bg-white"
                        />
                        <input
                          type="text"
                          value={newCompanyCity}
                          onChange={(e) => setNewCompanyCity(e.target.value.replace(/[^a-zA-ZçÇğĞıİöÖşŞüÜ\s]/g, ''))}
                          placeholder="Şehir (Yalnızca Harf, Örn: İstanbul / Kayseri)"
                          className="w-full h-9 px-3 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-blue-500 bg-white"
                        />
                        <p className="text-[10px] text-slate-500">
                          Sistem yeni şirket için otomatik benzersiz COMP-ID üretecektir.
                        </p>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        <span>Kaydı Tamamla ve Sisteme Giriş Yap</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 px-6 border-t border-[#e5eeff] bg-white text-center text-xs text-[#707881] flex flex-col sm:flex-row items-center justify-center gap-3">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-[#00685f]" />
          <span>256-Bit SSL Güvenli B2B Oturumu</span>
        </div>
        <span className="hidden sm:inline text-gray-300">•</span>
        <span>© 2026 Stokk Tekstil San. ve Tic. A.Ş. Tüm Hakları Saklıdır.</span>
      </footer>
    </div>
  );
};
