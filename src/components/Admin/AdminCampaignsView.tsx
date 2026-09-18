import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  Image as ImageIcon,
  Tag,
  Eye,
  EyeOff,
  ExternalLink,
  DollarSign
} from 'lucide-react';
import { CampaignSlide } from '../../types';
import { campaignService } from '../../services/campaignService';

export const AdminCampaignsView: React.FC = () => {
  const [campaigns, setCampaigns] = useState<CampaignSlide[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<CampaignSlide | null>(null);

  // Form state
  const [formData, setFormData] = useState<Omit<CampaignSlide, 'id'>>({
    title: '',
    subtitle: '',
    description: '',
    badge: '%20 İNDİRİM',
    badgeType: 'discount',
    productId: '',
    productCode: '',
    image: '',
    originalPrice: 0,
    discountedPrice: 0,
    discountPercent: 20,
    minOrderQty: 1,
    availableStock: 50,
    validUntil: '',
    actionLabel: 'Hemen İncele',
    isActive: true,
  });

  const loadCampaigns = () => {
    setCampaigns(campaignService.getCampaigns());
  };

  useEffect(() => {
    loadCampaigns();
  }, []);

  const handleOpenAddModal = () => {
    setEditingCampaign(null);
    setFormData({
      title: '',
      subtitle: '',
      description: '',
      badge: 'YENİ FIRSAT',
      badgeType: 'campaign',
      productId: '',
      productCode: '',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=60',
      originalPrice: 1000,
      discountedPrice: 800,
      discountPercent: 20,
      minOrderQty: 1,
      availableStock: 25,
      validUntil: 'Son Gün 30 Eylül',
      actionLabel: 'Hemen Sipariş Ver',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (camp: CampaignSlide) => {
    setEditingCampaign(camp);
    setFormData({
      title: camp.title,
      subtitle: camp.subtitle,
      description: camp.description,
      badge: camp.badge,
      badgeType: camp.badgeType,
      productId: camp.productId,
      productCode: camp.productCode,
      image: camp.image,
      originalPrice: camp.originalPrice,
      discountedPrice: camp.discountedPrice,
      discountPercent: camp.discountPercent,
      minOrderQty: camp.minOrderQty,
      availableStock: camp.availableStock,
      validUntil: camp.validUntil,
      actionLabel: camp.actionLabel,
      isActive: camp.isActive !== undefined ? camp.isActive : true,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Bu slider reklamını/kampanyayı silmek istediğinizden emin misiniz?')) {
      campaignService.deleteCampaign(id);
      loadCampaigns();
    }
  };

  const handleToggle = (id: string) => {
    campaignService.toggleCampaign(id);
    loadCampaigns();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.image) {
      alert('Lütfen başlık ve görsel alanlarını doldurunuz.');
      return;
    }

    if (editingCampaign) {
      campaignService.updateCampaign({
        ...formData,
        id: editingCampaign.id,
      });
    } else {
      campaignService.addCampaign(formData);
    }

    setIsModalOpen(false);
    loadCampaigns();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-tr from-amber-500 to-orange-500 text-white rounded-xl shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Slider & Kampanya Reklam Yönetimi</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Müşteri ana sayfasındaki kayan slider vitrininde gösterilen promosyonları ve duyuruları yönetin.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Yeni Reklam / Kampanya Ekle
        </button>
      </div>

      {/* Campaign Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.map((camp) => (
          <div
            key={camp.id}
            className={`bg-white rounded-2xl border overflow-hidden shadow-sm transition-all hover:shadow-md flex flex-col ${
              camp.isActive === false ? 'border-slate-200 opacity-60' : 'border-blue-100'
            }`}
          >
            {/* Image Preview Banner */}
            <div className="relative h-44 w-full bg-slate-100 overflow-hidden group">
              <img
                src={camp.image}
                alt={camp.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-3 left-3 flex gap-2">
                <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-black/70 text-white backdrop-blur-sm">
                  {camp.badge}
                </span>
                {camp.isActive === false ? (
                  <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-red-600 text-white">
                    Pasif
                  </span>
                ) : (
                  <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-600 text-white">
                    Aktif
                  </span>
                )}
              </div>
              <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-white/85 backdrop-blur-sm rounded text-[11px] font-mono text-slate-700">
                Kod: {camp.productCode || 'GENEL'}
              </div>
            </div>

            {/* Body */}
            <div className="p-5 flex-1 flex flex-col">
              <span className="text-xs font-medium text-blue-600 tracking-wider uppercase mb-1">
                {camp.subtitle}
              </span>
              <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-1 mb-2">
                {camp.title}
              </h3>
              <p className="text-xs text-slate-500 line-clamp-2 mb-4 flex-1">
                {camp.description}
              </p>

              {/* Price Row */}
              <div className="flex items-center justify-between py-2 border-t border-slate-100 mb-4">
                <div>
                  <span className="text-xs text-slate-400 line-through mr-2">
                    ₺{camp.originalPrice?.toLocaleString('tr-TR')}
                  </span>
                  <span className="text-base font-extrabold text-slate-900">
                    ₺{camp.discountedPrice?.toLocaleString('tr-TR')}
                  </span>
                </div>
                <div className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                  %{camp.discountPercent} İndirim
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-2">
                <button
                  onClick={() => handleToggle(camp.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    camp.isActive === false
                      ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                  }`}
                  title={camp.isActive === false ? 'Yayınla' : 'Yayından Kaldır'}
                >
                  {camp.isActive === false ? (
                    <>
                      <Eye className="w-3.5 h-3.5" /> Yayına Al
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3.5 h-3.5" /> Pasife Al
                    </>
                  )}
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEditModal(camp)}
                    className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                    title="Düzenle"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(camp.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {campaigns.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-700">Henüz slider kampanyası eklenmedi</h3>
          <p className="text-sm text-slate-400 mt-1">
            "Yeni Reklam / Kampanya Ekle" butonuna basarak ilk slider duyurunuzu ekleyebilirsiniz.
          </p>
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">
                {editingCampaign ? 'Slider Kampanyasını Düzenle' : 'Yeni Slider Kampanyası / Reklam Ekle'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Başlık (Ürün / Kampanya) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                    placeholder="Örn: Endüstriyel Switch Hub 24 Port"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Alt Başlık / Kategori
                  </label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                    placeholder="Örn: Ağ ve İletişim Ekipmanları"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Açıklama Metni
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                  placeholder="Kampanya detayları ve avantajları..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Rozet / Badge Metni
                  </label>
                  <input
                    type="text"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                    placeholder="Örn: %25 İNDİRİM"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Rozet Türü
                  </label>
                  <select
                    value={formData.badgeType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        badgeType: e.target.value as 'discount' | 'campaign' | 'new' | 'flash',
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                  >
                    <option value="discount">İndirim (discount)</option>
                    <option value="campaign">Kampanya (campaign)</option>
                    <option value="flash">Flaş Fırsat (flash)</option>
                    <option value="new">Yeni Ürün (new)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    İlişkili Ürün Kodu
                  </label>
                  <input
                    type="text"
                    value={formData.productCode}
                    onChange={(e) => setFormData({ ...formData, productCode: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                    placeholder="Örn: SW-24P-POE"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Görsel URL Adresi *
                </label>
                <input
                  type="url"
                  required
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                  placeholder="https://..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Normal Fiyat (₺)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.originalPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, originalPrice: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    İndirimli Fiyat (₺)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.discountedPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, discountedPrice: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    İndirim Oranı (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.discountPercent}
                    onChange={(e) =>
                      setFormData({ ...formData, discountPercent: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Geçerlilik Metni
                  </label>
                  <input
                    type="text"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                    placeholder="Örn: 30 Eylül'e Kadar Geçerli"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Buton Metni
                  </label>
                  <input
                    type="text"
                    value={formData.actionLabel}
                    onChange={(e) => setFormData({ ...formData, actionLabel: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                    placeholder="Örn: Hemen Sipariş Ver"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-slate-700">
                  Slider'da hemen yayına al (Aktif)
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-blue-500/20 cursor-pointer"
                >
                  {editingCampaign ? 'Değişiklikleri Kaydet' : 'Kampanyayı Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
