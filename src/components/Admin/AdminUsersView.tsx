import React, { useState } from 'react';
import {
  Search,
  Trash2,
  Edit,
  Plus,
  Eye,
  EyeOff,
  UserCheck,
  Building,
  KeyRound,
  Shield,
  X,
  CheckCircle2
} from 'lucide-react';
import { Customer, Company } from '../../types';
import { userService } from '../../services/userService';
import { companyService } from '../../services/companyService';

interface AdminUsersViewProps {
  users?: Customer[];
  companies?: Company[];
  onUsersChanged?: () => void;
}

export const AdminUsersView: React.FC<AdminUsersViewProps> = ({
  users: propUsers,
  companies: propCompanies,
  onUsersChanged,
}) => {
  const [localUsers, setLocalUsers] = useState<Customer[]>(() => propUsers || userService.getUsers());
  const [localCompanies, setLocalCompanies] = useState<Company[]>(() => propCompanies || companyService.getCompanies());
  const [searchTerm, setSearchTerm] = useState('');
  const [showPasswordIds, setShowPasswordIds] = useState<Record<string, boolean>>({});
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Edit User State & Handlers
  const [editingUser, setEditingUser] = useState<Customer | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editCompanyId, setEditCompanyId] = useState('');
  const [editRole, setEditRole] = useState<'Admin' | 'Customer'>('Customer');

  const handleOpenEditModal = (u: Customer) => {
    setEditingUser(u);
    setEditFirstName(u.firstName);
    setEditLastName(u.lastName);
    setEditEmail(u.email);
    setEditPhone(u.phone || '');
    setEditUsername(u.username);
    setEditPassword('');
    setEditCompanyId(u.companyId || companies[0]?.id || 'COMP-001');
    setEditRole((u.role as 'Admin' | 'Customer') || 'Customer');
    setIsEditModalOpen(true);
  };

  const handleSaveEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    const targetCompany = companies.find((c) => c.id === editCompanyId);
    const updated: Customer = {
      ...editingUser,
      firstName: editFirstName.trim(),
      lastName: editLastName.trim(),
      email: editEmail.trim(),
      phone: editPhone.trim(),
      username: editUsername.trim(),
      password: editPassword.trim() ? editPassword.trim() : editingUser.password,
      companyId: editCompanyId,
      companyName: targetCompany ? targetCompany.name : editingUser.companyName,
      role: editRole,
    };
    userService.updateUser(updated);
    showToast(`'${updated.firstName} ${updated.lastName}' kullanıcı bilgileri başarıyla güncellendi.`);
    setIsEditModalOpen(false);
    setEditingUser(null);
    reloadData();
  };

  const users = propUsers || localUsers;
  const companies = propCompanies || localCompanies;

  const reloadData = () => {
    setLocalUsers(userService.getUsers());
    setLocalCompanies(companyService.getCompanies());
    if (onUsersChanged) onUsersChanged();
  };

  // Form
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedCompanyId, setSelectedCompanyId] = useState(companies[0]?.id || 'COMP-001');
  const [isNewCompany, setIsNewCompany] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newCompanyTax, setNewCompanyTax] = useState('');

  const togglePasswordVisibility = (id: string) => {
    setShowPasswordIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleDeleteUser = (id: string, name: string) => {
    if (id === 'cust-1') {
      alert('Sistem yöneticisi (Batu Güdek) hesabı silinemez!');
      return;
    }
    if (window.confirm(`'${name}' kullanıcısını silmek istediğinize emin misiniz?`)) {
      userService.deleteUser(id);
      showToast(`'${name}' kullanıcısı sistemden silindi.`);
      reloadData();
    }
  };

  const handleRegisterUser = (e: React.FormEvent) => {
    e.preventDefault();
    let companyIdToUse = selectedCompanyId;
    let companyNameToUse = companies.find((c) => c.id === selectedCompanyId)?.name || '';

    if (isNewCompany) {
      if (!newCompanyName.trim()) {
        alert('Lütfen şirket adını giriniz.');
        return;
      }
      const createdComp = companyService.createCompany({
        name: newCompanyName.trim(),
        taxNumber: newCompanyTax.trim(),
      });
      companyIdToUse = createdComp.id;
      companyNameToUse = createdComp.name;
    }

    const res = userService.registerCustomer({
      firstName,
      lastName,
      email,
      phone,
      username,
      password: password || 'Password123*',
      companyId: companyIdToUse,
      companyName: companyNameToUse,
    });

    if (!res.success) {
      alert(res.error);
      return;
    }

    showToast(`${firstName} ${lastName} kullanıcısı başarıyla kaydedildi.`);
    setIsAddModalOpen(false);
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhone('');
    setUsername('');
    setPassword('');
    setIsNewCompany(false);
    reloadData();
  };

  const filtered = users.filter((u) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      u.firstName.toLowerCase().includes(q) ||
      u.lastName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      u.id.toLowerCase().includes(q) ||
      (u.companyName && u.companyName.toLowerCase().includes(q))
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
              Kullanıcı Yönetimi
            </h1>
          </div>
          <p className="text-xs text-[#565e74] mt-1">
            Sistemde kayıtlı tüm kullanıcıların ad, soyad, e-posta, telefon, kullanıcı ID, şifreli parola ve şirket bağlantıları.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-[#006194] hover:bg-[#007bb9] text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni Kullanıcı Ekle</span>
        </button>
      </div>

      {toastMessage && (
        <div className="p-3 bg-[#e6f4ea] border border-[#00685f]/30 rounded-xl text-xs font-semibold text-[#00685f] flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Search */}
      <div className="bg-white p-3 rounded-2xl border border-[#e5eeff] flex items-center gap-2">
        <Search className="w-4 h-4 text-[#707881]" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Ad, Soyad, E-posta, Kullanıcı ID veya Şirket adı ara..."
          className="w-full h-8 px-2 bg-[#eff4ff] rounded-lg text-xs text-[#0b1c30] placeholder:text-[#707881] focus:outline-none focus:bg-white focus:border-[#006194]"
        />
        {searchTerm && (
          <button type="button" onClick={() => setSearchTerm('')} className="text-[#707881]">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Users Table: Ad, Soyad, E-posta, Telefon, Kullanıcı ID, Şifre (Şifreli biçimde) */}
      <div className="bg-white rounded-2xl border border-[#e5eeff] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#eff4ff] border-b border-[#dce9ff] text-[#565e74] text-[11px] uppercase tracking-wider font-bold">
                <th className="py-3 px-4">Kullanıcı ID</th>
                <th className="py-3 px-4">Ad Soyad</th>
                <th className="py-3 px-4">E-posta</th>
                <th className="py-3 px-4">Telefon</th>
                <th className="py-3 px-4">Kullanıcı Adı</th>
                <th className="py-3 px-4">Şifre (Şifreli Biçimde)</th>
                <th className="py-3 px-4">Şirket (1-N)</th>
                <th className="py-3 px-4 text-center">Rol</th>
                <th className="py-3 px-4 text-center">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9] text-[#0b1c30]">
              {filtered.map((u) => {
                const isPasswordVisible = showPasswordIds[u.id];
                const rawPassword = u.password || 'Password123*';
                const maskedPassword = '••••••••••••';

                return (
                  <tr key={u.id} className="hover:bg-[#eff4ff]/40 transition-colors">
                    {/* Kullanıcı ID */}
                    <td className="py-3.5 px-4 font-mono font-bold text-xs text-[#006194]">
                      {u.id}
                    </td>

                    {/* Ad Soyad */}
                    <td className="py-3.5 px-4 font-bold text-[#0b1c30]">
                      {u.firstName} {u.lastName}
                    </td>

                    {/* E-posta */}
                    <td className="py-3.5 px-4 text-[#565e74]">
                      {u.email}
                    </td>

                    {/* Telefon */}
                    <td className="py-3.5 px-4 font-mono text-xs text-[#0b1c30]">
                      {u.phone}
                    </td>

                    {/* Kullanıcı Adı */}
                    <td className="py-3.5 px-4 font-mono font-semibold text-[#006194]">
                      @{u.username}
                    </td>

                    {/* Şifre (Şifreli Biçimde) */}
                    <td className="py-3.5 px-4">
                      <div className="inline-flex items-center gap-2 bg-[#f8f9ff] px-2.5 py-1 rounded-lg border border-[#e5eeff]">
                        <span className="font-mono text-xs text-[#3f4850] select-none">
                          {isPasswordVisible ? rawPassword : maskedPassword}
                        </span>
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility(u.id)}
                          className="text-[#707881] hover:text-[#006194] transition-colors p-0.5"
                          title={isPasswordVisible ? 'Şifreyi Gizle' : 'Şifreyi Göster'}
                        >
                          {isPasswordVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>

                    {/* Şirket Bilgisi */}
                    <td className="py-3.5 px-4">
                      <div>
                        <span className="font-semibold text-[#0b1c30] block">{u.companyName || 'Şirket Yok'}</span>
                        <span className="font-mono text-[10px] text-[#707881] block">
                          ID: {u.companyId || '-'}
                        </span>
                      </div>
                    </td>

                    {/* Rol */}
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          u.role === 'Admin'
                            ? 'bg-[#dce9ff] text-[#006194]'
                            : 'bg-[#e6f4ea] text-[#00685f]'
                        }`}
                      >
                        {u.role === 'Admin' ? 'Yönetici' : 'Müşteri'}
                      </span>
                    </td>

                    {/* İşlem */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(u)}
                          className="p-1.5 rounded-lg text-[#006194] hover:bg-[#eff4ff] transition-colors cursor-pointer"
                          title="Kullanıcı Bilgilerini Düzenle"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {u.id !== 'cust-1' && (
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(u.id, `${u.firstName} ${u.lastName}`)}
                            className="p-1.5 rounded-lg text-[#ba1a1a] hover:bg-[#ffdad6] transition-colors cursor-pointer"
                            title="Kullanıcıyı Sil"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* YENİ KULLANICI EKLEME MODALI */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-xl rounded-3xl border border-[#dce9ff] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 bg-[#eff4ff] border-b border-[#dce9ff] flex items-center justify-between">
              <h2 className="font-heading text-base font-bold text-[#0b1c30]">
                Yeni Kullanıcı / Müşteri Ekle
              </h2>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-[#565e74] hover:bg-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterUser} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#0b1c30] block mb-1">Ad *</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value.replace(/[^a-zA-ZçÇğĞıİöÖşŞüÜ\s]/g, ''))}
                    placeholder="örn: Can"
                    className="w-full h-9 px-3 bg-[#eff4ff] border border-[#dce9ff] rounded-xl focus:bg-white focus:outline-none focus:border-[#006194]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#0b1c30] block mb-1">Soyad (Yalnızca Harf) *</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value.replace(/[^a-zA-ZçÇğĞıİöÖşŞüÜ\s]/g, ''))}
                    placeholder="örn: Yılmaz"
                    className="w-full h-9 px-3 bg-[#eff4ff] border border-[#dce9ff] rounded-xl focus:bg-white focus:outline-none focus:border-[#006194]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#0b1c30] block mb-1">E-posta *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ornek@sirket.com"
                    className="w-full h-9 px-3 bg-[#eff4ff] border border-[#dce9ff] rounded-xl focus:bg-white focus:outline-none focus:border-[#006194]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#0b1c30] block mb-1">Telefon (Maks. 11 Hane) *</label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={11}
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                    placeholder="05XXXXXXXXX"
                    className="w-full h-9 px-3 bg-[#eff4ff] border border-[#dce9ff] rounded-xl font-mono focus:bg-white focus:outline-none focus:border-[#006194]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#0b1c30] block mb-1">Kullanıcı Adı *</label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="canyilmaz"
                    className="w-full h-9 px-3 bg-[#eff4ff] border border-[#dce9ff] rounded-xl font-mono focus:bg-white focus:outline-none focus:border-[#006194]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#0b1c30] block mb-1">Giriş Şifresi *</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-9 px-3 bg-[#eff4ff] border border-[#dce9ff] rounded-xl font-mono focus:bg-white focus:outline-none focus:border-[#006194]"
                  />
                </div>
              </div>

              {/* Şirket Seçimi (1-N İlişki) */}
              <div className="p-3 bg-[#eff4ff]/60 border border-[#dce9ff] rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-[#0b1c30]">Bağlı Olduğu Şirket (1-N Kuralı):</label>
                  <button
                    type="button"
                    onClick={() => setIsNewCompany(!isNewCompany)}
                    className="text-[11px] font-bold text-[#006194] hover:underline"
                  >
                    {isNewCompany ? 'Mevcut Şirketlerden Seç' : '+ Yeni Şirket Tanımla'}
                  </button>
                </div>

                {isNewCompany ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Yeni Şirket Adı (örn: Zirve Tekstil A.Ş.)"
                      value={newCompanyName}
                      onChange={(e) => setNewCompanyName(e.target.value)}
                      className="w-full h-9 px-3 bg-white border border-[#dce9ff] rounded-xl"
                    />
                    <input
                      type="text"
                      placeholder="Vergi Numarası"
                      value={newCompanyTax}
                      onChange={(e) => setNewCompanyTax(e.target.value)}
                      className="w-full h-9 px-3 bg-white border border-[#dce9ff] rounded-xl font-mono"
                    />
                  </div>
                ) : (
                  <select
                    value={selectedCompanyId}
                    onChange={(e) => setSelectedCompanyId(e.target.value)}
                    className="w-full h-9 px-3 bg-white border border-[#dce9ff] rounded-xl font-medium"
                  >
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} (ID: {c.id})
                      </option>
                    ))}
                  </select>
                )}
                <p className="text-[10px] text-[#707881]">
                  * Bir çalışanın yalnızca bir şirketi olabilir; bir şirketin ise birden fazla çalışanı olabilir.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-[#565e74] hover:bg-[#eff4ff]"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#006194] hover:bg-[#007bb9] text-white font-bold"
                >
                  Kullanıcıyı Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* KULLANICI DÜZENLEME MODALI */}
      {isEditModalOpen && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-xl rounded-3xl border border-[#dce9ff] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 bg-[#eff4ff] border-b border-[#dce9ff] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#006194] block">
                  KULLANICI DÜZENLEME ({editingUser.id})
                </span>
                <h2 className="font-heading text-base font-bold text-[#0b1c30]">
                  {editingUser.firstName} {editingUser.lastName} Detaylarını Güncelle
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingUser(null);
                }}
                className="p-1.5 rounded-lg text-[#565e74] hover:bg-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditUser} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#0b1c30] block mb-1">Ad *</label>
                  <input
                    type="text"
                    required
                    value={editFirstName}
                    onChange={(e) => setEditFirstName(e.target.value.replace(/[^a-zA-ZçÇğĞıİöÖşŞüÜ\s]/g, ''))}
                    className="w-full h-9 px-3 bg-[#eff4ff] border border-[#dce9ff] rounded-xl focus:bg-white focus:outline-none focus:border-[#006194]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#0b1c30] block mb-1">Soyad *</label>
                  <input
                    type="text"
                    required
                    value={editLastName}
                    onChange={(e) => setEditLastName(e.target.value.replace(/[^a-zA-ZçÇğĞıİöÖşŞüÜ\s]/g, ''))}
                    className="w-full h-9 px-3 bg-[#eff4ff] border border-[#dce9ff] rounded-xl focus:bg-white focus:outline-none focus:border-[#006194]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#0b1c30] block mb-1">E-posta *</label>
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full h-9 px-3 bg-[#eff4ff] border border-[#dce9ff] rounded-xl focus:bg-white focus:outline-none focus:border-[#006194]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#0b1c30] block mb-1">Telefon *</label>
                  <input
                    type="text"
                    required
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full h-9 px-3 bg-[#eff4ff] border border-[#dce9ff] rounded-xl font-mono focus:bg-white focus:outline-none focus:border-[#006194]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#0b1c30] block mb-1">Kullanıcı Adı *</label>
                  <input
                    type="text"
                    required
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    className="w-full h-9 px-3 bg-[#eff4ff] border border-[#dce9ff] rounded-xl font-mono focus:bg-white focus:outline-none focus:border-[#006194]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#0b1c30] block mb-1">Yeni Şifre (Değişmeyecekse Boş Bırakın)</label>
                  <input
                    type="password"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    placeholder="Mevcut şifre korunur"
                    className="w-full h-9 px-3 bg-[#eff4ff] border border-[#dce9ff] rounded-xl font-mono focus:bg-white focus:outline-none focus:border-[#006194]"
                  />
                </div>
              </div>

              {/* Şirket ve Rol Seçimi */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#0b1c30] block mb-1">Bağlı Olduğu Şirket</label>
                  <select
                    value={editCompanyId}
                    onChange={(e) => setEditCompanyId(e.target.value)}
                    className="w-full h-9 px-3 bg-white border border-[#dce9ff] rounded-xl font-medium focus:outline-none focus:border-[#006194]"
                  >
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.id})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-[#0b1c30] block mb-1">Sistem Rolü</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as 'Admin' | 'Customer')}
                    disabled={editingUser.id === 'cust-1'}
                    className="w-full h-9 px-3 bg-white border border-[#dce9ff] rounded-xl font-medium focus:outline-none focus:border-[#006194] disabled:bg-gray-100"
                  >
                    <option value="Customer">Müşteri / Bayi</option>
                    <option value="Admin">Sistem Yöneticisi</option>
                  </select>
                  {editingUser.id === 'cust-1' && (
                    <p className="text-[10px] text-[#707881] mt-0.5">
                      * Ana yönetici hesabı rolü değiştirilemez.
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#f1f5f9]">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingUser(null);
                  }}
                  className="px-4 py-2 rounded-xl text-[#565e74] hover:bg-[#eff4ff] cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#006194] hover:bg-[#007bb9] text-white font-bold cursor-pointer"
                >
                  Değişiklikleri Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
