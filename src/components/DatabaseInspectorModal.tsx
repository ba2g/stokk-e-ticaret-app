import React, { useState, useEffect } from 'react';
import {
  Database,
  X,
  RefreshCw,
  Copy,
  Download,
  Search,
  Check,
  Table,
  Code,
  Shield,
  Layers,
  Users,
  ShoppingCart,
  Package,
  FileText,
  Building,
  Activity
} from 'lucide-react';
import { db, STORAGE_KEYS } from '../services/db/database';

interface DatabaseInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TableKey = 'users' | 'orders' | 'products' | 'carts' | 'companies' | 'stockLogs';

export const DatabaseInspectorModal: React.FC<DatabaseInspectorModalProps> = ({ isOpen, onClose }) => {
  const [activeTable, setActiveTable] = useState<TableKey>('orders');
  const [viewMode, setViewMode] = useState<'table' | 'json'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  // Snapshot state
  const [snapshot, setSnapshot] = useState<any>({
    users: [],
    orders: [],
    products: [],
    companies: [],
    userCarts: {},
    stockLogs: {},
  });

  const reloadData = () => {
    const data = db.getAllTablesSnapshot();
    setSnapshot(data);
    setLastRefreshed(new Date());
  };

  useEffect(() => {
    if (isOpen) {
      reloadData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getTableData = (): any[] => {
    switch (activeTable) {
      case 'users':
        return snapshot.users || [];
      case 'orders':
        return snapshot.orders || [];
      case 'products':
        return snapshot.products || [];
      case 'companies':
        return snapshot.companies || [];
      case 'carts':
        return Object.entries(snapshot.userCarts || {}).map(([userId, items]) => ({
          userId,
          itemCount: Array.isArray(items) ? items.length : 0,
          items,
        }));
      case 'stockLogs':
        return Object.entries(snapshot.stockLogs || {}).map(([productId, logs]) => ({
          productId,
          logCount: Array.isArray(logs) ? logs.length : 0,
          logs,
        }));
      default:
        return [];
    }
  };

  const currentData = getTableData();
  const filteredData = currentData.filter((item) => {
    if (!searchQuery.trim()) return true;
    return JSON.stringify(item).toLowerCase().includes(searchQuery.toLowerCase());
  });

  const getStorageKeyName = (table: TableKey) => {
    switch (table) {
      case 'users':
        return STORAGE_KEYS.USERS;
      case 'orders':
        return STORAGE_KEYS.ORDERS;
      case 'products':
        return STORAGE_KEYS.PRODUCTS;
      case 'companies':
        return STORAGE_KEYS.COMPANIES;
      case 'carts':
        return STORAGE_KEYS.USER_CARTS;
      case 'stockLogs':
        return STORAGE_KEYS.STOCK_LOGS;
    }
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(currentData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJson = () => {
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stokk_database_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const tables: { id: TableKey; label: string; icon: React.FC<{ className?: string }>; count: number }[] = [
    { id: 'orders', label: 'Siparişler', icon: FileText, count: (snapshot.orders || []).length },
    { id: 'users', label: 'Kullanıcılar', icon: Users, count: (snapshot.users || []).length },
    { id: 'products', label: 'Ürünler', icon: Package, count: (snapshot.products || []).length },
    { id: 'carts', label: 'Kullanıcı Sepetleri', icon: ShoppingCart, count: Object.keys(snapshot.userCarts || {}).length },
    { id: 'companies', label: 'Şirketler', icon: Building, count: (snapshot.companies || []).length },
    { id: 'stockLogs', label: 'Stok Logları', icon: Activity, count: Object.keys(snapshot.stockLogs || {}).length },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-6xl h-[90vh] rounded-2xl shadow-2xl flex flex-col border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight">Canlı Veritabanı İzleyici (Live DB Inspector)</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  YALNIZCA YÖNETİCİ
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  CANLI
                </span>
              </div>
              <p className="text-xs text-slate-400">
                LocalStorage & Mikroservis Koleksiyonları • Son Güncelleme: {lastRefreshed.toLocaleTimeString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={reloadData}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
              title="Veritabanını Yeniden Oku"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Yenile</span>
            </button>
            <button
              onClick={handleDownloadJson}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow transition-colors cursor-pointer"
              title="Tüm Veritabanını JSON Olarak İndir"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Yedek İndir</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors ml-2 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tip / Instruction Banner */}
        <div className="bg-blue-50 border-b border-blue-100 px-6 py-2.5 flex items-center justify-between text-xs text-blue-900">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              <strong>Tarayıcıdan İzleme İpucu:</strong> Klavyenizden <code>F12</code> tuşuna basıp{' '}
              <strong>Application &gt; Storage &gt; Local Storage &gt; {window.location.origin}</strong> yolundan tüm tabloları izleyebilirsiniz. Ayrıca Konsolda <code>console.table(stokkDb.getOrders())</code> yazabilirsiniz.
            </span>
          </div>
          <span className="text-[11px] font-mono text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
            Key: {getStorageKeyName(activeTable)}
          </span>
        </div>

        {/* Main Content Layout */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Sidebar Tabs */}
          <div className="w-full md:w-64 bg-slate-50 border-r border-slate-200 p-3 space-y-1.5 shrink-0 overflow-y-auto">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
              Veritabanı Tabloları
            </p>
            {tables.map((t) => {
              const Icon = t.icon;
              const isActive = activeTable === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTable(t.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold shadow-sm'
                      : 'text-slate-700 hover:bg-slate-200/70 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                    <span>{t.label}</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {t.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Table / JSON Viewer Area */}
          <div className="flex-1 flex flex-col overflow-hidden bg-white">
            {/* Toolbar */}
            <div className="p-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-white">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Kayıtlarda ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setViewMode('table')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                      viewMode === 'table' ? 'bg-white font-bold text-blue-600 shadow-sm' : 'text-slate-600'
                    }`}
                  >
                    <Table className="w-3.5 h-3.5" />
                    <span>Tablo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('json')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                      viewMode === 'json' ? 'bg-white font-bold text-blue-600 shadow-sm' : 'text-slate-600'
                    }`}
                  >
                    <Code className="w-3.5 h-3.5" />
                    <span>JSON</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleCopyJson}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Görüntülenen Tablo JSON'unu Kopyala"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                  <span>{copied ? 'Kopyalandı' : 'JSON Kopyala'}</span>
                </button>
              </div>
            </div>

            {/* Data View */}
            <div className="flex-1 overflow-auto p-4">
              {filteredData.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
                  <Layers className="w-10 h-10 stroke-1" />
                  <p className="text-xs font-medium">Bu tabloda gösterilecek kayıt bulunamadı.</p>
                </div>
              ) : viewMode === 'json' ? (
                <pre className="p-4 bg-slate-900 text-emerald-400 font-mono text-xs rounded-xl overflow-x-auto shadow-inner">
                  {JSON.stringify(filteredData, null, 2)}
                </pre>
              ) : (
                /* Tabular Formatted Display */
                <div className="border border-slate-200 rounded-xl overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-bold">
                        <th className="p-3 w-12 text-center">#</th>
                        {activeTable === 'orders' && (
                          <>
                            <th className="p-3">Sipariş No</th>
                            <th className="p-3">Kullanıcı</th>
                            <th className="p-3">Tarih</th>
                            <th className="p-3">Ödeme</th>
                            <th className="p-3">Kalemler</th>
                            <th className="p-3">Toplam Tutar</th>
                            <th className="p-3">Durum</th>
                          </>
                        )}
                        {activeTable === 'users' && (
                          <>
                            <th className="p-3">ID</th>
                            <th className="p-3">Kullanıcı Adı</th>
                            <th className="p-3">Ad Soyad</th>
                            <th className="p-3">Şirket</th>
                            <th className="p-3">E-Posta / Tel</th>
                            <th className="p-3">Rol</th>
                          </>
                        )}
                        {activeTable === 'products' && (
                          <>
                            <th className="p-3">Ürün Kodu</th>
                            <th className="p-3">Ürün Adı</th>
                            <th className="p-3">Marka</th>
                            <th className="p-3">Stok</th>
                            <th className="p-3">Kritik Eşik</th>
                            <th className="p-3">Fiyat</th>
                          </>
                        )}
                        {activeTable === 'carts' && (
                          <>
                            <th className="p-3">Kullanıcı ID</th>
                            <th className="p-3">Ürün Çeşidi</th>
                            <th className="p-3">Sepet Detayı (JSON)</th>
                          </>
                        )}
                        {activeTable === 'companies' && (
                          <>
                            <th className="p-3">Şirket ID</th>
                            <th className="p-3">Şirket Ünvanı</th>
                            <th className="p-3">Vergi No</th>
                            <th className="p-3">Şehir</th>
                            <th className="p-3">Çalışan Sayısı</th>
                          </>
                        )}
                        {activeTable === 'stockLogs' && (
                          <>
                            <th className="p-3">Ürün ID</th>
                            <th className="p-3">Log Sayısı</th>
                            <th className="p-3">Son Loglar</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-normal">
                      {filteredData.map((row: any, idx: number) => (
                        <tr key={row.id || row.userId || row.productId || idx} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3 text-center text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                          {activeTable === 'orders' && (
                            <>
                              <td className="p-3 font-mono font-bold text-blue-700">{row.orderNumber}</td>
                              <td className="p-3">
                                <p className="font-semibold text-slate-800">{row.userName}</p>
                                <p className="text-[11px] text-slate-400 font-mono">ID: {row.userId}</p>
                              </td>
                              <td className="p-3 text-slate-600">{row.orderDate}</td>
                              <td className="p-3">
                                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                                  {row.paymentMethod || 'Nakit'}
                                </span>
                              </td>
                              <td className="p-3 text-slate-700">
                                {row.items?.length || 0} kalem ({row.items?.reduce((acc: number, i: any) => acc + (i.quantity || 0), 0)} adet)
                              </td>
                              <td className="p-3 font-bold text-slate-900">
                                {Number(row.totalAmount || 0).toLocaleString('tr-TR')} ₺
                              </td>
                              <td className="p-3">
                                <span
                                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                    row.status === 'Hazırlanıyor'
                                      ? 'bg-amber-100 text-amber-800'
                                      : row.status === 'Onaylandı'
                                      ? 'bg-blue-100 text-blue-800'
                                      : row.status === 'Yolda'
                                      ? 'bg-indigo-100 text-indigo-800'
                                      : row.status === 'Teslim Edildi'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-rose-100 text-rose-800'
                                  }`}
                                >
                                  {row.status}
                                </span>
                              </td>
                            </>
                          )}
                          {activeTable === 'users' && (
                            <>
                              <td className="p-3 font-mono text-[11px] text-slate-500">{row.id}</td>
                              <td className="p-3 font-mono font-bold text-slate-800">{row.username}</td>
                              <td className="p-3 font-semibold text-slate-900">
                                {row.firstName} {row.lastName}
                              </td>
                              <td className="p-3 text-slate-600">
                                <p>{row.companyName || 'Bireysel'}</p>
                                <p className="text-[10px] text-slate-400 font-mono">ID: {row.companyId}</p>
                              </td>
                              <td className="p-3 text-slate-600 text-[11px]">
                                <p>{row.email}</p>
                                <p className="text-slate-400">{row.phone}</p>
                              </td>
                              <td className="p-3">
                                <span
                                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                    row.role === 'Admin' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-700'
                                  }`}
                                >
                                  {row.role}
                                </span>
                              </td>
                            </>
                          )}
                          {activeTable === 'products' && (
                            <>
                              <td className="p-3 font-mono font-bold text-blue-700">{row.productCode}</td>
                              <td className="p-3 font-semibold text-slate-800">{row.name}</td>
                              <td className="p-3 text-slate-600">{row.brand}</td>
                              <td className="p-3 font-bold text-slate-800">{row.stock} adet</td>
                              <td className="p-3 font-mono text-amber-700 font-bold">
                                {row.criticalStockThreshold ?? 5} adet
                              </td>
                              <td className="p-3 font-bold text-slate-900">
                                {Number(row.price || 0).toLocaleString('tr-TR')} ₺
                              </td>
                            </>
                          )}
                          {activeTable === 'carts' && (
                            <>
                              <td className="p-3 font-mono font-bold text-slate-700">{row.userId}</td>
                              <td className="p-3 font-bold text-blue-700">{row.itemCount} çeşit ürün</td>
                              <td className="p-3 font-mono text-[11px] text-slate-600 max-w-md truncate">
                                {JSON.stringify(row.items)}
                              </td>
                            </>
                          )}
                          {activeTable === 'companies' && (
                            <>
                              <td className="p-3 font-mono font-bold text-slate-700">{row.id}</td>
                              <td className="p-3 font-semibold text-slate-800">{row.name}</td>
                              <td className="p-3 font-mono text-slate-600">{row.taxNumber}</td>
                              <td className="p-3 text-slate-600">{row.city}</td>
                              <td className="p-3 text-slate-700 font-semibold">{row.employeeIds?.length || 0} çalışan</td>
                            </>
                          )}
                          {activeTable === 'stockLogs' && (
                            <>
                              <td className="p-3 font-mono font-bold text-slate-700">{row.productId}</td>
                              <td className="p-3 font-bold text-blue-700">{row.logCount} işlem</td>
                              <td className="p-3 font-mono text-[11px] text-slate-600 max-w-md truncate">
                                {JSON.stringify(row.logs)}
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div>
            Toplam <strong>{filteredData.length}</strong> kayıt listeleniyor ({activeTable})
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold transition-colors cursor-pointer"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
