import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Phone,
  Mail,
  User,
  Key,
  Shield,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  MapPin,
  ShoppingBag,
  CreditCard,
  Edit2,
  Trash2,
  X
} from 'lucide-react';
import { Customer } from '../../types';

interface CustomersManagementProps {
  customers: Customer[];
  onAddCustomer: (newCustomer: Customer) => void;
  onUpdateCustomer: (updated: Customer) => void;
  onDeleteCustomer: (id: string) => void;
  onSelectCustomerAsActive?: (customer: Customer) => void;
}

export const CustomersManagement: React.FC<CustomersManagementProps> = ({
  customers,
  onAddCustomer,
  onUpdateCustomer,
  onDeleteCustomer,
  onSelectCustomerAsActive
}) => {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [showPasswordMap, setShowPasswordMap] = useState<Record<string, boolean>>({});

  // Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [city, setCity] = useState('Kayseri');
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState<'Aktif' | 'Pasif' | 'Onay Bekliyor'>('Aktif');

  const openAddModal = () => {
    setEditingCustomer(null);
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhone('');
    setUsername('');
    setPassword('');
    setCity('Kayseri');
    setAddress('');
    setStatus('Aktif');
    setIsModalOpen(true);
  };

  const openEditModal = (cust: Customer) => {
    setEditingCustomer(cust);
    setFirstName(cust.firstName);
    setLastName(cust.lastName);
    setEmail(cust.email);
    setPhone(cust.phone);
    setUsername(cust.username);
    setPassword(cust.password || '');
    setCity(cust.city || 'Kayseri');
    setAddress(cust.address || '');
    setStatus(cust.status);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !username) {
      alert('Lütfen zorunlu alanları (Ad, Soyad, E-posta, Kullanıcı Adı) doldurunuz.');
      return;
    }

    if (editingCustomer) {
      const updated: Customer = {
        ...editingCustomer,
        firstName,
        lastName,
        email,
        phone,
        username,
        password: password || editingCustomer.password,
        city,
        address,
        status,
      };
      onUpdateCustomer(updated);
    } else {
      const newCust: Customer = {
        id: `cust-${Date.now()}`,
        firstName,
        lastName,
        email,
        phone,
        username,
        password: password || 'Password123*',
        city,
        address,
        totalOrders: 0,
        totalSpent: 0,
        status,
        createdAt: new Date().toLocaleDateString('tr-TR'),
      };
      onAddCustomer(newCust);
    }

    setIsModalOpen(false);
  };

  const toggleShowPassword = (id: string) => {
    setShowPasswordMap((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const filtered = customers.filter(
    (c) =>
      c.firstName.toLowerCase().includes(search.toLowerCase()) ||
      c.lastName.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.username.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  return (
    <div className="p-4 sm:p-6 max-w-[1600px] w-full mx-auto space-y-6">
      {/* Top Header Card */}
      <div className="bg-white p-5 rounded-2xl border border-[#e5eeff] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#eff4ff] text-[#006194]">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-heading text-xl font-bold text-[#0b1c30] tracking-tight">
                Müşteri Yönetimi & E-Ticaret Üyeleri
              </h1>
              <p className="text-xs text-[#565e74]">
                Kayıtlı e-ticaret müşterileri: Ad, Soyad, E-posta, Telefon, Kullanıcı Adı ve Şifre bilgileri
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="px-4 py-2.5 rounded-xl bg-[#006194] hover:bg-[#007bb9] text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni Müşteri Kaydet</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-[#e5eeff] shadow-xs">
          <span className="text-[11px] text-[#707881] font-medium">Toplam Müşteri</span>
          <p className="font-heading text-2xl font-bold text-[#0b1c30] mt-1">{customers.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-[#e5eeff] shadow-xs">
          <span className="text-[11px] text-[#707881] font-medium">Aktif Müşteriler</span>
          <p className="font-heading text-2xl font-bold text-emerald-600 mt-1">
            {customers.filter((c) => c.status === 'Aktif').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-[#e5eeff] shadow-xs">
          <span className="text-[11px] text-[#707881] font-medium">Toplam E-Ticaret Siparişi</span>
          <p className="font-heading text-2xl font-bold text-[#006194] mt-1">
            {customers.reduce((sum, c) => sum + c.totalOrders, 0)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-[#e5eeff] shadow-xs">
          <span className="text-[11px] text-[#707881] font-medium">Toplam Alışveriş Tutarı</span>
          <p className="font-heading text-2xl font-bold text-[#0b1c30] mt-1">
            ₺{customers.reduce((sum, c) => sum + c.totalSpent, 0).toLocaleString('tr-TR')}
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-3 rounded-xl border border-[#e5eeff] flex items-center gap-3">
        <Search className="w-4 h-4 text-[#707881] ml-1" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Ad, soyad, e-posta, kullanıcı adı veya telefon numarası ile ara..."
          className="w-full h-9 px-3 bg-[#eff4ff] rounded-lg text-xs text-[#0b1c30] placeholder:text-[#707881] focus:outline-none focus:bg-white border border-transparent focus:border-[#006194] transition-all"
        />
        <span className="text-xs text-[#707881] whitespace-nowrap pr-2">
          {filtered.length} müşteri listeleniyor
        </span>
      </div>

      {/* Customers Table / Grid */}
      <div className="bg-white rounded-2xl border border-[#e5eeff] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f8fafc] border-b border-[#e5eeff] text-[11px] font-bold text-[#565e74] uppercase tracking-wider">
                <th className="py-3 px-4">Müşteri Ad Soyad</th>
                <th className="py-3 px-4">Kullanıcı Adı</th>
                <th className="py-3 px-4">İletişim (E-Posta & Tel)</th>
                <th className="py-3 px-4">Şifre Bilgisi</th>
                <th className="py-3 px-4">Şehir / Adres</th>
                <th className="py-3 px-4 text-center">Sipariş & Harcama</th>
                <th className="py-3 px-4 text-center">Durum</th>
                <th className="py-3 px-4 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9] text-xs">
              {filtered.map((cust) => {
                const isPassVisible = !!showPasswordMap[cust.id];
                return (
                  <tr key={cust.id} className="hover:bg-[#f8fbff] transition-colors">
                    {/* Name */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#e5eeff] text-[#006194] flex items-center justify-center font-bold font-heading text-xs">
                          {cust.firstName.charAt(0)}
                          {cust.lastName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-[#0b1c30]">
                            {cust.firstName} {cust.lastName}
                          </p>
                          <span className="text-[10px] text-[#707881]">Kayıt: {cust.createdAt}</span>
                        </div>
                      </div>
                    </td>

                    {/* Username */}
                    <td className="py-3 px-4 font-mono font-medium text-[#006194]">
                      @{cust.username}
                    </td>

                    {/* Contact (Email + Phone) */}
                    <td className="py-3 px-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-[#0b1c30]">
                          <Mail className="w-3.5 h-3.5 text-[#707881]" />
                          <span>{cust.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[#565e74] text-[11px]">
                          <Phone className="w-3.5 h-3.5 text-[#707881]" />
                          <span>{cust.phone}</span>
                        </div>
                      </div>
                    </td>

                    {/* Password */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="px-2 py-1 rounded bg-[#f1f5f9] border border-[#e2e8f0] font-mono text-[11px] text-[#0b1c30]">
                          {isPassVisible ? cust.password || '••••••••' : '••••••••'}
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleShowPassword(cust.id)}
                          className="p-1 text-[#707881] hover:text-[#0b1c30] rounded"
                          title={isPassVisible ? 'Şifreyi gizle' : 'Şifreyi göster'}
                        >
                          {isPassVisible ? (
                            <EyeOff className="w-3.5 h-3.5" />
                          ) : (
                            <Eye className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* City & Address */}
                    <td className="py-3 px-4 text-[#565e74] max-w-xs truncate">
                      <div className="flex items-center gap-1 font-medium text-[#0b1c30]">
                        <MapPin className="w-3.5 h-3.5 text-[#006194]" />
                        <span>{cust.city || 'Belirtilmedi'}</span>
                      </div>
                      <span className="text-[10px] text-[#707881] block truncate">
                        {cust.address || 'Kayıtlı teslimat adresi yok'}
                      </span>
                    </td>

                    {/* Orders & Spent */}
                    <td className="py-3 px-4 text-center">
                      <span className="font-bold text-[#0b1c30] block">
                        {cust.totalOrders} Sipariş
                      </span>
                      <span className="text-[11px] font-semibold text-[#006194]">
                        ₺{cust.totalSpent.toLocaleString('tr-TR')}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          cust.status === 'Aktif'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : cust.status === 'Onay Bekliyor'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {cust.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(cust)}
                          title="Bilgileri Düzenle"
                          className="p-1.5 rounded-lg hover:bg-[#eff4ff] text-[#006194] transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`${cust.firstName} ${cust.lastName} adlı müşteriyi silmek istiyor musunuz?`)) {
                              onDeleteCustomer(cust.id);
                            }
                          }}
                          title="Müşteriyi Sil"
                          className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[#707881] text-xs">
                    Aradığınız kriterlere uygun müşteri kaydı bulunamadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-[#dce9ff] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-[#e5eeff] flex items-center justify-between bg-[#f8fbff]">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-[#006194] text-white">
                  <User className="w-4 h-4" />
                </div>
                <h3 className="font-heading font-bold text-sm text-[#0b1c30]">
                  {editingCustomer ? 'Müşteri Bilgilerini Güncelle' : 'Yeni E-Ticaret Müşterisi Tanımla'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-[#707881] hover:text-[#0b1c30] rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#3f4850] mb-1">
                    Ad *
                  </label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Örn: Batu"
                    className="w-full h-9 px-3 rounded-xl border border-[#bfc7d2] bg-white focus:outline-none focus:border-[#006194]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#3f4850] mb-1">
                    Soyad *
                  </label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Örn: Güdek"
                    className="w-full h-9 px-3 rounded-xl border border-[#bfc7d2] bg-white focus:outline-none focus:border-[#006194]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#3f4850] mb-1">
                    Kullanıcı Adı *
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase())}
                    placeholder="Örn: batugudek"
                    className="w-full h-9 px-3 rounded-xl border border-[#bfc7d2] bg-white focus:outline-none focus:border-[#006194] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#3f4850] mb-1">
                    Şifre *
                  </label>
                  <input
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={editingCustomer ? 'Değiştirmek istemiyorsanız boş bırakın' : 'Örn: Password123*'}
                    className="w-full h-9 px-3 rounded-xl border border-[#bfc7d2] bg-white focus:outline-none focus:border-[#006194] font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#3f4850] mb-1">
                    E-Posta Adresi *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ornek@domain.com"
                    className="w-full h-9 px-3 rounded-xl border border-[#bfc7d2] bg-white focus:outline-none focus:border-[#006194]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#3f4850] mb-1">
                    Telefon Numarası
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+90 (5xx) xxx xx xx"
                    className="w-full h-9 px-3 rounded-xl border border-[#bfc7d2] bg-white focus:outline-none focus:border-[#006194]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#3f4850] mb-1">
                    Şehir
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Örn: Kayseri"
                    className="w-full h-9 px-3 rounded-xl border border-[#bfc7d2] bg-white focus:outline-none focus:border-[#006194]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#3f4850] mb-1">
                    Hesap Durumu
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full h-9 px-3 rounded-xl border border-[#bfc7d2] bg-white focus:outline-none focus:border-[#006194]"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Onay Bekliyor">Onay Bekliyor</option>
                    <option value="Pasif">Pasif</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#3f4850] mb-1">
                  Teslimat / Fatura Adresi
                </label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Cadde, sokak, daire no, ilçe..."
                  className="w-full p-2.5 rounded-xl border border-[#bfc7d2] bg-white focus:outline-none focus:border-[#006194]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#e5eeff]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#565e74] hover:bg-[#eff4ff]"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#006194] hover:bg-[#007bb9] text-white text-xs font-bold transition-all shadow-sm"
                >
                  {editingCustomer ? 'Değişiklikleri Kaydet' : 'Müşteriyi Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
