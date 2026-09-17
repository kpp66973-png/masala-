import React from 'react';
import { CheckCircle2, Clock, MapPin, Phone, ShoppingBag, ArrowRight } from 'lucide-react';
import { Order, RestaurantSettings } from '../types.ts';

interface OrderConfirmationModalProps {
  order: Order | null;
  settings: RestaurantSettings | null;
  onClose: () => void;
  onViewAllOrders: () => void;
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  order,
  settings,
  onClose,
  onViewAllOrders,
}) => {
  if (!order) return null;

  const phone = settings?.phone || '9171863765';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl p-6 sm:p-8 text-center space-y-6">
        {/* Animated Check */}
        <div className="w-16 h-16 rounded-full bg-emerald-950/80 border-2 border-emerald-500/80 flex items-center justify-center mx-auto text-emerald-400">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <div>
          <h3 className="font-serif font-bold text-2xl text-stone-100">
            Order Received & Saved Online!
          </h3>
          <p className="text-xs text-stone-400 mt-1">
            Your order is permanently registered in our PostgreSQL database.
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-stone-800/60 rounded-xl p-4 border border-stone-700/60 text-left space-y-3 text-xs">
          <div className="flex justify-between items-center pb-2 border-b border-stone-700/60">
            <span className="text-stone-400">Order Reference</span>
            <span className="font-mono font-bold text-amber-400 text-sm">{order.orderNumber}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-stone-400">Customer</span>
            <span className="text-stone-200 font-semibold">{order.customerName}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-stone-400">Contact</span>
            <span className="text-stone-200 font-semibold">{order.customerPhone}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-stone-400">Delivery Address</span>
            <span className="text-stone-200 font-medium text-right max-w-[200px] truncate">
              {order.deliveryAddress}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-stone-400">Payment Method</span>
            <span className="text-stone-200 font-semibold uppercase">{order.paymentMethod}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-stone-400">Payment Status</span>
            <span className={`font-bold uppercase ${
              order.paymentStatus === 'completed' ? 'text-emerald-400' : 'text-amber-400'
            }`}>
              {order.paymentStatus}
            </span>
          </div>

          <div className="flex justify-between pt-2 border-t border-stone-700/60 font-bold text-sm">
            <span className="text-stone-200">Total Billed</span>
            <span className="font-mono text-amber-400 text-base">₹{order.totalAmount}</span>
          </div>
        </div>

        {/* Live Status Tracker */}
        <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-800/40 text-left flex items-center gap-3">
          <Clock className="w-5 h-5 text-amber-400 shrink-0" />
          <div className="text-xs">
            <p className="font-semibold text-stone-200">Preparation Starting Soon</p>
            <p className="text-stone-400 text-[11px]">
              Our chefs at Santoshi Nagar, Kota are preparing fresh hand-ground spices.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => {
              onClose();
              onViewAllOrders();
            }}
            className="flex-1 py-3 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs flex items-center justify-center gap-2 transition"
          >
            <ShoppingBag className="w-4 h-4 text-amber-400" />
            <span>View All My Orders</span>
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-900/30 transition"
          >
            <span>Back to Menu</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
