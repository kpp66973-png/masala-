import React from 'react';
import { MapPin, Phone, Instagram, Heart, Clock, ShieldCheck, Mail } from 'lucide-react';
import { RestaurantSettings } from '../types.ts';

interface FooterProps {
  settings: RestaurantSettings | null;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ settings, onOpenAdmin }) => {
  const restaurantName = settings?.restaurantName || 'MASALA';
  const address = settings?.address || 'Santoshi Nagar, Kota, Rajasthan, India';
  const phone = settings?.phone || '9171863765';
  const instagramUsername = settings?.instagramUsername || 'kunal_x999';
  const instagramUrl = settings?.instagramUrl || `https://www.instagram.com/${instagramUsername}/`;

  return (
    <footer className="bg-stone-950 border-t border-stone-800/80 text-stone-400 text-xs pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-stone-800">
          {/* Col 1: Brand & Philosophy */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center font-serif font-black text-amber-400 text-xl">
                M
              </div>
              <span className="font-serif font-bold text-2xl tracking-wider text-amber-400 uppercase">
                {restaurantName}
              </span>
            </div>
            <p className="text-stone-400 leading-relaxed text-xs">
              Authentic Rajasthani and North Indian culinary traditions crafted with slow-simmered gravies, hand-roasted masala blends, and live clay-oven tandoor techniques.
            </p>
            <div className="flex items-center gap-2 text-stone-500 text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
              <span>Registered Food Business • Kota</span>
            </div>
          </div>

          {/* Col 2: Restaurant Address & Contact (Dynamic DB) */}
          <div className="space-y-3">
            <h4 className="font-bold text-stone-200 text-sm tracking-wide uppercase font-serif">
              Visit & Contact
            </h4>
            <div className="space-y-2.5">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span className="text-stone-300 leading-relaxed">{address}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <a
                  href={`tel:${phone}`}
                  className="text-stone-300 hover:text-amber-400 font-semibold transition"
                >
                  +91 {phone}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Instagram className="w-4 h-4 text-pink-500 shrink-0" />
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-stone-300 hover:text-pink-400 font-medium transition"
                >
                  @{instagramUsername}
                </a>
              </div>
            </div>
          </div>

          {/* Col 3: Hours & Service */}
          <div className="space-y-3">
            <h4 className="font-bold text-stone-200 text-sm tracking-wide uppercase font-serif">
              Kitchen Hours
            </h4>
            <div className="space-y-2 text-stone-300">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>Monday – Sunday</span>
              </div>
              <p className="text-stone-400 pl-5 text-[11px]">
                11:30 AM – 11:00 PM <br />
                Lunch, Evening Tandoor & Late Night Dinner
              </p>
              <div className="pt-2">
                <span className="inline-block px-2.5 py-1 rounded bg-amber-950/60 border border-amber-800/60 text-amber-300 font-medium text-[11px]">
                  Fast Delivery Across Kota
                </span>
              </div>
            </div>
          </div>

          {/* Col 4: Quick Links & Admin */}
          <div className="space-y-3">
            <h4 className="font-bold text-stone-200 text-sm tracking-wide uppercase font-serif">
              Quick Management
            </h4>
            <div className="space-y-2">
              <button
                onClick={onOpenAdmin}
                className="block text-stone-400 hover:text-amber-400 transition"
              >
                Admin Control Dashboard
              </button>
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-stone-400 hover:text-amber-400 transition"
              >
                Instagram Story & Reviews
              </a>
              <div className="pt-2 text-[11px] text-stone-500 leading-relaxed">
                Powered by PostgreSQL Cloud Database, Express REST APIs, and Razorpay payment architecture.
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-stone-500 text-[11px]">
          <p>© {new Date().getFullYear()} {restaurantName} Kota. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Handcrafted with</span>
            <Heart className="w-3 h-3 text-amber-500 fill-amber-500" />
            <span>in Kota, Rajasthan</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
