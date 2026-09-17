import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  LogOut,
  Utensils,
  FolderPlus,
  ShoppingBag,
  Users,
  Store,
  Plus,
  Trash2,
  Edit2,
  Check,
  AlertCircle,
  RefreshCw,
  Save,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import {
  getSettings,
  updateSettings,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getAllOrders,
  updateOrderStatus,
  getAllCustomers,
} from '../api.ts';
import { RestaurantSettings, Category, Product, Order, UserProfile } from '../types.ts';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsUpdated: (settings: RestaurantSettings) => void;
  onProductsUpdated: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  onClose,
  onSettingsUpdated,
  onProductsUpdated,
}) => {
  const { isAdmin, loginWithAdminKey, logoutAdmin, getIdToken } = useAuth();

  // Admin login passcode state
  const [passcode, setPasscode] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'settings' | 'products' | 'categories' | 'orders' | 'customers'>('settings');

  // Data states
  const [settings, setSettings] = useState<RestaurantSettings | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<UserProfile[]>([]);

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Modals inside Admin
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    category: 'Curries',
    price: 220,
    imageUrl: '',
    vegOrNonveg: 'veg' as 'veg' | 'non-veg',
    available: true,
  });

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    slug: '',
    description: '',
    displayOrder: 1,
  });

  // Fetch all admin data
  const loadAdminData = async () => {
    if (!isAdmin) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const token = await getIdToken();
      const [s, c, p, o, u] = await Promise.all([
        getSettings(),
        getCategories(),
        getProducts(false),
        getAllOrders(token),
        getAllCustomers(token),
      ]);
      setSettings(s);
      setCategories(c);
      setProducts(p);
      setOrders(o);
      setCustomers(u);
    } catch (err: any) {
      console.error('Failed to load admin data:', err);
      setErrorMsg(err.message || 'Error communicating with database');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && isAdmin) {
      loadAdminData();
    }
  }, [isOpen, isAdmin]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    const ok = await loginWithAdminKey(passcode);
    if (!ok) {
      setLoginError('Incorrect admin passcode. Try: masala_admin_2026');
    } else {
      setPasscode('');
    }
  };

  // 1. Settings Save
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const token = await getIdToken();
      const res = await updateSettings(settings, token);
      if (res.success) {
        setSettings(res.settings);
        onSettingsUpdated(res.settings);
        setSuccessMsg('Restaurant settings saved permanently to database!');
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update settings in database');
    }
  };

  // 2. Product Management
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      description: '',
      category: categories[0]?.name || 'Curries',
      price: 200,
      imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
      vegOrNonveg: 'veg',
      available: true,
    });
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setProductForm({
      name: prod.name,
      description: prod.description,
      category: prod.category,
      price: prod.price,
      imageUrl: prod.imageUrl,
      vegOrNonveg: prod.vegOrNonveg,
      available: prod.available,
    });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      const token = await getIdToken();
      if (editingProduct) {
        await updateProduct(editingProduct.id, productForm, token);
        setSuccessMsg(`Updated "${productForm.name}" in database!`);
      } else {
        await createProduct(productForm, token);
        setSuccessMsg(`Added new item "${productForm.name}" to database!`);
      }
      setIsProductModalOpen(false);
      onProductsUpdated();
      loadAdminData();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save product in database');
    }
  };

  const handleToggleProductAvailability = async (prod: Product) => {
    try {
      const token = await getIdToken();
      await updateProduct(prod.id, { available: !prod.available }, token);
      onProductsUpdated();
      loadAdminData();
    } catch (err: any) {
      setErrorMsg('Failed to update availability: ' + err.message);
    }
  };

  const handleDeleteProduct = async (prod: Product) => {
    if (!confirm(`Are you sure you want to remove "${prod.name}" from the database?`)) return;
    try {
      const token = await getIdToken();
      await deleteProduct(prod.id, token);
      onProductsUpdated();
      loadAdminData();
      setSuccessMsg(`Deleted "${prod.name}" from database.`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg('Failed to delete product: ' + err.message);
    }
  };

  // 3. Category Management
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      const token = await getIdToken();
      await createCategory(categoryForm, token);
      setIsCategoryModalOpen(false);
      loadAdminData();
      onProductsUpdated();
      setSuccessMsg(`Category "${categoryForm.name}" added to database!`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to add category');
    }
  };

  const handleDeleteCategory = async (cat: Category) => {
    if (!confirm(`Delete category "${cat.name}"? Existing products under it may need recategorization.`)) return;
    try {
      const token = await getIdToken();
      await deleteCategory(cat.id, token);
      loadAdminData();
      onProductsUpdated();
    } catch (err: any) {
      setErrorMsg('Failed to delete category: ' + err.message);
    }
  };

  // 4. Order Status Updates
  const handleChangeOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      const token = await getIdToken();
      await updateOrderStatus(orderId, newStatus, token);
      loadAdminData();
      setSuccessMsg(`Order #${orderId} status updated to ${newStatus}`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg('Failed to update order status: ' + err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
      <div className="relative w-full max-w-6xl bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-stone-800 flex items-center justify-between bg-stone-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-stone-100 flex items-center gap-2">
                <span>MASALA Restaurant Control Center</span>
                <span className="text-[11px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded font-mono">
                  Admin DB
                </span>
              </h3>
              <p className="text-xs text-stone-400">
                Santoshi Nagar, Kota • Live PostgreSQL Database Synchronized
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAdmin && (
              <button
                onClick={logoutAdmin}
                className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-rose-400 border border-stone-800 px-3 py-1.5 rounded-lg transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Lock Admin</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-stone-200 flex items-center justify-center transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Auth Gate: If not authenticated as Admin */}
        {!isAdmin ? (
          <div className="p-8 sm:p-12 text-center max-w-md mx-auto space-y-6">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Lock className="w-8 h-8" />
            </div>

            <div>
              <h4 className="font-serif font-bold text-2xl text-stone-100">Restaurant Admin Login</h4>
              <p className="text-xs text-stone-400 mt-1">
                Enter your administrative key to manage live menus, prices, restaurant info, and orders.
              </p>
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Admin Passcode
                </label>
                <input
                  type="password"
                  required
                  placeholder="Enter passcode (default: masala_admin_2026)"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  className="w-full px-4 py-3 bg-stone-800 border border-stone-700 rounded-xl text-sm text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              {loginError && (
                <p className="text-xs text-rose-400 font-medium">{loginError}</p>
              )}

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-sm shadow-lg shadow-amber-900/30 transition"
                id="admin-login-submit"
              >
                Access Control Panel
              </button>
            </form>
          </div>
        ) : (
          /* Authenticated Admin Workspace */
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Nav Tabs */}
            <div className="flex items-center gap-2 border-b border-stone-800 px-6 bg-stone-900/50 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setActiveTab('settings')}
                className={`py-3 px-3 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition ${
                  activeTab === 'settings'
                    ? 'border-amber-500 text-amber-400'
                    : 'border-transparent text-stone-400 hover:text-stone-200'
                }`}
              >
                <Store className="w-4 h-4" />
                <span>Restaurant Info</span>
              </button>

              <button
                onClick={() => setActiveTab('products')}
                className={`py-3 px-3 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition ${
                  activeTab === 'products'
                    ? 'border-amber-500 text-amber-400'
                    : 'border-transparent text-stone-400 hover:text-stone-200'
                }`}
              >
                <Utensils className="w-4 h-4" />
                <span>Menu Products ({products.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('categories')}
                className={`py-3 px-3 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition ${
                  activeTab === 'categories'
                    ? 'border-amber-500 text-amber-400'
                    : 'border-transparent text-stone-400 hover:text-stone-200'
                }`}
              >
                <FolderPlus className="w-4 h-4" />
                <span>Categories ({categories.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('orders')}
                className={`py-3 px-3 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition ${
                  activeTab === 'orders'
                    ? 'border-amber-500 text-amber-400'
                    : 'border-transparent text-stone-400 hover:text-stone-200'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Orders ({orders.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('customers')}
                className={`py-3 px-3 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition ${
                  activeTab === 'customers'
                    ? 'border-amber-500 text-amber-400'
                    : 'border-transparent text-stone-400 hover:text-stone-200'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Customers ({customers.length})</span>
              </button>
            </div>

            {/* Notifications */}
            {successMsg && (
              <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{successMsg}</span>
              </div>
            )}
            {errorMsg && (
              <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Tab Panes */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* TAB 1: RESTAURANT INFO */}
              {activeTab === 'settings' && settings && (
                <form onSubmit={handleSaveSettings} className="max-w-2xl space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-300 mb-1">
                        Restaurant Name
                      </label>
                      <input
                        type="text"
                        value={settings.restaurantName}
                        onChange={(e) => setSettings({ ...settings, restaurantName: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-sm text-stone-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-300 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        value={settings.phone}
                        onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-sm text-stone-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">
                      Full Address
                    </label>
                    <input
                      type="text"
                      value={settings.address}
                      onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-sm text-stone-100"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-300 mb-1">
                        Instagram Username
                      </label>
                      <input
                        type="text"
                        value={settings.instagramUsername}
                        onChange={(e) => setSettings({ ...settings, instagramUsername: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-sm text-stone-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-300 mb-1">
                        Instagram URL
                      </label>
                      <input
                        type="url"
                        value={settings.instagramUrl}
                        onChange={(e) => setSettings({ ...settings, instagramUrl: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-sm text-stone-100"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-300 mb-1">
                        Delivery Charge (₹)
                      </label>
                      <input
                        type="number"
                        value={settings.deliveryFee}
                        onChange={(e) => setSettings({ ...settings, deliveryFee: Number(e.target.value) })}
                        className="w-full px-3.5 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-sm text-stone-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-300 mb-1">
                        Minimum Order (₹)
                      </label>
                      <input
                        type="number"
                        value={settings.minOrder}
                        onChange={(e) => setSettings({ ...settings, minOrder: Number(e.target.value) })}
                        className="w-full px-3.5 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-sm text-stone-100"
                      />
                    </div>
                    <div className="flex items-center gap-3 pt-6">
                      <input
                        type="checkbox"
                        id="is-kitchen-open"
                        checked={settings.isOpen}
                        onChange={(e) => setSettings({ ...settings, isOpen: e.target.checked })}
                        className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500"
                      />
                      <label htmlFor="is-kitchen-open" className="text-xs font-semibold text-stone-200 cursor-pointer">
                        Kitchen Open for Orders
                      </label>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-sm flex items-center gap-2 shadow-lg shadow-amber-900/30 transition"
                      id="save-settings-btn"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Restaurant Info to Database</span>
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 2: PRODUCTS */}
              {activeTab === 'products' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-stone-400">
                      Manage food items, pricing, pictures, and availability stored in PostgreSQL.
                    </p>
                    <button
                      onClick={handleOpenAddProduct}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition"
                      id="admin-add-product-btn"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Food Product</span>
                    </button>
                  </div>

                  <div className="border border-stone-800 rounded-xl overflow-hidden bg-stone-900/60">
                    <table className="w-full text-left text-xs text-stone-300">
                      <thead className="bg-stone-800/80 text-stone-400 uppercase tracking-wider font-semibold border-b border-stone-700">
                        <tr>
                          <th className="p-3">Dish</th>
                          <th className="p-3">Category</th>
                          <th className="p-3">Price</th>
                          <th className="p-3">Type</th>
                          <th className="p-3">Status</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-800">
                        {products.map((prod) => (
                          <tr key={prod.id} className="hover:bg-stone-800/40">
                            <td className="p-3 flex items-center gap-3">
                              <img
                                src={prod.imageUrl}
                                alt=""
                                className="w-10 h-10 rounded-lg object-cover bg-stone-950 shrink-0"
                              />
                              <div>
                                <p className="font-bold text-stone-100">{prod.name}</p>
                                <p className="text-[11px] text-stone-400 truncate max-w-xs">{prod.description}</p>
                              </div>
                            </td>
                            <td className="p-3 font-medium">{prod.category}</td>
                            <td className="p-3 font-mono font-bold text-amber-400">₹{prod.price}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                prod.vegOrNonveg === 'veg' ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'
                              }`}>
                                {prod.vegOrNonveg}
                              </span>
                            </td>
                            <td className="p-3">
                              <button
                                onClick={() => handleToggleProductAvailability(prod)}
                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition ${
                                  prod.available
                                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                    : 'bg-stone-800 text-stone-400 border border-stone-700'
                                }`}
                              >
                                {prod.available ? 'Available' : 'Sold Out'}
                              </button>
                            </td>
                            <td className="p-3 text-right space-x-2">
                              <button
                                onClick={() => handleOpenEditProduct(prod)}
                                className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-400 transition"
                                title="Edit"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(prod)}
                                className="p-1.5 rounded-lg bg-stone-800 hover:bg-rose-900/60 text-rose-400 transition"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 3: CATEGORIES */}
              {activeTab === 'categories' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-stone-400">
                      Organize the food catalog into navigational sections.
                    </p>
                    <button
                      onClick={() => setIsCategoryModalOpen(true)}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Category</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {categories.map((cat) => (
                      <div
                        key={cat.id}
                        className="p-4 rounded-xl bg-stone-800/60 border border-stone-700 flex items-center justify-between"
                      >
                        <div>
                          <h5 className="font-bold text-stone-100 text-sm">{cat.name}</h5>
                          <p className="text-[11px] text-stone-400">Slug: {cat.slug}</p>
                          <p className="text-[10px] text-stone-500">Order: {cat.displayOrder}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteCategory(cat)}
                          className="p-2 text-stone-500 hover:text-rose-400 transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: ORDERS */}
              {activeTab === 'orders' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-stone-400">
                      Live customer orders registered in database. Update statuses as orders progress.
                    </p>
                    <button
                      onClick={loadAdminData}
                      className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg text-xs flex items-center gap-1.5 transition"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Refresh</span>
                    </button>
                  </div>

                  {orders.length === 0 ? (
                    <div className="text-center py-12 bg-stone-800/20 rounded-xl border border-stone-800">
                      <p className="text-stone-400 text-sm">No orders recorded yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {orders.map((ord) => (
                        <div
                          key={ord.id}
                          className="p-4 rounded-xl bg-stone-800/60 border border-stone-700 space-y-3 text-xs"
                        >
                          <div className="flex flex-wrap justify-between items-center gap-2">
                            <div>
                              <span className="font-mono font-bold text-amber-400 text-sm">
                                {ord.orderNumber}
                              </span>
                              <span className="text-stone-400 text-[11px] ml-3">
                                {ord.createdAt ? new Date(ord.createdAt).toLocaleString() : ''}
                              </span>
                            </div>

                            {/* Status Changer */}
                            <div className="flex items-center gap-2">
                              <label className="text-stone-400 font-medium">Status:</label>
                              <select
                                value={ord.orderStatus}
                                onChange={(e) => handleChangeOrderStatus(ord.id, e.target.value)}
                                className="px-2.5 py-1 bg-stone-900 border border-stone-700 rounded-lg text-xs font-bold text-amber-400 focus:outline-none"
                              >
                                <option value="received">received</option>
                                <option value="confirmed">confirmed</option>
                                <option value="preparing">preparing</option>
                                <option value="out_for_delivery">out_for_delivery</option>
                                <option value="delivered">delivered</option>
                                <option value="cancelled">cancelled</option>
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-stone-300 py-1">
                            <div>
                              <span className="text-stone-500 block">Customer:</span>
                              <span className="font-semibold">{ord.customerName}</span> ({ord.customerPhone})
                            </div>
                            <div>
                              <span className="text-stone-500 block">Delivery To:</span>
                              <span className="font-medium truncate block">{ord.deliveryAddress}</span>
                            </div>
                            <div>
                              <span className="text-stone-500 block">Billing & Payment:</span>
                              <span className="font-mono font-bold text-amber-400">₹{ord.totalAmount}</span>
                              <span className="text-stone-400 ml-2 uppercase">({ord.paymentMethod} - {ord.paymentStatus})</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: CUSTOMERS */}
              {activeTab === 'customers' && (
                <div className="space-y-4">
                  <p className="text-xs text-stone-400">
                    Registered customer profiles saved permanently in PostgreSQL.
                  </p>
                  <div className="border border-stone-800 rounded-xl overflow-hidden bg-stone-900/60">
                    <table className="w-full text-left text-xs text-stone-300">
                      <thead className="bg-stone-800/80 text-stone-400 uppercase tracking-wider font-semibold border-b border-stone-700">
                        <tr>
                          <th className="p-3">Customer</th>
                          <th className="p-3">Email</th>
                          <th className="p-3">Phone</th>
                          <th className="p-3">Saved Address</th>
                          <th className="p-3">Role</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-800">
                        {customers.map((c) => (
                          <tr key={c.uid} className="hover:bg-stone-800/40">
                            <td className="p-3 font-semibold text-stone-100">{c.name || 'Anonymous'}</td>
                            <td className="p-3 text-stone-300">{c.email}</td>
                            <td className="p-3 text-stone-400">{c.phone || '—'}</td>
                            <td className="p-3 text-stone-400 truncate max-w-xs">{c.address || '—'}</td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-stone-800 text-stone-300">
                                {c.role || 'customer'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* MODAL: ADD/EDIT PRODUCT */}
        {isProductModalOpen && (
          <div className="fixed inset-0 z-60 bg-stone-950/80 flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-stone-900 border border-stone-700 rounded-2xl shadow-2xl p-6 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-stone-800">
                <h4 className="font-bold text-stone-100 text-base">
                  {editingProduct ? 'Edit Food Product' : 'Add New Food Product'}
                </h4>
                <button
                  onClick={() => setIsProductModalOpen(false)}
                  className="text-stone-400 hover:text-stone-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-stone-300 mb-1">Dish Name *</label>
                  <input
                    type="text"
                    required
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-stone-100"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-300 mb-1">Description *</label>
                  <textarea
                    rows={2}
                    required
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-stone-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-stone-300 mb-1">Category *</label>
                    <select
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-stone-100"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-300 mb-1">Price (₹) *</label>
                    <input
                      type="number"
                      required
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-stone-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-stone-300 mb-1">Image URL (Cloud/Storage URL) *</label>
                  <input
                    type="url"
                    required
                    value={productForm.imageUrl}
                    onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-stone-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block font-semibold text-stone-300 mb-1">Diet Type</label>
                    <select
                      value={productForm.vegOrNonveg}
                      onChange={(e) => setProductForm({ ...productForm, vegOrNonveg: e.target.value as any })}
                      className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-stone-100"
                    >
                      <option value="veg">Pure Vegetarian</option>
                      <option value="non-veg">Non-Vegetarian</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      id="item-available"
                      checked={productForm.available}
                      onChange={(e) => setProductForm({ ...productForm, available: e.target.checked })}
                      className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500"
                    />
                    <label htmlFor="item-available" className="font-semibold text-stone-200 cursor-pointer">
                      Available on Menu
                    </label>
                  </div>
                </div>

                <div className="flex gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsProductModalOpen(false)}
                    className="flex-1 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl"
                  >
                    Save to Database
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: ADD CATEGORY */}
        {isCategoryModalOpen && (
          <div className="fixed inset-0 z-60 bg-stone-950/80 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-stone-900 border border-stone-700 rounded-2xl shadow-2xl p-6 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-stone-800">
                <h4 className="font-bold text-stone-100 text-base">Add New Category</h4>
                <button
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="text-stone-400 hover:text-stone-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveCategory} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-stone-300 mb-1">Category Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Desserts"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({
                      ...categoryForm,
                      name: e.target.value,
                      slug: e.target.value.toLowerCase().replace(/\s+/g, '-'),
                    })}
                    className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-stone-100"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-300 mb-1">Slug *</label>
                  <input
                    type="text"
                    required
                    value={categoryForm.slug}
                    onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-stone-100"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-300 mb-1">Display Order</label>
                  <input
                    type="number"
                    value={categoryForm.displayOrder}
                    onChange={(e) => setCategoryForm({ ...categoryForm, displayOrder: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-stone-100"
                  />
                </div>

                <div className="flex gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsCategoryModalOpen(false)}
                    className="flex-1 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl"
                  >
                    Add Category
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
