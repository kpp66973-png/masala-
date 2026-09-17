import React, { useState } from 'react';
import { ShoppingBag, User as UserIcon, Phone, MapPin, Shield, LogOut, Clock, ChevronDown } from 'lucide-react';
import { useCart } from '../context/CartContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { RestaurantSettings } from '../types.ts';

interface NavbarProps {
  settings: RestaurantSettings | null;
  onOpenAdmin: () => void;
  onOpenMyOrders: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  onOpenAdmin,
  onOpenMyOrders,
}) => {
  const { itemCount, subtotal, setIsOpen } = useCart();
  const { currentUser, signInWithGoogle, signOut, isAdmin } = useAuth();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const restaurantName = settings?.restaurantName || 'MASALA';
  const phone = settings?.phone || '9171863765';
  const address = settings?.address || 'Santoshi Nagar, Kota, Rajasthan';

  return (
    <header className="sticky top-0 z-40 bg-stone-900/95 backdrop-blur-md border-b border-stone-800">
      {/* Top micro-bar with live phone and location */}
      <div className="bg-gradient-to-r from-amber-950/60 via-stone-900 to-amber-950/60 border-b border-stone-800/80 px-4 py-1.5 text-xs text-stone-300">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-4">
            <a
              href={`tel:${phone}`}
              className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 transition"
              id="header-phone-link"
            >
              <Phone className="w-3.5 h-3.5 text-amber-500" />
              <span className="font-semibold">+91 {phone}</span>
            </a>
            <span className="hidden sm:inline text-stone-600">|</span>
            <div className="hidden sm:flex items-center gap-1.5 text-stone-400">
              <MapPin className="w-3.5 h-3.5 text-amber-500/80" />
              <span>{address}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {settings && (
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${
                settings.isOpen ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/50' : 'bg-rose-950/80 text-rose-400 border border-rose-800/50'
              }`}>
                <Clock className="w-3 h-3" />
                {settings.isOpen ? 'Kitchen Open • Delivering' : 'Currently Closed'}
              </span>
            )}
            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-1 text-[11px] text-stone-400 hover:text-amber-400 border border-stone-800 hover:border-amber-500/50 px-2 py-0.5 rounded transition"
              id="admin-dashboard-btn"
            >
              <Shield className="w-3 h-3 text-amber-500" />
              <span>Admin Panel</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        {/* Brand logo */}
        <a href="#" className="flex items-center gap-3 group" id="brand-logo-link">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-600 to-amber-700 p-0.5 shadow-lg shadow-amber-900/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-stone-950 rounded-[10px] flex items-center justify-center border border-amber-500/30">
              <span className="font-serif font-black text-2xl text-amber-400 tracking-tight">M</span>
            </div>
          </div>
          <div>
            <span className="font-serif font-bold text-2xl sm:text-3xl tracking-wider text-amber-400 uppercase">
              {restaurantName}
            </span>
            <span className="block text-[10px] uppercase tracking-[0.2em] text-stone-400 font-medium -mt-1">
              Kota • Authentic Taste
            </span>
          </div>
        </a>

        {/* Action Controls */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* User Account / Login */}
          <div className="relative">
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-stone-800/80 hover:bg-stone-800 border border-stone-700/60 text-sm transition"
                  id="user-profile-menu-btn"
                >
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                    {currentUser.displayName?.[0] || currentUser.email?.[0] || 'U'}
                  </div>
                  <span className="hidden md:inline font-medium text-stone-200 truncate max-w-[120px]">
                    {currentUser.displayName || currentUser.email?.split('@')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-stone-900 border border-stone-700 rounded-xl shadow-2xl py-2 z-50">
                    <div className="px-4 py-2 border-b border-stone-800">
                      <p className="text-xs text-stone-400">Signed in as</p>
                      <p className="text-sm font-semibold text-stone-200 truncate">{currentUser.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onOpenMyOrders();
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-stone-300 hover:bg-stone-800 flex items-center gap-2 transition"
                      id="dropdown-my-orders-btn"
                    >
                      <ShoppingBag className="w-4 h-4 text-amber-400" />
                      <span>My Previous Orders</span>
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onOpenAdmin();
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-amber-400 hover:bg-stone-800 flex items-center gap-2 transition"
                      >
                        <Shield className="w-4 h-4 text-amber-400" />
                        <span>Manage Restaurant</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        signOut();
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-rose-400 hover:bg-stone-800 flex items-center gap-2 transition"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => signInWithGoogle()}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-stone-800/80 hover:bg-stone-700 border border-stone-700 text-stone-200 text-xs sm:text-sm font-medium transition"
                id="google-signin-btn"
              >
                <UserIcon className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}
          </div>

          {/* Cart Trigger */}
          <button
            onClick={() => setIsOpen(true)}
            className="relative flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-bold shadow-lg shadow-amber-900/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            id="open-cart-btn"
          >
            <ShoppingBag className="w-5 h-5" />
            <span className="hidden sm:inline">Cart</span>
            {itemCount > 0 && (
              <span className="flex items-center justify-center bg-stone-950 text-amber-400 text-xs font-black px-2 py-0.5 rounded-full min-w-[20px]">
                {itemCount}
              </span>
            )}
            {subtotal > 0 && (
              <span className="hidden md:inline font-mono font-bold text-stone-900 border-l border-amber-700/50 pl-2">
                ₹{subtotal}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
