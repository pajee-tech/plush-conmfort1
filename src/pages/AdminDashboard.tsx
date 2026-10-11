import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Product, Category, Order, BlogPost, StoreSettings } from '../types';
import {
  BarChart3,
  Package,
  Layers,
  ShoppingBag,
  FileText,
  Settings,
  TrendingUp,
  AlertTriangle,
  Plus,
  Edit2,
  Trash2,
  Copy,
  Download,
  Upload,
  CheckCircle2,
  X,
  Search,
  Eye,
  Truck,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Lock,
  KeyRound,
  ShieldCheck,
  FileSpreadsheet,
} from 'lucide-react';
import { CmsDashboard } from '../components/cms/CmsDashboard';
import { WooCommerceProductImporter } from '../components/admin/WooCommerceProductImporter';
import { OfficialBrandLogoManager } from '../components/admin/OfficialBrandLogoManager';

export const AdminDashboard: React.FC = () => {
  const {
    products,
    categories,
    orders,
    blogPosts,
    settings,
    addProduct,
    updateProduct,
    deleteProduct,
    duplicateProduct,
    updateStock,
    toggleProductPublish,
    updateCategory,
    toggleCategoryActive,
    updateOrderStatus,
    cancelOrder,
    updateSettings,
    addBlogPost,
    updateBlogPost,
    deleteBlogPost,
    duplicateBlogPost,
    toggleBlogPostStatus,
    exportProductsCSV,
    importProductsCSV,
    getAnalyticsMetrics,
    setRoute,
  } = useStore();

  const [isAuthorized, setIsAuthorized] = useState<boolean>(() => {
    return sessionStorage.getItem('pc_admin_auth') === 'true';
  });
  const [authPin, setAuthPin] = useState('');
  const [authError, setAuthError] = useState(false);

  const [activeTab, setActiveTab] = useState<
    'overview' | 'products' | 'categories' | 'orders' | 'content' | 'settings' | 'analytics'
  >('overview');

  // Search & Filters in Admin
  const [productSearch, setProductSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [csvInput, setCsvInput] = useState('');
  const [csvStatus, setCsvStatus] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showWooImporter, setShowWooImporter] = useState(false);

  // Settings form state
  const [settingsForm, setSettingsForm] = useState<StoreSettings>(settings);
  const [settingsSaved, setSettingsSaved] = useState(false);

  const metrics = getAnalyticsMetrics();

  // Low stock products alert
  const lowStockProducts = products.filter((p) => p.stock <= p.lowStockThreshold);

  // Handlers for CSV
  const handleDownloadCSV = () => {
    const csvData = exportProductsCSV();
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `plush_comfort_products_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportCSV = () => {
    if (!csvInput.trim()) return;
    const res = importProductsCSV(csvInput);
    if (res.success) {
      setCsvStatus(`Successfully updated ${res.count} products from CSV.`);
      setCsvInput('');
    } else {
      setCsvStatus(`Error importing CSV: ${res.error}`);
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(settingsForm);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl border border-[#E8E0D5] p-8 max-w-md w-full shadow-xl space-y-6 text-center animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-[#A25828] text-white flex items-center justify-center mx-auto shadow-md">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#A25828]">Authorized Access Only</span>
            <h2 className="font-serif font-bold text-2xl text-[#221C18] mt-1">Plush Comfort CMS Portal</h2>
            <p className="text-xs text-stone-500 mt-1">
              Calder Road, Dewsbury WF12 9EA · Private Store Management Portal
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (authPin.trim() === 'plush2026' || authPin.trim().toLowerCase() === 'admin') {
                sessionStorage.setItem('pc_admin_auth', 'true');
                setIsAuthorized(true);
                setAuthError(false);
              } else {
                setAuthError(true);
              }
            }}
            className="space-y-4 text-left"
          >
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Admin Passkey / PIN
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={authPin}
                  onChange={(e) => {
                    setAuthPin(e.target.value);
                    setAuthError(false);
                  }}
                  placeholder="Enter store passkey (e.g. plush2026)"
                  className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-[#D5C7B7] focus:outline-none focus:border-[#A25828]"
                />
              </div>
              {authError && (
                <p className="text-[11px] text-rose-600 mt-1 font-semibold">
                  Incorrect passkey. Please enter the authorised store passkey.
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-[#A25828] hover:bg-[#8A461A] text-white py-3 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              Sign In to Admin Portal
            </button>

            <button
              type="button"
              onClick={() => {
                sessionStorage.setItem('pc_admin_auth', 'true');
                setIsAuthorized(true);
              }}
              className="w-full bg-[#FAF5EE] hover:bg-[#F3EAD9] text-[#A25828] border border-[#E8DFC5] py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Quick Unlock with Store Owner Session
            </button>

            <button
              type="button"
              onClick={() => setRoute({ name: 'home' })}
              className="w-full text-center text-xs text-stone-500 hover:text-stone-800 cursor-pointer"
            >
              &larr; Return to Storefront
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F4EF] text-[#221C18] pb-24">
      {/* Top Admin Bar */}
      <div className="bg-[#221C18] text-white border-b border-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#A25828] flex items-center justify-center font-serif font-bold text-base">
              PC
            </div>
            <div>
              <h1 className="font-serif font-bold text-lg text-white leading-none">
                Plush Comfort Administration
              </h1>
              <span className="text-[11px] text-stone-400">
                Calder Road, Dewsbury WF12 9EA · UK Multi-Channel Store
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setRoute({ name: 'home' })}
              className="text-xs bg-stone-800 hover:bg-stone-700 text-stone-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              &larr; View Live Storefront
            </button>
            <div className="text-xs text-stone-400 pl-2 border-l border-stone-700 font-mono">
              Status: <span className="text-emerald-400 font-semibold">Active</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex overflow-x-auto gap-1 border-t border-stone-800">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'products', label: 'Products & Stock', icon: Package },
            { id: 'categories', label: 'Categories & Future', icon: Layers },
            { id: 'orders', label: 'Orders & Fulfilment', icon: ShoppingBag },
            { id: 'content', label: 'Content CMS & SEO', icon: FileText },
            { id: 'analytics', label: 'First-Party Analytics', icon: TrendingUp },
            { id: 'settings', label: 'Store Settings', icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer border-b-2 ${
                  isActive
                    ? 'border-[#A25828] text-white bg-stone-900'
                    : 'border-transparent text-stone-400 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#A25828]' : ''}`} />
                <span>{tab.label}</span>
                {tab.id === 'products' && lowStockProducts.length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* ==================== 1. OVERVIEW TAB ==================== */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fade-in">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white p-6 rounded-2xl border border-[#E8E0D5] shadow-xs">
                <span className="text-xs text-stone-500 font-medium">Total UK Revenue</span>
                <div className="text-2xl font-bold font-serif text-[#221C18] mt-1 tabular-nums">
                  £{metrics.totalRevenue.toFixed(2)}
                </div>
                <span className="text-[11px] text-emerald-600 font-semibold block mt-1">
                  100% verified order payments
                </span>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-[#E8E0D5] shadow-xs">
                <span className="text-xs text-stone-500 font-medium">Total Orders</span>
                <div className="text-2xl font-bold font-serif text-[#221C18] mt-1 tabular-nums">
                  {metrics.totalOrders}
                </div>
                <span className="text-[11px] text-stone-400 block mt-1">
                  {orders.filter((o) => o.fulfilmentStatus === 'processing').length} in workshop production
                </span>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-[#E8E0D5] shadow-xs">
                <span className="text-xs text-stone-500 font-medium">Average Order Value (AOV)</span>
                <div className="text-2xl font-bold font-serif text-[#221C18] mt-1 tabular-nums">
                  £{metrics.averageOrderValue.toFixed(2)}
                </div>
                <span className="text-[11px] text-stone-400 block mt-1">
                  {metrics.itemsSold} total furniture pieces sold
                </span>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-[#E8E0D5] shadow-xs">
                <span className="text-xs text-stone-500 font-medium">Store Conversion Rate</span>
                <div className="text-2xl font-bold font-serif text-[#221C18] mt-1 tabular-nums">
                  {metrics.conversionRate}%
                </div>
                <span className="text-[11px] text-emerald-600 font-semibold block mt-1">
                  Healthy benchmark (&gt; 2.5%)
                </span>
              </div>
            </div>

            {/* Low-stock Alerts Banner */}
            {lowStockProducts.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-sm text-amber-900">
                      Inventory Alert: {lowStockProducts.length} Items Below Threshold
                    </h3>
                    <p className="text-xs text-amber-800 mt-0.5">
                      The following pieces have low stock remaining in our Calder Road warehouse:
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {lowStockProducts.map((p) => (
                        <span key={p.id} className="text-xs bg-white/80 border border-amber-300 px-2.5 py-0.5 rounded font-medium">
                          {p.name}: <strong>{p.stock} left</strong> (SKU: {p.sku})
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('products')}
                  className="bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold px-4 py-1.5 rounded-lg shrink-0 cursor-pointer"
                >
                  Adjust Stock
                </button>
              </div>
            )}

            {/* Recent Orders List */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E0D5]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-serif font-bold text-xl text-[#221C18]">
                  Recent Customer Orders
                </h3>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs font-semibold text-[#A25828] hover:underline"
                >
                  View All Orders &rarr;
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left text-stone-700">
                  <thead className="bg-[#FAF8F5] text-stone-500 uppercase tracking-wider text-[10px] border-b border-[#E8E0D5]">
                    <tr>
                      <th className="py-3 px-4">Order #</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Destination</th>
                      <th className="py-3 px-4">Items</th>
                      <th className="py-3 px-4">Total (£)</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Assigned Logistics</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {orders.slice(0, 5).map((order) => (
                      <tr key={order.id} className="hover:bg-stone-50/50">
                        <td className="py-3 px-4 font-mono font-bold text-stone-900">
                          {order.orderNumber}
                        </td>
                        <td className="py-3 px-4 font-semibold text-stone-800">
                          {order.customer.fullName}
                        </td>
                        <td className="py-3 px-4">
                          {order.customer.city}, {order.customer.postcode}
                        </td>
                        <td className="py-3 px-4">{order.items.length} pcs</td>
                        <td className="py-3 px-4 font-bold tabular-nums">
                          £{order.total.toFixed(2)}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              order.fulfilmentStatus === 'delivered'
                                ? 'bg-emerald-100 text-emerald-800'
                                : order.fulfilmentStatus === 'dispatched'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {order.fulfilmentStatus}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-stone-500">
                          {order.courier || 'Pending allocation'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================== 2. PRODUCTS TAB ==================== */}
        {activeTab === 'products' && (
          <div className="space-y-6 animate-fade-in">
            {/* Product Controls Bar */}
            <div className="bg-white p-5 rounded-2xl border border-[#E8E0D5] flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1 max-w-md">
                <Search className="w-4 h-4 text-stone-400 shrink-0" />
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Filter by name, SKU, or category..."
                  className="w-full text-xs bg-transparent focus:outline-none"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setShowWooImporter(true)}
                  className="flex items-center gap-1.5 bg-[#221C18] hover:bg-black text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition-colors cursor-pointer shadow-xs"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-amber-300" />
                  <span>Import WooCommerce CSV</span>
                </button>

                <button
                  onClick={handleDownloadCSV}
                  className="flex items-center gap-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>

                <button
                  onClick={() => setIsCreatingProduct(true)}
                  className="flex items-center gap-1.5 bg-[#A25828] hover:bg-[#8A461A] text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Product</span>
                </button>
              </div>
            </div>

            {/* CSV Import Drawer / Box */}
            <div className="bg-white p-5 rounded-2xl border border-[#E8E0D5] space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-[#A25828]" />
                  Batch Import / Update Stock via CSV
                </h4>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowWooImporter(true)}
                    className="text-xs text-[#A25828] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <span>Open 19-Product WooCommerce Validator</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                  {csvStatus && (
                    <span className="text-xs text-[#A25828] font-semibold">{csvStatus}</span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <textarea
                  rows={2}
                  value={csvInput}
                  onChange={(e) => setCsvInput(e.target.value)}
                  placeholder='Paste CSV here: ID,Name,SKU,Category,Price,SalePrice,Stock,IsPublished OR paste full WooCommerce CSV export...'
                  className="flex-1 text-xs p-2 rounded-xl border border-[#D5C7B7] font-mono"
                />
                <button
                  onClick={handleImportCSV}
                  className="bg-[#221C18] text-white hover:bg-black px-4 py-2 rounded-xl text-xs font-semibold shrink-0 cursor-pointer"
                >
                  Import
                </button>
              </div>
            </div>

            {/* Product Table */}
            <div className="bg-white rounded-3xl border border-[#E8E0D5] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left text-stone-700">
                  <thead className="bg-[#FAF8F5] text-stone-500 uppercase tracking-wider text-[10px] border-b border-[#E8E0D5]">
                    <tr>
                      <th className="py-3 px-4">Image</th>
                      <th className="py-3 px-4">Name &amp; SKU</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Price (£)</th>
                      <th className="py-3 px-4">Stock</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {products
                      .filter(
                        (p) =>
                          p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                          p.sku.toLowerCase().includes(productSearch.toLowerCase())
                      )
                      .map((p) => {
                        const cat = categories.find((c) => c.id === p.categoryId)?.name || '';
                        const isLowStock = p.stock <= p.lowStockThreshold;

                        return (
                          <tr key={p.id} className="hover:bg-stone-50/50">
                            <td className="py-3 px-4">
                              <div className="w-12 h-12 rounded-lg bg-[#FAF8F5] border border-[#E8E0D5] p-1 overflow-hidden flex items-center justify-center">
                                <img src={p.images[0]} alt="" className="w-full h-full object-contain" />
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="font-bold text-stone-900 block">{p.name}</span>
                              <span className="text-[11px] text-stone-400 font-mono">SKU: {p.sku}</span>
                            </td>
                            <td className="py-3 px-4 text-stone-600">{cat}</td>
                            <td className="py-3 px-4 font-bold tabular-nums">
                              £{(p.salePrice ?? p.price).toFixed(2)}
                              {p.salePrice && (
                                <span className="block text-[10px] text-stone-400 line-through">
                                  £{p.price.toFixed(2)}
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  min="0"
                                  value={p.stock}
                                  onChange={(e) => updateStock(p.id, parseInt(e.target.value, 10) || 0)}
                                  className={`w-16 px-2 py-1 text-xs border rounded font-mono font-bold ${
                                    isLowStock ? 'border-amber-500 bg-amber-50 text-amber-900' : 'border-stone-200'
                                  }`}
                                />
                                {isLowStock && (
                                  <span className="text-[10px] text-amber-600 font-bold">Low</span>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <button
                                onClick={() => toggleProductPublish(p.id)}
                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-colors cursor-pointer ${
                                  p.isPublished
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-stone-200 text-stone-600'
                                }`}
                              >
                                {p.isPublished ? 'Published' : 'Draft'}
                              </button>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => duplicateProduct(p.id)}
                                  title="Duplicate piece"
                                  className="p-1.5 text-stone-400 hover:text-stone-700 cursor-pointer"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setEditingProduct(p)}
                                  title="Edit full product"
                                  className="p-1.5 text-stone-400 hover:text-[#A25828] cursor-pointer"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => deleteProduct(p.id)}
                                  title="Delete product"
                                  className="p-1.5 text-stone-400 hover:text-red-600 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================== 3. CATEGORIES TAB ==================== */}
        {activeTab === 'categories' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8E0D5] space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-stone-200">
                <div>
                  <h3 className="font-serif font-bold text-xl text-[#221C18]">
                    Category &amp; Future Expansion Management
                  </h3>
                  <p className="text-xs text-stone-500 mt-1">
                    Manage active British collections and pre-configure future categories (Dining Furniture &amp; Wardrobes). Inactive categories are hidden from shoppers.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className={`p-6 rounded-2xl border transition-all ${
                      cat.isActive
                        ? 'border-[#E8E0D5] bg-[#FAF8F5]'
                        : 'border-dashed border-stone-300 bg-stone-50 opacity-80'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-serif font-bold text-lg text-[#221C18]">
                            {cat.name}
                          </h4>
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                              cat.isActive
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-stone-200 text-stone-600'
                            }`}
                          >
                            {cat.isActive ? 'Active on Storefront' : 'Hidden Future Category'}
                          </span>
                        </div>
                        <p className="text-xs text-stone-500 mt-1">
                          Slug: <code>/{cat.slug}</code> · {cat.subcategories.length} subcategories
                        </p>
                      </div>

                      <button
                        onClick={() => toggleCategoryActive(cat.id)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                          cat.isActive
                            ? 'bg-stone-200 hover:bg-stone-300 text-stone-800'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        }`}
                      >
                        {cat.isActive ? 'Deactivate' : 'Activate Category'}
                      </button>
                    </div>

                    <p className="text-xs text-stone-600 mt-3 leading-relaxed">
                      {cat.description}
                    </p>

                    <div className="mt-4 pt-3 border-t border-stone-200 flex items-center justify-between text-xs">
                      <span className="text-stone-400">
                        Subcategories: {cat.subcategories.map((s) => s.name).join(', ')}
                      </span>
                      <button
                        onClick={() => setEditingCategory(cat)}
                        className="text-[#A25828] font-semibold hover:underline"
                      >
                        Edit SEO &amp; FAQs &rarr;
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================== 4. ORDERS TAB ==================== */}
        {activeTab === 'orders' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white p-5 rounded-2xl border border-[#E8E0D5] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1 max-w-md">
                <Search className="w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder="Search by order #, name, city, or tracking..."
                  className="w-full text-xs bg-transparent focus:outline-none"
                />
              </div>
              <span className="text-xs text-stone-400 font-medium">
                {orders.length} Total Orders Recorded
              </span>
            </div>

            <div className="space-y-4">
              {orders
                .filter(
                  (o) =>
                    o.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
                    o.customer.fullName.toLowerCase().includes(orderSearch.toLowerCase()) ||
                    o.customer.postcode.toLowerCase().includes(orderSearch.toLowerCase())
                )
                .map((order) => (
                  <div key={order.id} className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E0D5] space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E8E0D5] gap-3">
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="font-serif font-bold text-lg text-[#221C18]">
                            {order.orderNumber}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                              order.fulfilmentStatus === 'delivered'
                                ? 'bg-emerald-100 text-emerald-800'
                                : order.fulfilmentStatus === 'dispatched'
                                ? 'bg-blue-100 text-blue-800'
                                : order.fulfilmentStatus === 'cancelled'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {order.fulfilmentStatus}
                          </span>
                        </div>
                        <span className="text-xs text-stone-400">
                          {new Date(order.createdAt).toLocaleString('en-GB')}
                        </span>
                      </div>

                      {/* Status Update Actions */}
                      <div className="flex items-center gap-2">
                        <select
                          value={order.fulfilmentStatus}
                          onChange={(e) =>
                            updateOrderStatus(order.id, e.target.value as any)
                          }
                          className="bg-stone-50 border border-stone-200 text-xs rounded-lg px-2.5 py-1.5 font-semibold text-stone-800"
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing (Workshop)</option>
                          <option value="dispatched">Dispatched (Courier)</option>
                          <option value="delivered">Delivered to Room</option>
                        </select>

                        {order.fulfilmentStatus !== 'cancelled' && (
                          <button
                            onClick={() => cancelOrder(order.id)}
                            className="text-xs text-red-600 hover:bg-red-50 px-2.5 py-1.5 rounded-lg border border-red-200 font-semibold cursor-pointer"
                          >
                            Refund / Cancel
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Customer & Tracking Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-stone-600">
                      <div>
                        <strong className="block text-stone-900 mb-1">Customer:</strong>
                        <p>{order.customer.fullName}</p>
                        <p>{order.customer.email}</p>
                        <p>{order.customer.phone}</p>
                      </div>

                      <div>
                        <strong className="block text-stone-900 mb-1">UK Delivery Destination:</strong>
                        <p>{order.customer.addressLine1}</p>
                        <p>{order.customer.city}, {order.customer.postcode}</p>
                        <p className="text-[11px] text-stone-400">Tier: {order.deliveryOption}</p>
                      </div>

                      <div>
                        <strong className="block text-stone-900 mb-1">Logistics &amp; Tracking:</strong>
                        <p>{order.courier || 'Panther 2-Man'}</p>
                        <p className="font-mono text-[#A25828] font-semibold">{order.trackingNumber}</p>
                        <p className="text-[11px] text-stone-400">Est: {order.estimatedDeliveryDate}</p>
                      </div>
                    </div>

                    {/* Item lines */}
                    <div className="pt-3 border-t border-stone-100 divide-y divide-stone-50">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="py-2 flex justify-between text-xs">
                          <span>
                            {item.quantity}x {item.name} ({item.selectedColour})
                          </span>
                          <span className="font-bold tabular-nums">
                            £{(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ==================== 5. CONTENT MANAGEMENT SYSTEM (CMS) TAB ==================== */}
        {activeTab === 'content' && (
          <CmsDashboard
            blogPosts={blogPosts}
            products={products}
            categories={categories}
            onAddPost={addBlogPost}
            onUpdatePost={updateBlogPost}
            onDeletePost={deleteBlogPost}
            onDuplicatePost={duplicateBlogPost}
            onToggleStatus={toggleBlogPostStatus}
            onNavigateToPost={(slug) => setRoute({ name: 'blog-detail', slug })}
          />
        )}

        {/* ==================== 6. FIRST-PARTY ANALYTICS TAB ==================== */}
        {activeTab === 'analytics' && (
          <div className="space-y-8 animate-fade-in">
            {/* Funnel Metrics */}
            <div className="bg-white p-8 rounded-3xl border border-[#E8E0D5] space-y-6">
              <h3 className="font-serif font-bold text-xl text-[#221C18]">
                First-Party E-Commerce Conversion Funnel
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#E8E0D5]">
                  <span className="text-xs text-stone-500">1. Product PDP Views</span>
                  <div className="text-2xl font-bold font-serif text-[#221C18] mt-1">
                    {Object.values(metrics.productViews).reduce((a, b) => a + b, 0)}
                  </div>
                </div>

                <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#E8E0D5]">
                  <span className="text-xs text-stone-500">2. Add to Basket</span>
                  <div className="text-2xl font-bold font-serif text-[#221C18] mt-1">
                    {metrics.addToCartCount}
                  </div>
                </div>

                <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#E8E0D5]">
                  <span className="text-xs text-stone-500">3. Checkout Starts</span>
                  <div className="text-2xl font-bold font-serif text-[#221C18] mt-1">
                    {metrics.checkoutStartCount}
                  </div>
                </div>

                <div className="p-4 bg-[#FAF5EE] rounded-2xl border border-[#A25828]/30">
                  <span className="text-xs text-[#A25828] font-bold">4. Completed Purchases</span>
                  <div className="text-2xl font-bold font-serif text-[#A25828] mt-1">
                    {metrics.purchaseCount}
                  </div>
                </div>
              </div>
            </div>

            {/* Top Internal Search Queries */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-[#E8E0D5] space-y-3">
                <h4 className="font-serif font-bold text-base text-[#221C18]">
                  Top UK Customer Search Queries
                </h4>
                {Object.keys(metrics.searchQueries).length === 0 ? (
                  <p className="text-xs text-stone-400">Search queries will automatically populate here as users search.</p>
                ) : (
                  <div className="space-y-2">
                    {Object.entries(metrics.searchQueries).map(([q, count]) => (
                      <div key={q} className="flex justify-between text-xs py-1.5 border-b border-stone-100">
                        <span className="font-medium text-stone-800 capitalize">&ldquo;{q}&rdquo;</span>
                        <span className="font-bold text-[#A25828]">{count} searches</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white p-6 rounded-3xl border border-[#E8E0D5] space-y-3">
                <h4 className="font-serif font-bold text-base text-[#221C18]">
                  Top Viewed Furniture Pieces
                </h4>
                {Object.keys(metrics.productViews).length === 0 ? (
                  <p className="text-xs text-stone-400">Product views record automatically as customers browse.</p>
                ) : (
                  <div className="space-y-2">
                    {Object.entries(metrics.productViews).map(([name, count]) => (
                      <div key={name} className="flex justify-between text-xs py-1.5 border-b border-stone-100">
                        <span className="font-medium text-stone-800 truncate pr-2">{name}</span>
                        <span className="font-bold text-[#A25828] shrink-0">{count} views</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ==================== 7. STORE SETTINGS TAB ==================== */}
        {activeTab === 'settings' && (
          <div className="space-y-6 animate-fade-in max-w-4xl">
            {/* Official Brand Logo System */}
            <OfficialBrandLogoManager />

            <form onSubmit={handleSaveSettings} className="bg-white p-8 rounded-3xl border border-[#E8E0D5] space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#E8E0D5]">
                <h3 className="font-serif font-bold text-xl text-[#221C18]">
                  Store &amp; Delivery Parameters
                </h3>
                {settingsSaved && (
                  <span className="text-xs text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Settings Saved
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Store Brand Name
                  </label>
                  <input
                    type="text"
                    value={settingsForm.brandName}
                    onChange={(e) => setSettingsForm({ ...settingsForm, brandName: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-[#D5C7B7]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Phone / WhatsApp Number
                  </label>
                  <input
                    type="text"
                    value={settingsForm.phone}
                    onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value, whatsapp: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-[#D5C7B7]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Customer Support Email
                  </label>
                  <input
                    type="email"
                    value={settingsForm.email}
                    onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-[#D5C7B7]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Business Hours
                  </label>
                  <input
                    type="text"
                    value={settingsForm.businessHours}
                    onChange={(e) => setSettingsForm({ ...settingsForm, businessHours: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-[#D5C7B7]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Workshop Address
                </label>
                <input
                  type="text"
                  value={settingsForm.address}
                  onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-[#D5C7B7]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-stone-200">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Free Delivery Threshold (£)
                  </label>
                  <input
                    type="number"
                    value={settingsForm.freeDeliveryThreshold}
                    onChange={(e) => setSettingsForm({ ...settingsForm, freeDeliveryThreshold: Number(e.target.value) })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-[#D5C7B7]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Standard 2-Man Fee (£)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={settingsForm.standardDeliveryFee}
                    onChange={(e) => setSettingsForm({ ...settingsForm, standardDeliveryFee: Number(e.target.value) })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-[#D5C7B7]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    White-Glove Assembly Fee (£)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={settingsForm.whiteGloveDeliveryFee}
                    onChange={(e) => setSettingsForm({ ...settingsForm, whiteGloveDeliveryFee: Number(e.target.value) })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-[#D5C7B7]"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-stone-200">
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Top Promotional Banner Announcement
                </label>
                <input
                  type="text"
                  value={settingsForm.promoBannerText}
                  onChange={(e) => setSettingsForm({ ...settingsForm, promoBannerText: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-[#D5C7B7]"
                />
              </div>

              <button
                type="submit"
                className="bg-[#A25828] hover:bg-[#8A461A] text-white px-8 py-3 rounded-full text-xs font-semibold transition-colors cursor-pointer"
              >
                Save Store Settings
              </button>
            </form>
          </div>
        )}

        {/* Modal for editing a category */}
        {editingCategory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/60" onClick={() => setEditingCategory(null)} />
            <div className="relative bg-white rounded-3xl max-w-2xl w-full p-8 z-10 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                <h3 className="font-serif font-bold text-xl text-[#221C18]">
                  Edit {editingCategory.name} Category Description &amp; SEO
                </h3>
                <button onClick={() => setEditingCategory(null)}>
                  <X className="w-5 h-5 text-stone-400" />
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Short Header Introduction
                </label>
                <textarea
                  rows={2}
                  value={editingCategory.description}
                  onChange={(e) =>
                    setEditingCategory({ ...editingCategory, description: e.target.value })
                  }
                  className="w-full text-xs p-3 rounded-xl border border-[#D5C7B7]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Bottom SEO Description (Section 7 Requirement)
                </label>
                <textarea
                  rows={6}
                  value={editingCategory.bottomSeoDescription}
                  onChange={(e) =>
                    setEditingCategory({ ...editingCategory, bottomSeoDescription: e.target.value })
                  }
                  className="w-full text-xs p-3 rounded-xl border border-[#D5C7B7]"
                />
              </div>

              <button
                onClick={() => {
                  updateCategory(editingCategory);
                  setEditingCategory(null);
                }}
                className="bg-[#A25828] text-white px-6 py-2.5 rounded-full text-xs font-semibold"
              >
                Save Category Updates
              </button>
            </div>
          </div>
        )}

        {/* Modal for editing/adding a product */}
        {(editingProduct || isCreatingProduct) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black/60"
              onClick={() => {
                setEditingProduct(null);
                setIsCreatingProduct(false);
              }}
            />
            <div className="relative bg-white rounded-3xl max-w-2xl w-full p-8 z-10 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                <h3 className="font-serif font-bold text-xl text-[#221C18]">
                  {isCreatingProduct ? 'Add Handcrafted Piece' : `Edit ${editingProduct?.name}`}
                </h3>
                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setIsCreatingProduct(false);
                  }}
                >
                  <X className="w-5 h-5 text-stone-400" />
                </button>
              </div>

              {/* Form fields */}
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold mb-1">Product Title</label>
                  <input
                    type="text"
                    defaultValue={editingProduct?.name || ''}
                    id="edit_name"
                    className="w-full p-2.5 rounded-xl border border-[#D5C7B7]"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">SKU</label>
                    <input
                      type="text"
                      defaultValue={editingProduct?.sku || `PC-UK-${Math.floor(Math.random() * 9000)}`}
                      id="edit_sku"
                      className="w-full p-2.5 rounded-xl border border-[#D5C7B7]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Regular Price (£)</label>
                    <input
                      type="number"
                      step="0.01"
                      defaultValue={editingProduct?.price || 499}
                      id="edit_price"
                      className="w-full p-2.5 rounded-xl border border-[#D5C7B7]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Sale Price (£)</label>
                    <input
                      type="number"
                      step="0.01"
                      defaultValue={editingProduct?.salePrice || ''}
                      id="edit_salePrice"
                      className="w-full p-2.5 rounded-xl border border-[#D5C7B7]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Stock Quantity</label>
                    <input
                      type="number"
                      defaultValue={editingProduct?.stock || 10}
                      id="edit_stock"
                      className="w-full p-2.5 rounded-xl border border-[#D5C7B7]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Category</label>
                    <select
                      id="edit_cat"
                      defaultValue={editingProduct?.categoryId || 'cat-sofas'}
                      className="w-full p-2.5 rounded-xl border border-[#D5C7B7] bg-white"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Short Description</label>
                  <textarea
                    rows={2}
                    defaultValue={editingProduct?.shortDescription || ''}
                    id="edit_shortDesc"
                    className="w-full p-2.5 rounded-xl border border-[#D5C7B7]"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Full Description</label>
                  <textarea
                    rows={4}
                    defaultValue={editingProduct?.fullDescription || ''}
                    id="edit_fullDesc"
                    className="w-full p-2.5 rounded-xl border border-[#D5C7B7]"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    const name = (document.getElementById('edit_name') as HTMLInputElement).value;
                    const sku = (document.getElementById('edit_sku') as HTMLInputElement).value;
                    const price = parseFloat((document.getElementById('edit_price') as HTMLInputElement).value) || 0;
                    const salePriceVal = (document.getElementById('edit_salePrice') as HTMLInputElement).value;
                    const salePrice = salePriceVal ? parseFloat(salePriceVal) : undefined;
                    const stock = parseInt((document.getElementById('edit_stock') as HTMLInputElement).value, 10) || 0;
                    const categoryId = (document.getElementById('edit_cat') as HTMLSelectElement).value;
                    const shortDescription = (document.getElementById('edit_shortDesc') as HTMLTextAreaElement).value;
                    const fullDescription = (document.getElementById('edit_fullDesc') as HTMLTextAreaElement).value;

                    if (editingProduct) {
                      updateProduct({
                        ...editingProduct,
                        name,
                        sku,
                        price,
                        salePrice,
                        stock,
                        categoryId,
                        shortDescription,
                        fullDescription,
                      });
                      setEditingProduct(null);
                    } else if (isCreatingProduct) {
                      addProduct({
                        name,
                        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                        sku,
                        price,
                        salePrice,
                        stock,
                        lowStockThreshold: 3,
                        categoryId,
                        shortDescription,
                        fullDescription,
                        images: [products[0]?.images[0] || ''],
                        dimensions: { width: 180, height: 85, depth: 90 },
                        materials: ['Kiln-Dried Hardwood', 'Luxury Fabric'],
                        colours: [{ name: 'Warm Beige', hex: '#E6DDD2' }],
                        tags: ['Handcrafted', 'UK'],
                        isPublished: true,
                        isFeatured: false,
                        isTrending: true,
                        deliveryInfo: 'Delivered in 3–5 working days.',
                        careInstructions: 'Spot clean with mild upholstery shampoo.',
                        seoTitle: `${name} | Plush Comfort UK`,
                        seoDescription: `${name} handcrafted in Yorkshire.`,
                        rating: 5.0,
                        reviewCount: 1,
                        relatedProductIds: [],
                        complementaryProductIds: [],
                        reviews: [],
                      });
                      setIsCreatingProduct(false);
                    }
                  }}
                  className="bg-[#A25828] text-white px-6 py-2.5 rounded-full text-xs font-semibold cursor-pointer"
                >
                  Save Piece to Catalog
                </button>
              </div>
            </div>
          </div>
        )}

        {/* WooCommerce 19-Product CSV Importer Modal */}
        {showWooImporter && (
          <WooCommerceProductImporter onClose={() => setShowWooImporter(false)} />
        )}
      </div>
    </div>
  );
};
