import React from 'react';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext.tsx';
import { RestaurantSettings } from '../types.ts';

interface CartDrawerProps {
  settings: RestaurantSettings | null;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ settings, onProceedToCheckout }) => {
  const { items, isOpen, setIsOpen, updateQuantity, removeItem, clearCart, subtotal } = useCart();

  if (!isOpen) return null;

  const deliveryFee = settings?.deliveryFee ?? 40;
  const minOrder = settings?.minOrder ?? 150;
  const isBelowMin = subtotal < minOrder;
  const total = subtotal + (subtotal > 0 ? deliveryFee : 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-stone-950/80 backdrop-blur-sm transition-opacity"
        onClick={() => setIsOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-stone-900 border-l border-stone-800 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-stone-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-lg text-stone-100">Your Order Basket</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-stone-200 flex items-center justify-center transition"
              id="close-cart-btn"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-stone-800/80 flex items-center justify-center text-stone-500">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-stone-200 text-base">Your basket is empty</h4>
                <p className="text-xs text-stone-400 max-w-xs mx-auto">
                  Add freshly made gravies, breads, or tandoori specialties from our menu.
                </p>
              </div>
            ) : (
              items.map(({ product, quantity }) => (
                <div
                  key={product.id}
                  className="p-3.5 rounded-xl bg-stone-800/50 border border-stone-700/50 flex items-center gap-3.5"
                >
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-16 h-16 rounded-lg object-cover shrink-0 bg-stone-900"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0">
                    <h5 className="font-semibold text-stone-200 text-sm truncate">{product.name}</h5>
                    <p className="font-mono text-amber-400 font-bold text-xs">₹{product.price}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        className="w-6 h-6 rounded bg-stone-700 hover:bg-stone-600 text-stone-200 flex items-center justify-center text-xs transition"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-mono font-bold text-xs text-stone-100 min-w-[16px] text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        className="w-6 h-6 rounded bg-stone-700 hover:bg-stone-600 text-stone-200 flex items-center justify-center text-xs transition"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-mono font-bold text-stone-200 text-sm">
                      ₹{product.price * quantity}
                    </p>
                    <button
                      onClick={() => removeItem(product.id)}
                      className="text-stone-500 hover:text-rose-400 mt-2 p-1 transition"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Bill Breakdown & Actions */}
          {items.length > 0 && (
            <div className="p-6 border-t border-stone-800 bg-stone-900/90 space-y-4">
              <div className="space-y-2 text-xs text-stone-300">
                <div className="flex justify-between">
                  <span className="text-stone-400">Items Subtotal</span>
                  <span className="font-mono font-bold text-stone-200">₹{subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Delivery Charge (Kota City)</span>
                  <span className="font-mono text-stone-200">₹{deliveryFee}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-stone-800 text-sm font-bold">
                  <span className="text-stone-100">Total Payable</span>
                  <span className="font-mono text-amber-400 text-base">₹{total}</span>
                </div>
              </div>

              {isBelowMin && (
                <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-800/60 text-amber-300 text-xs">
                  Minimum order amount is ₹{minOrder}. Please add items worth ₹{minOrder - subtotal} more.
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={clearCart}
                  className="px-3 py-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 text-xs font-semibold transition"
                >
                  Clear
                </button>
                <button
                  disabled={isBelowMin}
                  onClick={() => {
                    setIsOpen(false);
                    onProceedToCheckout();
                  }}
                  className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition ${
                    isBelowMin
                      ? 'bg-stone-800 text-stone-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 shadow-lg shadow-amber-900/30'
                  }`}
                  id="cart-checkout-btn"
                >
                  <span>Proceed To Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
