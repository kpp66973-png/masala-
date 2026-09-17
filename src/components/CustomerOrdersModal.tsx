import React, { useEffect, useState } from 'react';
import { X, ShoppingBag, Clock, CheckCircle2, AlertCircle, RefreshCw, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { getUserOrders, getOrder } from '../api.ts';
import { Order } from '../types.ts';

interface CustomerOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CustomerOrdersModal: React.FC<CustomerOrdersModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { currentUser, getIdToken, signInWithGoogle } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Manual lookup state for guest checkouts
  const [searchOrderNumber, setSearchOrderNumber] = useState('');
  const [singleOrderResult, setSingleOrderResult] = useState<Order | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);

  const fetchOrders = async () => {
    if (!currentUser) return;
    setLoading(true);
    setError(null);
    try {
      const token = await getIdToken();
      if (token) {
        const data = await getUserOrders(currentUser.uid, token);
        setOrders(data);
      }
    } catch (err: any) {
      console.error('Failed to load user orders:', err);
      setError(err.message || 'Could not fetch previous orders from database');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && currentUser) {
      fetchOrders();
    }
  }, [isOpen, currentUser]);

  const handleLookupOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchOrderNumber.trim()) return;
    setLookupLoading(true);
    setLookupError(null);
    setSingleOrderResult(null);

    try {
      const found = await getOrder(searchOrderNumber.trim());
      setSingleOrderResult(found);
    } catch (err: any) {
      setLookupError('Order not found. Please verify the order reference ID.');
    } finally {
      setLookupLoading(false);
    }
  };

  if (!isOpen) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'received':
        return 'bg-blue-950/80 text-blue-400 border-blue-800';
      case 'confirmed':
        return 'bg-amber-950/80 text-amber-400 border-amber-800';
      case 'preparing':
        return 'bg-purple-950/80 text-purple-400 border-purple-800';
      case 'out_for_delivery':
        return 'bg-indigo-950/80 text-indigo-400 border-indigo-800';
      case 'delivered':
        return 'bg-emerald-950/80 text-emerald-400 border-emerald-800';
      case 'cancelled':
        return 'bg-rose-950/80 text-rose-400 border-rose-800';
      default:
        return 'bg-stone-800 text-stone-300 border-stone-700';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-3xl bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl flex flex-col max-h-[88vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-stone-800 flex items-center justify-between bg-stone-900/90">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-bold text-lg text-stone-100">Order History & Tracking</h3>
              <p className="text-xs text-stone-400">Live order records stored in PostgreSQL</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-stone-200 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Guest Order Lookup */}
          <div className="p-4 rounded-xl bg-stone-800/40 border border-stone-800 space-y-3">
            <p className="text-xs font-semibold text-stone-300">
              Track Any Order via Order Number (e.g. MSL-123456-ABCD)
            </p>
            <form onSubmit={handleLookupOrder} className="flex gap-2">
              <input
                type="text"
                placeholder="Enter Order ID / Number"
                value={searchOrderNumber}
                onChange={(e) => setSearchOrderNumber(e.target.value)}
                className="flex-1 px-3.5 py-2 bg-stone-800 border border-stone-700 rounded-xl text-xs sm:text-sm text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                disabled={lookupLoading}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition disabled:opacity-50"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Search</span>
              </button>
            </form>

            {lookupError && (
              <p className="text-xs text-rose-400">{lookupError}</p>
            )}

            {singleOrderResult && (
              <div className="p-4 rounded-xl bg-stone-900 border border-amber-500/40 mt-3 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-mono font-bold text-amber-400 text-sm">
                    {singleOrderResult.orderNumber}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase ${getStatusColor(singleOrderResult.orderStatus)}`}>
                    {singleOrderResult.orderStatus}
                  </span>
                </div>
                <div className="text-stone-400 text-[11px]">
                  Date: {singleOrderResult.createdAt ? new Date(singleOrderResult.createdAt).toLocaleString() : 'Recent'}
                </div>
                <div className="py-2 border-t border-stone-800">
                  <span className="text-stone-400 block mb-1">Ordered Items:</span>
                  {singleOrderResult.items?.map((item) => (
                    <div key={item.id} className="flex justify-between text-stone-200">
                      <span>{item.productName} × {item.quantity}</span>
                      <span className="font-mono">₹{item.itemTotal}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between font-bold pt-2 border-t border-stone-800 text-stone-100">
                  <span>Total Amount:</span>
                  <span className="font-mono text-amber-400">₹{singleOrderResult.totalAmount}</span>
                </div>
                <div className="flex justify-between text-stone-400 pt-1">
                  <span>Payment: {singleOrderResult.paymentMethod.toUpperCase()} ({singleOrderResult.paymentStatus})</span>
                </div>
              </div>
            )}
          </div>

          {/* Logged in User Orders */}
          {currentUser ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-stone-200">
                  Orders placed by {currentUser.email}
                </h4>
                <button
                  onClick={fetchOrders}
                  className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 font-semibold"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh</span>
                </button>
              </div>

              {loading && (
                <div className="text-center py-8 text-stone-400 text-xs">
                  Loading orders from database...
                </div>
              )}

              {error && (
                <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs">
                  {error}
                </div>
              )}

              {!loading && orders.length === 0 && (
                <div className="text-center py-10 bg-stone-800/20 rounded-xl border border-stone-800">
                  <p className="text-stone-400 text-sm">No previous orders found for this account.</p>
                </div>
              )}

              {!loading && orders.length > 0 && (
                <div className="space-y-4">
                  {orders.map((ord) => (
                    <div
                      key={ord.id}
                      className="p-4 rounded-xl bg-stone-800/60 border border-stone-700/60 space-y-3 text-xs"
                    >
                      <div className="flex flex-wrap justify-between items-center gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-amber-400 text-sm">
                            {ord.orderNumber}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${getStatusColor(ord.orderStatus)}`}>
                            {ord.orderStatus.replace('_', ' ')}
                          </span>
                        </div>
                        <span className="text-stone-400 text-[11px]">
                          {ord.createdAt ? new Date(ord.createdAt).toLocaleString() : 'Just now'}
                        </span>
                      </div>

                      {/* Items */}
                      <div className="py-2 border-y border-stone-700/40 space-y-1">
                        {ord.items && ord.items.length > 0 ? (
                          ord.items.map((item) => (
                            <div key={item.id} className="flex justify-between text-stone-200">
                              <span>
                                {item.productName} <span className="text-stone-400">× {item.quantity}</span>
                              </span>
                              <span className="font-mono text-stone-300">₹{item.itemTotal}</span>
                            </div>
                          ))
                        ) : (
                          <div className="text-stone-400">Standard Delivery Items</div>
                        )}
                      </div>

                      {/* Total & Meta */}
                      <div className="flex flex-wrap justify-between items-center text-[11px] text-stone-400 gap-2">
                        <div>
                          <span>Payment: </span>
                          <span className="text-stone-200 font-semibold uppercase">{ord.paymentMethod}</span>
                          <span className={`ml-2 font-semibold ${
                            ord.paymentStatus === 'completed' ? 'text-emerald-400' : 'text-amber-400'
                          }`}>
                            ({ord.paymentStatus})
                          </span>
                        </div>
                        <div className="text-sm font-bold">
                          <span className="text-stone-300 mr-2">Total:</span>
                          <span className="font-mono text-amber-400 text-base">₹{ord.totalAmount}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 rounded-xl bg-stone-800/40 border border-stone-800 text-center space-y-3">
              <h5 className="font-semibold text-stone-200 text-sm">Sign in to save and see all your orders</h5>
              <p className="text-xs text-stone-400 max-w-sm mx-auto">
                Connect your account with Google Sign-In to track ongoing deliveries and previous orders anytime.
              </p>
              <button
                onClick={() => signInWithGoogle()}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition"
              >
                Sign In with Google
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
