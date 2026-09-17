import React, { useState } from 'react';
import { Search, Plus, Minus, Check, AlertCircle, RefreshCw, Sparkles } from 'lucide-react';
import { Product, Category } from '../types.ts';
import { useCart } from '../context/CartContext.tsx';

interface MenuSectionProps {
  products: Product[];
  categories: Category[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

export const MenuSection: React.FC<MenuSectionProps> = ({
  products,
  categories,
  loading,
  error,
  onRetry,
}) => {
  const { items, addItem, updateQuantity } = useCart();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [dietFilter, setDietFilter] = useState<'all' | 'veg' | 'non-veg'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter products based on category, dietary preference, and search term
  const filteredProducts = products.filter((prod) => {
    const matchesCategory =
      selectedCategory === 'all' ||
      prod.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesDiet =
      dietFilter === 'all' || prod.vegOrNonveg.toLowerCase() === dietFilter;
    const matchesSearch =
      searchQuery.trim() === '' ||
      prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesDiet && matchesSearch;
  });

  const getProductQuantityInCart = (productId: number) => {
    const item = items.find((i) => i.product.id === productId);
    return item ? item.quantity : 0;
  };

  return (
    <section id="menu-section" className="py-12 px-4 sm:px-6 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-6 border-b border-stone-800 gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-500 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4" />
            <span>Database-Driven Live Menu</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-100">
            Taste The Royal Spices
          </h2>
          <p className="text-stone-400 text-sm mt-1">
            Real-time menu fetched directly from our online PostgreSQL database.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search curries, biryani, naan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-stone-800/80 border border-stone-700 rounded-xl text-sm text-stone-200 placeholder:text-stone-500 focus:outline-none focus:border-amber-500 transition"
            id="menu-search-input"
          />
        </div>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 w-full no-scrollbar">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition ${
              selectedCategory === 'all'
                ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-900/20'
                : 'bg-stone-800/80 text-stone-300 hover:bg-stone-700 border border-stone-700/60'
            }`}
            id="category-tab-all"
          >
            All Items ({products.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.name)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition ${
                selectedCategory === cat.name
                  ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-900/20'
                  : 'bg-stone-800/80 text-stone-300 hover:bg-stone-700 border border-stone-700/60'
              }`}
              id={`category-tab-${cat.slug}`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Dietary toggle */}
        <div className="flex items-center gap-1.5 bg-stone-800/90 p-1 rounded-xl border border-stone-700/80 shrink-0">
          <button
            onClick={() => setDietFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
              dietFilter === 'all' ? 'bg-stone-700 text-stone-100 font-bold' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setDietFilter('veg')}
            className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium transition ${
              dietFilter === 'veg' ? 'bg-emerald-950 text-emerald-300 font-bold border border-emerald-800/60' : 'text-stone-400 hover:text-emerald-400'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Pure Veg</span>
          </button>
          <button
            onClick={() => setDietFilter('non-veg')}
            className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium transition ${
              dietFilter === 'non-veg' ? 'bg-rose-950 text-rose-300 font-bold border border-rose-800/60' : 'text-stone-400 hover:text-rose-400'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>Non-Veg</span>
          </button>
        </div>
      </div>

      {/* Error Banner when database/backend fails */}
      {error && (
        <div className="p-6 rounded-2xl bg-rose-950/40 border border-rose-800/70 text-rose-200 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-rose-400 shrink-0" />
            <div>
              <h4 className="font-bold text-rose-100">Live Database Connection Notice</h4>
              <p className="text-xs sm:text-sm text-rose-300/90">{error}</p>
            </div>
          </div>
          <button
            onClick={onRetry}
            className="px-4 py-2 rounded-xl bg-rose-900/80 hover:bg-rose-800 text-xs font-bold text-white flex items-center gap-2 shrink-0 border border-rose-700 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Connection</span>
          </button>
        </div>
      )}

      {/* Loading Skeletons */}
      {loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div key={idx} className="rounded-2xl bg-stone-800/40 border border-stone-800 p-4 animate-pulse space-y-4">
              <div className="h-48 bg-stone-800 rounded-xl w-full" />
              <div className="h-5 bg-stone-800 rounded w-2/3" />
              <div className="h-4 bg-stone-800 rounded w-full" />
              <div className="h-8 bg-stone-800 rounded w-1/3" />
            </div>
          ))}
        </div>
      )}

      {/* Products Grid */}
      {!loading && !error && filteredProducts.length === 0 && (
        <div className="text-center py-16 bg-stone-800/20 rounded-2xl border border-stone-800">
          <p className="text-stone-400 text-base">No food items matched your current filter.</p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setDietFilter('all');
              setSearchQuery('');
            }}
            className="mt-4 px-4 py-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs rounded-xl font-semibold hover:bg-amber-500/20 transition"
          >
            Reset Filters
          </button>
        </div>
      )}

      {!loading && !error && filteredProducts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => {
            const qty = getProductQuantityInCart(product.id);
            const isVeg = product.vegOrNonveg.toLowerCase() === 'veg';

            return (
              <div
                key={product.id}
                className="group flex flex-col justify-between rounded-2xl bg-stone-800/60 border border-stone-700/60 hover:border-amber-500/50 hover:bg-stone-800/90 transition-all duration-300 overflow-hidden shadow-lg"
                id={`product-card-${product.id}`}
              >
                <div>
                  {/* Image container */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-stone-900">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
                        !product.available ? 'grayscale opacity-60' : ''
                      }`}
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent" />

                    {/* Veg / Non-Veg Indicator Badge */}
                    <div className="absolute top-3 left-3 bg-stone-900/90 backdrop-blur-md p-1.5 rounded-lg border border-stone-700/60 flex items-center gap-1.5 shadow">
                      <span
                        className={`w-3 h-3 rounded-full border-2 flex items-center justify-center ${
                          isVeg ? 'border-emerald-500' : 'border-rose-500'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isVeg ? 'bg-emerald-500' : 'bg-rose-500'
                          }`}
                        />
                      </span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${
                        isVeg ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {isVeg ? 'Veg' : 'Non-Veg'}
                      </span>
                    </div>

                    {/* Category pill */}
                    <div className="absolute top-3 right-3 bg-stone-950/80 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] font-medium text-stone-300 border border-stone-700/50">
                      {product.category}
                    </div>

                    {!product.available && (
                      <div className="absolute inset-0 flex items-center justify-center bg-stone-950/70">
                        <span className="px-3 py-1.5 rounded-full bg-rose-950/90 border border-rose-800 text-rose-300 text-xs font-bold uppercase tracking-wider">
                          Currently Sold Out
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-bold text-stone-100 text-lg group-hover:text-amber-300 transition-colors">
                        {product.name}
                      </h3>
                      <div className="font-serif font-black text-amber-400 text-lg shrink-0">
                        ₹{product.price}
                      </div>
                    </div>
                    <p className="text-stone-400 text-xs sm:text-sm line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  </div>
                </div>

                {/* Card Footer / Action */}
                <div className="p-5 pt-0 mt-auto">
                  {product.available ? (
                    qty > 0 ? (
                      <div className="flex items-center justify-between bg-stone-900 border border-amber-500/40 rounded-xl p-1.5">
                        <button
                          onClick={() => updateQuantity(product.id, qty - 1)}
                          className="w-8 h-8 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 flex items-center justify-center transition active:scale-95"
                          id={`decrease-qty-${product.id}`}
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-mono font-bold text-amber-400 text-sm px-3">
                          {qty} in cart
                        </span>
                        <button
                          onClick={() => addItem(product, 1)}
                          className="w-8 h-8 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 flex items-center justify-center font-bold transition active:scale-95"
                          id={`increase-qty-${product.id}`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addItem(product, 1)}
                        className="w-full py-2.5 rounded-xl bg-stone-700/80 hover:bg-amber-500 hover:text-stone-950 text-stone-200 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 border border-stone-600/60 hover:border-amber-500 transition-all duration-200 shadow-sm"
                        id={`add-to-cart-${product.id}`}
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add To Order</span>
                      </button>
                    )
                  ) : (
                    <button
                      disabled
                      className="w-full py-2.5 rounded-xl bg-stone-800 text-stone-500 font-medium text-xs cursor-not-allowed border border-stone-800"
                    >
                      Not Available Today
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
