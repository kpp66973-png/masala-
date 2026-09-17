import React, { useEffect, useState } from 'react';
import { AuthProvider } from './context/AuthContext.tsx';
import { CartProvider, useCart } from './context/CartContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { HeroSection } from './components/HeroSection.tsx';
import { MenuSection } from './components/MenuSection.tsx';
import { CartDrawer } from './components/CartDrawer.tsx';
import { CheckoutModal } from './components/CheckoutModal.tsx';
import { OrderConfirmationModal } from './components/OrderConfirmationModal.tsx';
import { CustomerOrdersModal } from './components/CustomerOrdersModal.tsx';
import { AdminDashboard } from './components/AdminDashboard.tsx';
import { Footer } from './components/Footer.tsx';
import { getSettings, getCategories, getProducts } from './api.ts';
import { RestaurantSettings, Category, Product, Order } from './types.ts';
import { ShoppingBag } from 'lucide-react';

function RestaurantApp() {
  const { itemCount, subtotal, setIsOpen: setCartOpen } = useCart();

  // Database State
  const [settings, setSettings] = useState<RestaurantSettings | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  const fetchAppData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [fetchedSettings, fetchedCategories, fetchedProducts] = await Promise.all([
        getSettings(),
        getCategories(),
        getProducts(false),
      ]);
      setSettings(fetchedSettings);
      setCategories(fetchedCategories);
      setProducts(fetchedProducts);
    } catch (err: any) {
      console.error('Failed to load restaurant data from database API:', err);
      setError(
        err.message || 'Unable to connect to database backend. Please check network connectivity.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppData();
  }, []);

  const handleOrderSuccess = (order: Order) => {
    setIsCheckoutOpen(false);
    setPlacedOrder(order);
  };

  const handleExploreMenu = () => {
    const el = document.getElementById('menu-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 flex flex-col selection:bg-amber-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        settings={settings}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenMyOrders={() => setIsOrdersOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        <HeroSection settings={settings} onExploreMenu={handleExploreMenu} />

        <MenuSection
          products={products}
          categories={categories}
          loading={loading}
          error={error}
          onRetry={fetchAppData}
        />
      </main>

      {/* Footer with Dynamic Address, Phone, and Instagram */}
      <Footer settings={settings} onOpenAdmin={() => setIsAdminOpen(true)} />

      {/* Slide-out Cart Drawer */}
      <CartDrawer
        settings={settings}
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        settings={settings}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* Order Confirmation Screen */}
      <OrderConfirmationModal
        order={placedOrder}
        settings={settings}
        onClose={() => setPlacedOrder(null)}
        onViewAllOrders={() => {
          setPlacedOrder(null);
          setIsOrdersOpen(true);
        }}
      />

      {/* Customer Previous Orders Modal */}
      <CustomerOrdersModal
        isOpen={isOrdersOpen}
        onClose={() => setIsOrdersOpen(false)}
      />

      {/* Comprehensive Admin Dashboard */}
      <AdminDashboard
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        onSettingsUpdated={(updatedSettings) => setSettings(updatedSettings)}
        onProductsUpdated={fetchAppData}
      />

      {/* Mobile Floating Sticky Cart Bar (when basket is not empty) */}
      {itemCount > 0 && !isCheckoutOpen && !isAdminOpen && (
        <div className="sm:hidden fixed bottom-4 left-4 right-4 z-30">
          <button
            onClick={() => setCartOpen(true)}
            className="w-full py-3.5 px-5 bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl text-stone-950 font-bold shadow-2xl flex items-center justify-between shadow-amber-950/60"
            id="mobile-floating-cart-btn"
          >
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5" />
              <span>{itemCount} {itemCount === 1 ? 'item' : 'items'} in basket</span>
            </div>
            <div className="font-mono text-base font-black">
              View Cart (₹{subtotal})
            </div>
          </button>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <RestaurantApp />
      </CartProvider>
    </AuthProvider>
  );
}
