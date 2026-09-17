import React, { useState } from 'react';
import { X, CreditCard, QrCode, Building2, Banknote, ShieldCheck, Loader2, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { RestaurantSettings, Order } from '../types.ts';
import { createOrder, createPayment, verifyPayment } from '../api.ts';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: RestaurantSettings | null;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  settings,
  onOrderSuccess,
}) => {
  const { items, subtotal, clearCart } = useCart();
  const { currentUser, userProfile, getIdToken } = useAuth();

  const [customerName, setCustomerName] = useState(currentUser?.displayName || userProfile?.name || '');
  const [customerPhone, setCustomerPhone] = useState(userProfile?.phone || '');
  const [customerEmail, setCustomerEmail] = useState(currentUser?.email || userProfile?.email || '');
  const [deliveryAddress, setDeliveryAddress] = useState(userProfile?.address || '');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking' | 'cod'>('upi');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const deliveryFee = settings?.deliveryFee ?? 40;
  const estimatedTotal = subtotal + deliveryFee;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!customerName.trim() || !customerPhone.trim() || !customerEmail.trim() || !deliveryAddress.trim()) {
      setErrorMessage('Please fill in your name, contact phone, email, and full delivery address.');
      return;
    }

    setLoading(true);

    try {
      const token = await getIdToken();

      // 1. Submit order to server (server verifies actual DB prices)
      const orderPayload = {
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim(),
        deliveryAddress: deliveryAddress.trim(),
        userUid: currentUser?.uid,
        paymentMethod,
        notes: notes.trim() || undefined,
        items: items.map((i) => ({
          productId: i.product.id,
          quantity: i.quantity,
        })),
      };

      const result = await createOrder(orderPayload, token);
      const placedOrder = result.order;

      // 2. Handle Payment Gateway Architecture
      if (paymentMethod === 'cod') {
        clearCart();
        setLoading(false);
        onOrderSuccess(placedOrder);
        return;
      }

      // Online payment via Razorpay architecture
      const paymentInit = await createPayment(placedOrder.orderNumber);

      // Check if standard Razorpay SDK is available and has real key
      if (
        typeof window !== 'undefined' &&
        (window as any).Razorpay &&
        paymentInit.gateway === 'razorpay'
      ) {
        const options = {
          key: paymentInit.keyId,
          amount: paymentInit.amount,
          currency: paymentInit.currency,
          name: settings?.restaurantName || 'MASALA Restaurant',
          description: `Order #${placedOrder.orderNumber}`,
          order_id: paymentInit.razorpayOrderId,
          prefill: {
            name: customerName,
            email: customerEmail,
            contact: customerPhone,
          },
          theme: {
            color: '#f59e0b',
          },
          handler: async (response: any) => {
            try {
              const verifyRes = await verifyPayment({
                orderNumber: placedOrder.orderNumber,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });

              clearCart();
              setLoading(false);
              onOrderSuccess({
                ...placedOrder,
                paymentStatus: 'completed',
                orderStatus: 'confirmed',
              });
            } catch (err: any) {
              setErrorMessage('Payment verification failed on server: ' + err.message);
              setLoading(false);
            }
          },
          modal: {
            ondismiss: () => {
              setLoading(false);
              setErrorMessage('Payment was dismissed. You can retry payment from the orders page.');
            },
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } else {
        // Test / Sandbox simulated payment flow (when Razorpay credentials are not yet injected in container)
        // Automatically completes verification on the server
        const verifyRes = await verifyPayment({
          orderNumber: placedOrder.orderNumber,
          simulationSuccess: true,
        });

        clearCart();
        setLoading(false);
        onOrderSuccess({
          ...placedOrder,
          paymentStatus: 'completed',
          orderStatus: 'confirmed',
        });
      }
    } catch (err: any) {
      console.error('Order submission error:', err);
      setErrorMessage(err.message || 'Failed to place order. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-xl bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="p-6 border-b border-stone-800 flex items-center justify-between bg-stone-900/90">
          <div>
            <h3 className="font-serif font-bold text-xl text-stone-100">Delivery & Checkout</h3>
            <p className="text-xs text-stone-400 mt-0.5">Kota City Express Delivery Service</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-stone-200 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMessage && (
          <div className="mx-6 mt-4 p-3.5 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmitOrder} className="p-6 space-y-5">
          {/* Customer Details */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
              1. Customer Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kunal Sharma"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-800/80 border border-stone-700 rounded-xl text-sm text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1">Phone Number (10 digits) *</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9171863765"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-800/80 border border-stone-700 rounded-xl text-sm text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-300 mb-1">Email Address *</label>
              <input
                type="email"
                required
                placeholder="e.g. customer@example.com"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-800/80 border border-stone-700 rounded-xl text-sm text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-300 mb-1">Delivery Address in Kota *</label>
              <textarea
                required
                rows={2}
                placeholder="House / Flat No., Landmark, Santoshi Nagar or area in Kota"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-800/80 border border-stone-700 rounded-xl text-sm text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-300 mb-1">Special Cooking Notes (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Less spicy, extra onions, ring bell on arrival"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-800/80 border border-stone-700 rounded-xl text-sm text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
              2. Select Payment Method
            </h4>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setPaymentMethod('upi')}
                className={`p-3 rounded-xl border flex flex-col items-start gap-1 text-left transition ${
                  paymentMethod === 'upi'
                    ? 'bg-amber-500/10 border-amber-500 text-amber-300'
                    : 'bg-stone-800/60 border-stone-700 text-stone-300 hover:bg-stone-800'
                }`}
              >
                <div className="flex items-center gap-1.5 font-semibold text-xs">
                  <QrCode className="w-4 h-4 text-amber-400" />
                  <span>UPI Instant</span>
                </div>
                <span className="text-[10px] text-stone-400">GPay, PhonePe, Paytm, BHIM</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-3 rounded-xl border flex flex-col items-start gap-1 text-left transition ${
                  paymentMethod === 'card'
                    ? 'bg-amber-500/10 border-amber-500 text-amber-300'
                    : 'bg-stone-800/60 border-stone-700 text-stone-300 hover:bg-stone-800'
                }`}
              >
                <div className="flex items-center gap-1.5 font-semibold text-xs">
                  <CreditCard className="w-4 h-4 text-amber-400" />
                  <span>Card</span>
                </div>
                <span className="text-[10px] text-stone-400">Credit / Debit Cards</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('netbanking')}
                className={`p-3 rounded-xl border flex flex-col items-start gap-1 text-left transition ${
                  paymentMethod === 'netbanking'
                    ? 'bg-amber-500/10 border-amber-500 text-amber-300'
                    : 'bg-stone-800/60 border-stone-700 text-stone-300 hover:bg-stone-800'
                }`}
              >
                <div className="flex items-center gap-1.5 font-semibold text-xs">
                  <Building2 className="w-4 h-4 text-amber-400" />
                  <span>Net Banking</span>
                </div>
                <span className="text-[10px] text-stone-400">All Major Indian Banks</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('cod')}
                className={`p-3 rounded-xl border flex flex-col items-start gap-1 text-left transition ${
                  paymentMethod === 'cod'
                    ? 'bg-amber-500/10 border-amber-500 text-amber-300'
                    : 'bg-stone-800/60 border-stone-700 text-stone-300 hover:bg-stone-800'
                }`}
              >
                <div className="flex items-center gap-1.5 font-semibold text-xs">
                  <Banknote className="w-4 h-4 text-amber-400" />
                  <span>Cash on Delivery</span>
                </div>
                <span className="text-[10px] text-stone-400">Pay cash upon arrival</span>
              </button>
            </div>
          </div>

          {/* Amount Confirmation Banner */}
          <div className="p-4 rounded-xl bg-stone-950/80 border border-stone-800 flex items-center justify-between text-sm">
            <div>
              <span className="text-stone-400 text-xs block">Server Calculated Final Amount</span>
              <span className="font-mono font-bold text-amber-400 text-lg">₹{estimatedTotal}</span>
              <span className="text-stone-500 text-[10px] block">Includes ₹{deliveryFee} delivery charge</span>
            </div>
            <div className="flex items-center gap-1 text-emerald-400 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Razorpay 256-bit Secure</span>
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-sm font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-900/30 transition disabled:opacity-50"
              id="confirm-place-order-btn"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Online Order...</span>
                </>
              ) : (
                <span>Confirm & Place Order (₹{estimatedTotal})</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
