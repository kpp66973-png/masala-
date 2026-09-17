import React from 'react';
import { Sparkles, Phone, MapPin, Instagram, ArrowDown, ShieldCheck, Flame } from 'lucide-react';
import { RestaurantSettings } from '../types.ts';

interface HeroSectionProps {
  settings: RestaurantSettings | null;
  onExploreMenu: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ settings, onExploreMenu }) => {
  const restaurantName = settings?.restaurantName || 'MASALA';
  const address = settings?.address || 'Santoshi Nagar, Kota, Rajasthan, India';
  const phone = settings?.phone || '9171863765';
  const instagramUsername = settings?.instagramUsername || 'kunal_x999';
  const instagramUrl = settings?.instagramUrl || `https://www.instagram.com/${instagramUsername}/`;
  const deliveryFee = settings?.deliveryFee ?? 40;
  const minOrder = settings?.minOrder ?? 150;

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-stone-900 via-stone-900 to-stone-950 pt-8 pb-16 border-b border-stone-800">
      {/* Subtle decorative glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-64 bg-amber-600/10 blur-3xl pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Story & Info */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Authentic Kota & North Indian Tandoor Cuisine</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-stone-100 leading-tight">
              Pure Spice. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 font-serif italic">
                Real Tradition.
              </span>
            </h1>

            <p className="text-stone-300 text-base sm:text-lg max-w-xl leading-relaxed">
              Welcome to <span className="font-semibold text-amber-300">{restaurantName}</span>. Serving handcrafted Dal Baati Churma, slow-cooked gravies, charred clay-oven tandoori delights, and aromatic dum biryanis right in Santoshi Nagar, Kota.
            </p>

            {/* Quick Meta Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 max-w-xl">
              <div className="p-3 rounded-xl bg-stone-800/60 border border-stone-700/50">
                <span className="text-[11px] uppercase tracking-wider text-stone-400 block font-medium">Location</span>
                <p className="text-sm font-semibold text-stone-200 truncate" title={address}>
                  Santoshi Nagar, Kota
                </p>
              </div>
              <div className="p-3 rounded-xl bg-stone-800/60 border border-stone-700/50">
                <span className="text-[11px] uppercase tracking-wider text-stone-400 block font-medium">Delivery Charge</span>
                <p className="text-sm font-semibold text-stone-200">
                  ₹{deliveryFee} (Min ₹{minOrder})
                </p>
              </div>
              <div className="p-3 rounded-xl bg-stone-800/60 border border-stone-700/50">
                <span className="text-[11px] uppercase tracking-wider text-stone-400 block font-medium">Direct Kitchen Call</span>
                <p className="text-sm font-semibold text-amber-400">
                  {phone}
                </p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <button
                onClick={onExploreMenu}
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-sm sm:text-base flex items-center gap-2 shadow-lg shadow-amber-900/40 hover:scale-[1.02] active:scale-[0.98] transition"
                id="hero-explore-menu-btn"
              >
                <span>Order From Live Menu</span>
                <ArrowDown className="w-4 h-4" />
              </button>

              <a
                href={`tel:${phone}`}
                className="px-5 py-3.5 rounded-xl bg-stone-800/80 hover:bg-stone-800 border border-stone-700 text-stone-200 font-semibold text-sm flex items-center gap-2 transition hover:border-amber-500/50"
                id="hero-call-btn"
              >
                <Phone className="w-4 h-4 text-amber-400" />
                <span>Call {phone}</span>
              </a>

              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-3.5 rounded-xl bg-stone-800/80 hover:bg-stone-800 border border-stone-700 text-stone-300 hover:text-pink-400 text-sm flex items-center gap-2 transition"
                id="hero-instagram-btn"
              >
                <Instagram className="w-4 h-4 text-pink-500" />
                <span>@{instagramUsername}</span>
              </a>
            </div>
          </div>

          {/* Right Column: Visual Spotlight */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Outer decorative ring */}
              <div className="aspect-[4/3] rounded-2xl overflow-hidden border-2 border-stone-700/60 shadow-2xl relative group">
                <img
                  src="https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=1000&q=80"
                  alt="Authentic Indian Curry & Breads at MASALA"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/30 to-transparent" />

                <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-stone-900/90 backdrop-blur-md border border-stone-700/70">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1 text-xs text-amber-400 font-semibold">
                        <Flame className="w-3.5 h-3.5 text-amber-500" />
                        <span>Freshly Prepared to Order</span>
                      </div>
                      <p className="text-sm font-bold text-stone-100">Handcrafted Gravies & Tandoor</p>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-2.5 py-1 rounded-full font-medium">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>100% Hygienic</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
