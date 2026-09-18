import React, { useState } from 'react';
import { Users, Search, Plus, Phone, Building, ArrowUpRight } from 'lucide-react';
import { CustomerAccount } from '../../types';

interface CustomersViewProps {
  customers: CustomerAccount[];
}

export const CustomersView: React.FC<CustomersViewProps> = ({ customers }) => {
  const [search, setSearch] = useState('');

  const filtered = customers.filter(
    (c) =>
      c.companyName.toLowerCase().includes(search.toLowerCase()) ||
      c.city.toLowerCase().includes(search.toLowerCase()) ||
      c.authorizedPerson.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 max-w-[1600px] w-full mx-auto space-y-4">
      <div className="bg-white p-4 rounded-xl border border-[#e5eeff] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          <h2 className="font-heading text-lg font-bold text-[#0b1c30]">
            B2B Bayi & Müşteri Hesapları
          </h2>
          <p className="text-xs text-[#565e74]">
            Yetkili bayiler, cari bakiye durumları, kredi limitleri ve açık siparişler
          </p>
        </div>

        <button
          type="button"
          onClick={() => alert('Yeni cari kart açma penceresi açıldı.')}
          className="px-3.5 py-2 rounded-lg bg-[#006194] hover:bg-[#007bb9] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni Müşteri Ekle</span>
        </button>
      </div>

      <div className="bg-white p-3 rounded-xl border border-[#e5eeff] flex items-center gap-2">
        <Search className="w-4 h-4 text-[#707881]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Bayi adı, şehir veya yetkili kişi ara..."
          className="w-full h-8 px-2 bg-[#eff4ff] rounded-lg text-xs focus:outline-none focus:bg-white border border-transparent focus:border-[#006194]"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((cust) => (
          <div
            key={cust.id}
            className="bg-white p-5 rounded-2xl border border-[#e5eeff] shadow-sm hover:border-[#006194] transition-all space-y-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#006194] tracking-wider">
                  {cust.city} Şubesi / Bayi
                </span>
                <h3 className="font-heading text-sm font-bold text-[#0b1c30] mt-0.5">
                  {cust.companyName}
                </h3>
                <p className="text-xs text-[#565e74] mt-0.5">Yetkili: {cust.authorizedPerson}</p>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-[#dce9ff] text-[#006194] text-[11px] font-bold">
                {cust.openOrderCount} Açık Sipariş
              </span>
            </div>

            <div className="pt-2 border-t border-[#f1f5f9] grid grid-cols-2 gap-3 text-xs">
              <div className="p-2 rounded-xl bg-[#f8f9ff]">
                <span className="text-[10px] text-[#707881] block">Kredi Limiti</span>
                <span className="font-mono font-bold text-[#0b1c30]">
                  ₺{cust.creditLimit.toLocaleString('tr-TR')}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-[#f8f9ff]">
                <span className="text-[10px] text-[#707881] block">Mevcut Borç / Bakiye</span>
                <span className="font-mono font-bold text-[#00685f]">
                  ₺{cust.currentBalance.toLocaleString('tr-TR')}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
