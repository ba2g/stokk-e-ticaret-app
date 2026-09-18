/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { InventoryView } from './components/InventoryView';
import { DashboardView } from './components/OtherViews/DashboardView';
import { ProductsView } from './components/OtherViews/ProductsView';
import { TransfersView } from './components/OtherViews/TransfersView';
import { OrdersView } from './components/OtherViews/OrdersView';
import { CartView } from './components/Cart/CartView';
import { CustomersView } from './components/OtherViews/CustomersView';
import { CustomersManagement } from './components/Customers/CustomersManagement';
import { ReportsView } from './components/OtherViews/ReportsView';
import { SettingsView } from './components/OtherViews/SettingsView';

import { EditStockModal } from './components/Modals/EditStockModal';
import { QuickTransferModal } from './components/Modals/QuickTransferModal';
import { HistoryDrawer } from './components/Modals/HistoryDrawer';
import { AutoBalanceModal } from './components/Modals/AutoBalanceModal';
import { ColumnCustomizerModal, ColumnVisibility } from './components/Modals/ColumnCustomizerModal';
import { QuickOrderModal } from './components/Modals/QuickOrderModal';
import { AddProductModal } from './components/Modals/AddProductModal';
import { BulkStockModal } from './components/Modals/BulkStockModal';
import { ProductDetailModal } from './components/Modals/ProductDetailModal';
import { GridConfigModal } from './components/Modals/GridConfigModal';
import { LoginView } from './components/LoginView';

import { AdminOrdersView } from './components/Admin/AdminOrdersView';
import { AdminProductsView } from './components/Admin/AdminProductsView';
import { AdminUsersView } from './components/Admin/AdminUsersView';
import { AdminCampaignsView } from './components/Admin/AdminCampaignsView';
import { DatabaseInspectorModal } from './components/DatabaseInspectorModal';

import { orderService } from './services/orderService';
import { productService } from './services/productService';
import { userService } from './services/userService';
import { campaignService } from './services/campaignService';
import { cartService } from './services/cartService';

import {
  INITIAL_PRODUCTS,
  STORE_LOCATIONS,
  INITIAL_CUSTOMERS,
  SAMPLE_TRANSFERS,
  SAMPLE_ORDERS,
  SAMPLE_CUSTOMER_ORDERS,
  INITIAL_CART_ITEMS,
  SAMPLE_CUSTOMERS,
  SAMPLE_HISTORY_LOGS,
  DEFAULT_GRID_COLUMNS,
} from './data/mockData';
import {
  Product,
  Customer,
  VariantItem,
  StoreLocation,
  TransferRecord,
  OrderItem,
  CustomerAccount,
  StockHistoryLog,
  GridColumnConfig,
  CartItem,
  CustomerOrderRecord,
  OrderLineItem
} from './types';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';

export default function App() {
  // Navigation tab
  const [currentTab, setCurrentTab] = useState<string>('admin-siparisler');

  // Core Data State
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [selectedProductId, setSelectedProductId] = useState<string>('prod-1');
  const [locations, setLocations] = useState<StoreLocation[]>(STORE_LOCATIONS);
  const [currentLocation, setCurrentLocation] = useState<StoreLocation>(STORE_LOCATIONS[0]); // Kayseri Mağaza
  const [transfers, setTransfers] = useState<TransferRecord[]>(SAMPLE_TRANSFERS);
  const [orders, setOrders] = useState<OrderItem[]>(SAMPLE_ORDERS);
  const [customerOrders, setCustomerOrders] = useState<CustomerOrderRecord[]>(SAMPLE_CUSTOMER_ORDERS);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [customers, setCustomers] = useState<CustomerAccount[]>(SAMPLE_CUSTOMERS);
  const [eCommerceCustomers, setECommerceCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [historyLogs, setHistoryLogs] = useState<Record<string, StockHistoryLog[]>>(SAMPLE_HISTORY_LOGS);
  const [globalSearch, setGlobalSearch] = useState<string>('');

  // Total items in cart
  const cartCount = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [cartItems]);

  // B2B Dynamic Grid Configuration State
  const [gridColumns, setGridColumns] = useState<GridColumnConfig[]>(DEFAULT_GRID_COLUMNS);
  const [isGridConfigOpen, setIsGridConfigOpen] = useState<boolean>(false);

  // Selected Product for Detail Modal
  const [activeDetailProduct, setActiveDetailProduct] = useState<Product | null>(null);

  // Filter state for Ürünler sidebar accordion
  const [productFilter, setProductFilter] = useState<{ type: string; value?: string } | null>(null);

  // Mobile sidebar visibility
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

  // Variant Matrix Column Visibility State
  const defaultColumns: ColumnVisibility = {
    variant: true,
    toShip: true,
    available: true,
    onHand: true,
    incoming: true,
    status: true,
    history: true,
    actions: true,
  };
  const [columns, setColumns] = useState<ColumnVisibility>(defaultColumns);

  // Modals state
  const [activeEditVariant, setActiveEditVariant] = useState<VariantItem | null>(null);
  const [activeTransferVariant, setActiveTransferVariant] = useState<VariantItem | null>(null);
  const [activeHistoryVariant, setActiveHistoryVariant] = useState<VariantItem | null>(null);
  const [isAutoBalanceOpen, setIsAutoBalanceOpen] = useState<boolean>(false);
  const [autoBalanceMode, setAutoBalanceMode] = useState<'auto-balance' | 'stock-count'>('auto-balance');
  const [isColumnCustomizerOpen, setIsColumnCustomizerOpen] = useState<boolean>(false);
  const [isQuickOrderOpen, setIsQuickOrderOpen] = useState<boolean>(false);
  const [isAddProductOpen, setIsAddProductOpen] = useState<boolean>(false);
  const [isBulkStockOpen, setIsBulkStockOpen] = useState<boolean>(false);
  const [isDbInspectorOpen, setIsDbInspectorOpen] = useState<boolean>(false);

  // User Authentication State
  const [currentUser, setCurrentUser] = useState<Customer | null>(() => {
    return userService.getUserById('cust-1') || null;
  });

  // Keep cart strictly isolated and synced with the active user
  useEffect(() => {
    if (currentUser) {
      setCartItems(cartService.getCartForUser(currentUser.id));
    } else {
      setCartItems([]);
    }
  }, [currentUser?.id]);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCartItems([]);
    showToast('Hesabınızdan başarıyla çıkış yapıldı. Giriş ekranına yönlendirildiniz.', 'info');
  };

  const handleLogin = (user: Customer) => {
    setCurrentUser(user);
    setCartItems(cartService.getCartForUser(user.id));
    if (user.role === 'Admin') {
      setCurrentTab('admin-siparisler');
    } else {
      setCurrentTab('urunler');
    }
    showToast(`Tekrar hoş geldiniz, ${user.firstName} ${user.lastName}!`);
  };

  // Active Product for Variant Matrix
  const activeProduct = useMemo(() => {
    return products.find((p) => p.id === selectedProductId) || products[0];
  }, [products, selectedProductId]);

  // Recalculate product overall KPIs when variants change
  const updateProductWithVariants = (productId: string, updatedVariants: VariantItem[]) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const totalOnHand = updatedVariants.reduce((sum, v) => sum + v.onHand, 0);
          const totalIncoming = updatedVariants.reduce((sum, v) => sum + v.incoming, 0);
          const availableStock = updatedVariants.reduce((sum, v) => sum + v.available, 0);
          const toShipTotal = updatedVariants.reduce((sum, v) => sum + v.toShip, 0);

          return {
            ...p,
            variants: updatedVariants,
            totalOnHand,
            totalIncoming,
            availableStock,
            toShipTotal,
          };
        }
        return p;
      })
    );
  };

  // 1. Direct Add to Cart from B2B Grid (Katalogtan Sepete Ekle)
  const handleDirectAddToCart = (product: Product, quantity: number) => {
    if (product.totalOnHand <= 0) {
      showToast(`'${product.name}' ürününde stok bulunmadığı için sepete eklenemez.`, 'info');
      return;
    }

    const validQty = Math.min(product.totalOnHand, Math.max(1, quantity));

    setCartItems((prev) => {
      let updated: CartItem[];
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        const nextQty = Math.min(product.totalOnHand, existing.quantity + validQty);
        updated = prev.map((item) =>
          item.productId === product.id
            ? {
                ...item,
                quantity: nextQty,
                unitPrice: product.price,
                totalPrice: nextQty * product.price,
                availableStock: product.totalOnHand,
              }
            : item
        );
      } else {
        const newItem: CartItem = {
          id: `cart-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          productId: product.id,
          productCode: product.code,
          productName: product.name,
          brand: product.brand,
          image: product.image,
          quantity: validQty,
          unitPrice: product.price,
          totalPrice: validQty * product.price,
          availableStock: product.totalOnHand,
        };
        updated = [newItem, ...prev];
      }

      if (currentUser) {
        cartService.saveCartForUser(currentUser.id, updated);
      }
      return updated;
    });

    showToast(`${validQty} Adet '${product.name}' sepete eklendi!`);
  };

  // 2. Update Cart Item Quantity
  const handleUpdateCartQuantity = (cartItemId: string, newQuantity: number) => {
    setCartItems((prev) => {
      const updated = prev.map((item) => {
        if (item.id === cartItemId) {
          const prod = products.find((p) => p.id === item.productId);
          const maxStock = prod ? prod.totalOnHand : item.availableStock;
          const clamped = Math.min(maxStock, Math.max(1, newQuantity));
          return {
            ...item,
            quantity: clamped,
            totalPrice: clamped * item.unitPrice,
            availableStock: maxStock,
          };
        }
        return item;
      });

      if (currentUser) {
        cartService.saveCartForUser(currentUser.id, updated);
      }
      return updated;
    });
  };

  // 3. Remove Item from Cart
  const handleRemoveCartItem = (cartItemId: string) => {
    setCartItems((prev) => {
      const updated = prev.filter((item) => item.id !== cartItemId);
      if (currentUser) {
        cartService.saveCartForUser(currentUser.id, updated);
      }
      return updated;
    });
    showToast('Ürün sepetten çıkarıldı.');
  };

  // 4. Clear Cart
  const handleClearCart = () => {
    if (currentUser) {
      cartService.clearCartForUser(currentUser.id);
    }
    setCartItems([]);
    showToast('Sepet tamamen temizlendi.');
  };

  // 5. Checkout Order with Stock Control, Payment Method & Snapshot Historical Pricing
  const handleCheckoutOrder = (
    selectedCustomerId?: string,
    notes?: string,
    paymentMethod: 'Nakit' | 'Çek' | 'Bakiye' = 'Nakit'
  ) => {
    if (cartItems.length === 0 || !currentUser) return;

    // Strict stock verification
    for (const item of cartItems) {
      const prod = products.find((p) => p.id === item.productId) || productService.getProductById(item.productId);
      const available = prod ? prod.totalOnHand : 0;
      if (item.quantity > available) {
        showToast(
          `Ürün '${item.productName}' için yeterli stok bulunmamaktadır. Mevcut stok: ${available}.`,
          'info'
        );
        return;
      }
    }

    const orderId = `ord-${Date.now()}`;
    const subtotal = cartItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const vat = Math.round(subtotal * 0.10);
    const totalAmount = subtotal + vat;

    // Line items with frozen unitPrice (satıldığı andaki fiyat sabitlenir)
    const lineItems: OrderLineItem[] = cartItems.map((item) => ({
      orderId,
      productId: item.productId,
      productCode: item.productCode,
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice, // Satıldığı andaki fiyat sabitlenir
      totalPrice: item.quantity * item.unitPrice,
    }));

    // Decoupled microservice call - persists order and deducts stock from inventory
    const res = orderService.createOrder(currentUser, cartItems, notes, paymentMethod);
    if (!res.success || !res.order) {
      showToast(res.error || 'Sipariş oluşturulamadı.', 'info');
      return;
    }

    // Refresh products and orders in state
    setProducts(productService.getProducts());
    setCustomerOrders(orderService.getAllOrders());

    // Clear cart in service and state, then switch to orders screen
    if (currentUser) {
      cartService.clearCartForUser(currentUser.id);
    }
    setCartItems([]);
    setCurrentTab('siparislerim');
    showToast(`Sipariş #${res.order.orderNo} (${paymentMethod} ile ödendi) başarıyla oluşturuldu!`);
  };

  // 6. Update Product Price (Demonstrates historical price retention)
  const handleUpdateProductPrice = (productId: string, newPrice: number) => {
    productService.updateProductPrice(productId, newPrice);
    setProducts(productService.getProducts());
    const prod = products.find((p) => p.id === productId);
    showToast(
      `'${prod?.name || 'Ürün'}' toptan satış fiyatı ₺${newPrice.toLocaleString('tr-TR')} olarak güncellendi. Geçmiş siparişlerin fiyatı sabit kaldı.`
    );
  };

  // 7. Update Order Status (Linked to Stock Rollback on Reddedildi)
  const handleUpdateOrderStatus = (orderId: string, newStatus: CustomerOrderRecord['status']) => {
    orderService.updateOrderStatus(orderId, newStatus);
    setProducts(productService.getProducts());
    setCustomerOrders(orderService.getAllOrders());
    showToast(`Sipariş durumu '${newStatus}' olarak güncellendi.`);
  };

  // Update Product-Specific Critical Stock Threshold
  const handleUpdateThreshold = (productId: string, newThreshold: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, criticalStockThreshold: newThreshold } : p))
    );
    const prod = products.find((p) => p.id === productId);
    showToast(`'${prod?.name || 'Ürün'}' için kritik stok eşik seviyesi ${newThreshold} adet olarak kaydedildi.`);
  };

  // 1. Edit Stock Handler
  const handleSaveStock = (variantId: string, newOnHand: number, newAvailable: number, reason: string) => {
    const updatedVariants = activeProduct.variants.map((v) => {
      if (v.id === variantId) {
        let status = v.status;
        if (newOnHand < 0) status = 'Ters Bakiye';
        else if (newOnHand === 0) status = 'Tükendi';
        else status = 'Normal';

        return {
          ...v,
          onHand: newOnHand,
          available: newAvailable,
          status,
        };
      }
      return v;
    });

    updateProductWithVariants(activeProduct.id, updatedVariants);

    // Append to history logs
    const targetVariant = activeProduct.variants.find((v) => v.id === variantId);
    if (targetVariant) {
      const delta = newOnHand - targetVariant.onHand;
      const newLog: StockHistoryLog = {
        id: `log-${Date.now()}`,
        date: new Date().toLocaleDateString('tr-TR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        type: 'Sayım Farkı',
        referenceNo: `DUZ-${Date.now().toString().slice(-4)}`,
        changeAmount: delta,
        balanceAfter: newOnHand,
        operator: 'Batu Güdek',
        description: `${reason} işlemi yapıldı (Eski: ${targetVariant.onHand} -> Yeni: ${newOnHand})`,
      };

      setHistoryLogs((prev) => ({
        ...prev,
        [targetVariant.sku]: [newLog, ...(prev[targetVariant.sku] || [])],
      }));
    }

    showToast(`${targetVariant?.sku || 'Varyant'} stoğu başarıyla güncellendi.`);
  };

  // 2. Quick Transfer Handler
  const handleCreateTransfer = (fromLoc: string, toLoc: string, quantity: number, notes: string) => {
    if (!activeTransferVariant) return;

    const newTrf: TransferRecord = {
      id: `trf-${Date.now()}`,
      code: `TRF-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      fromLocation: fromLoc,
      toLocation: toLoc,
      sku: activeTransferVariant.sku,
      productName: activeProduct.name,
      variant: `${activeTransferVariant.colorName} / ${activeTransferVariant.size}`,
      quantity,
      status: 'Yolda',
      date: new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
    };

    setTransfers((prev) => [newTrf, ...prev]);
    showToast(`${quantity} adetlik ${newTrf.code} nolu transfer emri oluşturuldu.`);
  };

  // Approve Transfer in Kayseri Mağaza
  const handleApproveTransfer = (id: string) => {
    const trf = transfers.find((t) => t.id === id);
    if (!trf) return;

    setTransfers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: 'Teslim Alındı' as const } : t))
    );

    const updatedVariants = activeProduct.variants.map((v) => {
      if (v.sku === trf.sku) {
        const newOnHand = v.onHand + trf.quantity;
        return {
          ...v,
          onHand: newOnHand,
          available: v.available + trf.quantity,
          status:
            newOnHand < 0
              ? ('Ters Bakiye' as const)
              : newOnHand === 0
              ? ('Tükendi' as const)
              : ('Normal' as const),
        };
      }
      return v;
    });

    updateProductWithVariants(activeProduct.id, updatedVariants);
    showToast(`${trf.code} transferi teslim alındı ve stoğa eklendi.`);
  };

  // 3. Auto Balance Handler
  const handleApplyBalance = (actionType: string, updatedVariants: VariantItem[]) => {
    updateProductWithVariants(activeProduct.id, updatedVariants);
    showToast('Ters bakiyeler başarıyla dengelendi ve ERP fişi oluşturuldu.');
  };

  // 4. Quick Order Handler (Modal)
  const handleAddToCart = (
    items: { sku: string; name: string; variant: string; qty: number; price: number }[]
  ) => {
    const newCartItems: CartItem[] = items.map((item) => {
      const prod = products.find((p) => p.name === item.name) || activeProduct;
      return {
        id: `cart-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        productId: prod.id,
        productCode: prod.code,
        productName: `${prod.name} (${item.variant})`,
        brand: prod.brand,
        image: prod.image,
        quantity: item.qty,
        unitPrice: item.price || prod.price,
        totalPrice: item.qty * (item.price || prod.price),
        availableStock: prod.totalOnHand,
      };
    });

    setCartItems((prev) => [...newCartItems, ...prev]);
    const totalAdded = items.reduce((sum, item) => sum + item.qty, 0);
    showToast(`${totalAdded} adet ürün sepete eklendi!`);
  };

  // 5. Add Product Handler
  const handleAddProduct = (newProd: Product) => {
    setProducts((prev) => [newProd, ...prev]);
    setSelectedProductId(newProd.id);
    setCurrentTab('urunler');
    showToast(`'${newProd.name}' modeli ve varyantları sisteme eklendi.`);
  };

  // 6. Bulk Stock Handler
  const handleBulkStock = (delta: number) => {
    const updatedVariants = activeProduct.variants.map((v) => {
      if (v.onHand < 0) {
        const next = v.onHand + delta;
        return {
          ...v,
          onHand: next,
          available: v.available + delta,
          status:
            next < 0
              ? ('Ters Bakiye' as const)
              : next === 0
              ? ('Tükendi' as const)
              : ('Normal' as const),
        };
      }
      return v;
    });

    updateProductWithVariants(activeProduct.id, updatedVariants);
    showToast(`Ters bakiye veren varyantlara +${delta} adet stok uygulandı.`);
  };

  // If user is logged out, render the Login Screen
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#f8f9ff]">
        <LoginView onLogin={handleLogin} />
        {/* Toast Notification Container */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="bg-[#0b1c30] text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-xs border border-white/10">
              <CheckCircle2 className="w-4 h-4 text-[#008378]" />
              <span>{toastMessage.text}</span>
              <button
                type="button"
                onClick={() => setToastMessage(null)}
                className="text-white/60 hover:text-white ml-2"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex flex-col font-sans antialiased">
      {/* Sidebar for Desktop */}
      <div className="hidden lg:block">
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => {
            setCurrentTab(tab);
            setMobileSidebarOpen(false);
          }}
          currentLocation={currentLocation}
          locations={locations}
          onSelectLocation={setCurrentLocation}
          cartCount={cartCount}
          productFilter={productFilter}
          onSelectProductFilter={(type, val) => {
            setProductFilter(type === 'all' ? null : { type, value: val });
            setCurrentTab('urunler');
          }}
          currentUser={currentUser}
          onLogout={handleLogout}
        />
      </div>

      {/* Mobile Drawer Sidebar */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative z-10 w-72 h-full bg-white flex flex-col">
            <Sidebar
              currentTab={currentTab}
              onSelectTab={(tab) => {
                setCurrentTab(tab);
                setMobileSidebarOpen(false);
              }}
              currentLocation={currentLocation}
              locations={locations}
              onSelectLocation={setCurrentLocation}
              cartCount={cartCount}
              productFilter={productFilter}
              onSelectProductFilter={(type, val) => {
                setProductFilter(type === 'all' ? null : { type, value: val });
                setCurrentTab('urunler');
              }}
              currentUser={currentUser}
              onLogout={handleLogout}
            />
          </div>
        </div>
      )}

      {/* Main Layout Area */}
      <div className="lg:pl-72 flex-1 flex flex-col">
        {/* Top Sticky Header */}
        <Header
          currentLocation={currentLocation}
          locations={locations}
          onSelectLocation={setCurrentLocation}
          onOpenQuickOrder={() => setIsQuickOrderOpen(true)}
          searchTerm={globalSearch}
          onSearchChange={(val) => {
            setGlobalSearch(val);
            if (val && currentTab !== 'envanter-matris' && currentTab !== 'urunler') {
              setCurrentTab('urunler');
            }
          }}
          onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          currentUser={currentUser}
          onLogout={handleLogout}
          cartCount={cartCount}
          onGoToCart={() => setCurrentTab('sepetim')}
          onOpenDbInspector={currentUser?.role === 'Admin' ? () => setIsDbInspectorOpen(true) : undefined}
        />

        {/* Dynamic Main View */}
        <main className="flex-1 pt-16 pb-12">
          {/* ========================================================================= */}
          {/* 1. ADMIN PANEL VIEWS (Sipariş Yönetimi, Ürün Yönetimi, Kullanıcı Yönetimi, Slider Kampanyaları) */}
          {/* ========================================================================= */}
          {currentUser.role === 'Admin' ? (
            <div className="p-4 sm:p-6 max-w-[1600px] w-full mx-auto">
              {(currentTab === 'admin-siparisler' ||
                !['admin-urunler', 'admin-kullanicilar', 'admin-kampanyalar'].includes(currentTab)) && (
                <AdminOrdersView />
              )}
              {currentTab === 'admin-urunler' && <AdminProductsView />}
              {currentTab === 'admin-kullanicilar' && <AdminUsersView />}
              {currentTab === 'admin-kampanyalar' && <AdminCampaignsView />}
            </div>
          ) : (
            /* ========================================================================= */
            /* 2. CUSTOMER / BAYI VIEWS (Vitrin, Ürün Kataloğu, Sepetim, Kullanıcıya Özel Siparişlerim) */
            /* ========================================================================= */
            <>
              {/* 1. Vitrin / Anasayfa Promosyon Slider */}
              {currentTab === 'anasayfa' && (
                <DashboardView
                  products={products}
                  transfers={transfers}
                  orders={orders}
                  slides={campaignService.getActiveCampaigns()}
                  onGoToInventory={() => setCurrentTab('urunler')}
                  onGoToTransfers={() => setCurrentTab('urunler')}
                  onGoToOrders={() => setCurrentTab('siparislerim')}
                  onGoToProducts={() => setCurrentTab('urunler')}
                  onSelectCampaign={(slide) => {
                    const p = products.find(
                      (prod) => prod.id === slide.productId || prod.code === slide.productCode
                    );
                    if (p) {
                      setActiveDetailProduct(p);
                    } else {
                      setGlobalSearch(slide.productCode);
                      setCurrentTab('urunler');
                    }
                  }}
                  onQuickOrderCampaign={(slide) => {
                    const p = products.find(
                      (prod) => prod.id === slide.productId || prod.code === slide.productCode
                    );
                    if (p) {
                      setSelectedProductId(p.id);
                      setIsQuickOrderOpen(true);
                    } else {
                      setCurrentTab('urunler');
                    }
                  }}
                />
              )}

              {/* 2. Ürün Kataloğu (Müşteri için salt-okunur liste, sepet aksiyonları) */}
              {(currentTab === 'urunler' || (!['anasayfa', 'sepetim', 'siparislerim', 'siparisler'].includes(currentTab))) && (
                <ProductsView
                  products={products}
                  columns={gridColumns}
                  onOpenColumnConfig={() => setIsGridConfigOpen(true)}
                  onAddToCart={handleDirectAddToCart}
                  onOpenProductDetail={(prod) => setActiveDetailProduct(prod)}
                  onSelectProductToMatrix={() => {}}
                  onOpenAddProduct={() => {}}
                  searchTerm={globalSearch}
                  onSearchChange={setGlobalSearch}
                  activeFilterType={productFilter?.type}
                  activeFilterValue={productFilter?.value}
                  onClearFilter={() => setProductFilter(null)}
                />
              )}

              {/* 3. Sepetim */}
              {currentTab === 'sepetim' && (
                <CartView
                  cartItems={cartItems}
                  products={products}
                  customers={userService.getUsers()}
                  activeUserId={currentUser.id}
                  onUpdateQuantity={handleUpdateCartQuantity}
                  onRemoveItem={handleRemoveCartItem}
                  onClearCart={handleClearCart}
                  onCheckoutOrder={handleCheckoutOrder}
                  onGoToProducts={() => setCurrentTab('urunler')}
                />
              )}

              {/* 4. Siparişlerim (STRICT USER ISOLATION - Ayşe velinin siparişini göremez) */}
              {(currentTab === 'siparislerim' || currentTab === 'siparisler') && (
                <OrdersView
                  orders={orderService.getOrdersForUser(currentUser.id)}
                  onOpenQuickOrder={() => setIsQuickOrderOpen(true)}
                  onGoToProducts={() => setCurrentTab('urunler')}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Global Modals */}
      {/* Product Detail Modal */}
      <ProductDetailModal
        isOpen={Boolean(activeDetailProduct)}
        onClose={() => setActiveDetailProduct(null)}
        product={activeDetailProduct}
        onAddToCart={handleDirectAddToCart}
        onGoToVariantMatrix={(p) => {
          setSelectedProductId(p.id);
          setCurrentTab('envanter-matris');
        }}
        onUpdateThreshold={handleUpdateThreshold}
        onUpdatePrice={handleUpdateProductPrice}
      />

      {/* Dynamic B2B Grid Column Customizer Modal */}
      <GridConfigModal
        isOpen={isGridConfigOpen}
        onClose={() => setIsGridConfigOpen(false)}
        columns={gridColumns}
        onUpdateColumns={setGridColumns}
        onResetColumns={() => setGridColumns(DEFAULT_GRID_COLUMNS)}
      />

      <EditStockModal
        isOpen={Boolean(activeEditVariant)}
        onClose={() => setActiveEditVariant(null)}
        product={activeProduct}
        variant={activeEditVariant}
        onSave={handleSaveStock}
      />

      <QuickTransferModal
        isOpen={Boolean(activeTransferVariant)}
        onClose={() => setActiveTransferVariant(null)}
        product={activeProduct}
        variant={activeTransferVariant}
        locations={locations}
        currentLocation={currentLocation}
        onCreateTransfer={handleCreateTransfer}
      />

      <HistoryDrawer
        isOpen={Boolean(activeHistoryVariant)}
        onClose={() => setActiveHistoryVariant(null)}
        product={activeProduct}
        variant={activeHistoryVariant}
        historyLogs={activeHistoryVariant ? historyLogs[activeHistoryVariant.sku] || [] : []}
      />

      <AutoBalanceModal
        isOpen={isAutoBalanceOpen}
        onClose={() => setIsAutoBalanceOpen(false)}
        product={activeProduct}
        mode={autoBalanceMode}
        onApplyBalance={handleApplyBalance}
      />

      <ColumnCustomizerModal
        isOpen={isColumnCustomizerOpen}
        onClose={() => setIsColumnCustomizerOpen(false)}
        columns={columns}
        onToggleColumn={(col) => setColumns((c) => ({ ...c, [col]: !c[col] }))}
        onReset={() => setColumns(defaultColumns)}
      />

      <QuickOrderModal
        isOpen={isQuickOrderOpen}
        onClose={() => setIsQuickOrderOpen(false)}
        products={products}
        onAddToCart={handleAddToCart}
      />

      <AddProductModal
        isOpen={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
        onAddProduct={handleAddProduct}
      />

      <BulkStockModal
        isOpen={isBulkStockOpen}
        onClose={() => setIsBulkStockOpen(false)}
        onConfirmBulk={handleBulkStock}
      />

      {currentUser?.role === 'Admin' && (
        <DatabaseInspectorModal
          isOpen={isDbInspectorOpen}
          onClose={() => setIsDbInspectorOpen(false)}
        />
      )}

      {/* Toast Notification Container */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="bg-[#0b1c30] text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-xs border border-white/10">
            <CheckCircle2 className="w-4 h-4 text-[#008378]" />
            <span>{toastMessage.text}</span>
            <button
              type="button"
              onClick={() => setToastMessage(null)}
              className="text-white/60 hover:text-white ml-2"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
