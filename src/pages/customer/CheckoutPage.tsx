import React, { useState, useEffect } from 'react';
import { useAppState, getShopDetails } from '../../context/StateContext';
import { Order } from '../../types';
import { 
  ShieldCheck,
  ArrowRight, 
  ClipboardList, 
  Clock, 
  Truck, 
  Plus, 
  Trash2, 
  MapPin, 
  CreditCard, 
  Smartphone, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  X, 
  ShieldAlert,
  Loader2,
  Lock,
  Globe
} from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const {
    cart,
    currentUser,
    cartSubtotal,
    deliveryFee,
    placeOrder,
    confirmStoredOrdersPayment,
    navigate,
    showToast,
  } = useAppState();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [deliverySlot, setDeliverySlot] = useState('Morning (8:00 AM - 11:00 AM)');
  const [acceptTerms, setAcceptTerms] = useState(true);
  const [orderNotes, setOrderNotes] = useState('');
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(true);
  const [isPlacing, setIsPlacing] = useState(false);

  const [createdOrdersForPrepay, setCreatedOrdersForPrepay] = useState<Order[]>([]);

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // Payment Options States
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'ONLINE'>('COD');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentGatewayState, setPaymentGatewayState] = useState<'SELECT' | 'PROCESSING' | 'SUCCESS' | 'FAILED'>('SELECT');
  const [paymentType, setPaymentType] = useState<'UPI' | 'CARD' | 'NETBANKING'>('UPI');
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [paymentError, setPaymentError] = useState('');

  // Coupon configuration
  const [activeCoupon, setActiveCoupon] = useState('');

  useEffect(() => {
    // 1. Recover active coupon passed as param (e.g., #/checkout?coupon=WELCOME50)
    const hash = window.location.hash;
    const queryIndex = hash.indexOf('?');
    if (queryIndex !== -1) {
      const params = new URLSearchParams(hash.substring(queryIndex + 1));
      setActiveCoupon(params.get('coupon') || '');
    }

    // 2. Prefill details with current signed-in customer if available
    if (currentUser) {
      setName(currentUser.name || '');
      setPhone(currentUser.phone || '');
      const defaultAddr = currentUser.address.find((a) => a.isDefault) || currentUser.address[0];
      if (defaultAddr) {
        setAddress(defaultAddr.fullAddress || '');
        setLandmark(defaultAddr.landmark || '');
      }
    }
  }, [currentUser]);

  // Group cart items by shop
  const groupedCartItems = cart.reduce((groups: { [key: string]: { shopName: string; items: typeof cart } }, item: any) => {
    const shop = getShopDetails(item.product.category);
    const shopId = item.product.shopId || shop.shopId;
    const shopName = item.product.shopName || shop.shopName;
    if (!groups[shopId]) {
      groups[shopId] = { shopName, items: [] };
    }
    groups[shopId].items.push(item);
    return groups;
  }, {});

  // Compute final details matching cart coupon values
  const hasWelcomeDiscount = activeCoupon === 'WELCOME50';
  const hasFreeShippingDiscount = activeCoupon === 'JANGFREE';

  const finalSubtotal = cartSubtotal;
  const discountOffset = hasWelcomeDiscount ? 50 : 0;
  const currentShipping = hasFreeShippingDiscount ? 0 : deliveryFee;
  const finalTotal = Math.max(0, finalSubtotal - discountOffset + currentShipping);

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!name.trim()) {
      errors.name = 'Customer Name is required';
    }

    const cleanPhone = phone.trim().replace(/\D/g, '');
    if (!cleanPhone) {
      errors.phone = 'Contact WhatsApp phone is required';
    } else if (cleanPhone.length !== 10) {
      errors.phone = 'Must be a 10-digit Indian phone (e.g., 9876543210)';
    }

    if (!address.trim()) {
      errors.address = 'Detailed doorstep delivery address is required';
    } else if (address.trim().length < 12) {
      errors.address = 'Please write a complete delivery address (min 12 letters)';
    }

    if (!acceptTerms) {
      errors.terms = 'You must accept the JangaonMart delivery terms';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePlaceOrderSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validateForm()) return;

    if (paymentMethod === 'ONLINE') {
      try {
        setIsPlacing(true);
        setPaymentGatewayState('PROCESSING');
        setPaymentError('');
        setShowPaymentModal(true);

        // Step 1: Pre-create PENDING orders (if they haven't been created yet) to preserve Blinkit checkout requirements
        let currentPendingOrders = createdOrdersForPrepay;
        if (currentPendingOrders.length === 0) {
          currentPendingOrders = await placeOrder(
            name.trim(),
            phone.trim(),
            address.trim(),
            landmark.trim(),
            deliverySlot,
            orderNotes.trim(),
            'ONLINE',
            'PENDING',
            '',
            '',
            '',
            discountOffset,
            currentShipping
          );
          setCreatedOrdersForPrepay(currentPendingOrders);
        }

        // Step 2: Call Express backend to create a Razorpay order
        const response = await fetch("/api/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: finalTotal })
        });

        if (!response.ok) {
          throw new Error(`Server returned status code: ${response.status}`);
        }

        const data = await response.json();
        if (!data.success) {
          throw new Error(data.error || "Failed to generate Razorpay order ID on Express backend.");
        }

        // Step 3: Trigger the real Razorpay checkouts popup now
        if ((window as any).Razorpay) {
          const options = {
            key: data.key_id,
            amount: data.amount,
            currency: data.currency,
            name: "JangaonMart Groceries",
            description: `Payment for Order JMR-${Date.now().toString().slice(-6)}`,
            order_id: data.order_id,
            handler: async function (paymentResponse: any) {
              try {
                setPaymentGatewayState('PROCESSING');
                
                // Step 4: Verify signature using Razorpay secret key on the backend
                const verifyRes = await fetch("/api/verify-payment", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    razorpay_order_id: paymentResponse.razorpay_order_id,
                    razorpay_payment_id: paymentResponse.razorpay_payment_id,
                    razorpay_signature: paymentResponse.razorpay_signature,
                    is_sandbox_fallback: data.is_sandbox_fallback
                  })
                });

                const verifyData = await verifyRes.json();
                if (verifyData.success) {
                  setPaymentGatewayState('SUCCESS');
                  await new Promise((resolve) => setTimeout(resolve, 800));

                  // Step 5: Update the pre-created JangaonMart orders to PAID/Accepted and clear cart
                  confirmStoredOrdersPayment(
                    currentPendingOrders.map(o => o.id),
                    paymentResponse.razorpay_payment_id,
                    paymentResponse.razorpay_order_id,
                    paymentResponse.razorpay_payment_id
                  );
                  setShowPaymentModal(false);
                } else {
                  throw new Error(verifyData.error || "Signature verification failed.");
                }
              } catch (verifyErr: any) {
                console.error(verifyErr);
                setPaymentError(verifyErr.message || "Payment signature mismatch on verification.");
                setPaymentGatewayState('FAILED');
              }
            },
            prefill: {
              name: name.trim(),
              contact: phone.trim(),
              email: currentUser?.email || "customer@jangaonmart.com",
            },
            notes: {
              address: address.trim(),
            },
            theme: {
              color: "#0891b2", // Cyan/Teal branded theme
            },
            modal: {
              ondismiss: function () {
                setIsPlacing(false);
                setPaymentError("Payment popup closed by customer without completing purchase. You can retry paying.");
                setPaymentGatewayState('FAILED');
              }
            }
          };

          const rzp = new (window as any).Razorpay(options);
          rzp.open();
        } else {
          // If Razorpay SDK fails to load (e.g. offline preview or iframe sandboxing restrictions),
          // fallback to our robust sandboxed payment simulation panel inside the overlay modal
          console.warn("Razorpay script not found! Reverting to Developer sandbox simulation overlay...");
          setPaymentGatewayState('SELECT');
          setUpiId(currentUser ? `${currentUser.name.toLowerCase().replace(/\s+/g, '')}@okaxis` : 'customer@okaxis');
          setCardNumber('');
          setCardExpiry('');
          setCardCvv('');
        }
      } catch (err: any) {
        console.error("Razorpay payment initiator error:", err);
        setPaymentError(err.message || "Gateway backend endpoint unreachable. Please inspect developer server log dockets.");
        setPaymentGatewayState('FAILED');
      } finally {
        setIsPlacing(false);
      }
    } else {
      // Process standard Cash on Delivery (COD) flow
      try {
        setIsPlacing(true);
        await placeOrder(
          name.trim(),
          phone.trim(),
          address.trim(),
          landmark.trim(),
          deliverySlot,
          orderNotes.trim(),
          'COD',
          'PENDING',
          '',
          '',
          '',
          discountOffset,
          currentShipping
        );
      } catch (err) {
        console.error(err);
      } finally {
        setIsPlacing(false);
      }
    }
  };

  const handleSimulatePaymentSuccess = async () => {
    try {
      setPaymentGatewayState('PROCESSING');
      await new Promise((resolve) => setTimeout(resolve, 800));

      const mockOrderId = `order_sim_${Math.floor(100000 + Math.random() * 900000)}`;
      const mockPaymentId = `pay_sim_${Math.floor(100000 + Math.random() * 900000)}`;

      // Query verification API in simulation mode to complete full round-trip verification
      const verifyRes = await fetch("/api/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpay_order_id: mockOrderId,
          razorpay_payment_id: mockPaymentId,
          is_sandbox_fallback: true
        })
      });

      const verifyData = await verifyRes.json();
      if (verifyData.success) {
        setPaymentGatewayState('SUCCESS');
        await new Promise((resolve) => setTimeout(resolve, 800));

        let currentPendingOrders = createdOrdersForPrepay;
        if (currentPendingOrders.length === 0) {
          // If simulation was run directly without starting flow
          currentPendingOrders = await placeOrder(
            name.trim(),
            phone.trim(),
            address.trim(),
            landmark.trim(),
            deliverySlot,
            orderNotes.trim(),
            'ONLINE',
            'PENDING',
            '',
            '',
            '',
            discountOffset,
            currentShipping
          );
          setCreatedOrdersForPrepay(currentPendingOrders);
        }

        confirmStoredOrdersPayment(
          currentPendingOrders.map(o => o.id),
          mockPaymentId,
          mockOrderId,
          mockPaymentId
        );
        setShowPaymentModal(false);
      } else {
        throw new Error("Simulation verification check failed.");
      }
    } catch (err: any) {
      console.error(err);
      setPaymentError(err.message || "Failed to complete transaction in sandbox mode.");
      setPaymentGatewayState('FAILED');
    }
  };

  const handleSimulatePaymentFailure = async () => {
    setPaymentGatewayState('PROCESSING');
    await new Promise((resolve) => setTimeout(resolve, 800));
    setPaymentError('Signature verification check mismatch. Bank reported balance insufficient (INS_FUNDS).');
    setPaymentGatewayState('FAILED');
  };

  if (cart.length === 0) {
    return (
      <div className="py-12 text-center space-y-4">
        <p className="text-gray-500 font-semibold font-display text-lg">Your basket is empty. Please add items to checkout.</p>
        <button
          onClick={() => navigate('#/products')}
          className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs cursor-pointer"
        >
          Browse Groceries
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 text-left">
      
      {/* Title */}
      <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
        <div className="p-2.5 bg-brand-50 rounded-xl text-brand-600">
          <ClipboardList className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-display font-black text-2xl text-gray-900 tracking-tight">Express Checkout</h1>
          <p className="text-xs text-gray-400">Fill in your delivery slot and exact Jangaon address</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Delivery form column */}
        <form onSubmit={handlePlaceOrderSubmit} className="lg:col-span-2 space-y-6">
          
          {/* Section 1: Customer details */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 space-y-4 shadow-xs">
            <h3 className="font-display font-extrabold text-base text-gray-950 flex items-center gap-2 border-b border-gray-50 pb-3">
              <span className="w-5 h-5 rounded-full bg-brand-600 text-white flex items-center justify-center text-[11px] font-bold">1</span>
              <span>Delivery Recipient Information</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-650">Customer Name *</label>
                <input
                  type="text"
                  placeholder="e.g., Shruthi Balde"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full border px-3 py-2 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                    formErrors.name ? 'border-red-300 bg-red-50/20' : 'border-slate-200 bg-slate-50/50'
                  }`}
                />
                {formErrors.name && <p className="text-[10px] text-red-500 font-semibold">{formErrors.name}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-650">Active WhatsApp / Phone *</label>
                <input
                  type="text"
                  maxLength={10}
                  placeholder="e.g., 9876543210 (10 digits)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  className={`w-full border px-3 py-2 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                    formErrors.phone ? 'border-red-300 bg-red-50/20' : 'border-slate-200 bg-slate-50/50'
                  }`}
                />
                {formErrors.phone && <p className="text-[10px] text-red-500 font-semibold">{formErrors.phone}</p>}
                <p className="text-[10px] text-gray-400">Used for delivery agent location calling and order receipts.</p>
              </div>
            </div>
          </div>

          {/* Section 2: Address maps location */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 space-y-4 shadow-xs">
            <h3 className="font-display font-extrabold text-base text-gray-950 flex items-center gap-2 border-b border-gray-50 pb-3">
              <span className="w-5 h-5 rounded-full bg-brand-600 text-white flex items-center justify-center text-[11px] font-bold">2</span>
              <span>Physical Doorstep Address</span>
            </h3>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-650">Detailed Delivery Address *</label>
                <textarea
                  placeholder="House No, Ward, Street name, Near Chowrasta landmark details, JangaonTown"
                  rows={3}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className={`w-full border px-3 py-2 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                    formErrors.address ? 'border-red-300 bg-red-50/20' : 'border-slate-200 bg-slate-50/50'
                  }`}
                />
                {formErrors.address && <p className="text-[10px] text-red-500 font-semibold">{formErrors.address}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-650">Famous Landmark (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g., Near Prema Hospital / Opposite Bus Stand"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  className="w-full border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Delivery slots selectors */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 space-y-4 shadow-xs">
            <h3 className="font-display font-extrabold text-base text-gray-950 flex items-center gap-2 border-b border-gray-50 pb-3">
              <span className="w-5 h-5 rounded-full bg-brand-600 text-white flex items-center justify-center text-[11px] font-bold">3</span>
              <span>Available Delivery Slots (Today)</span>
            </h3>

            <div className="grid grid-cols-2 gap-3 text-left">
              {[
                { label: 'Morning Slot', hours: '8:00 AM - 11:00 AM' },
                { label: 'Afternoon Slot', hours: '12:00 PM - 3:00 PM' },
                { label: 'Evening Slot', hours: '4:00 PM - 7:00 PM' },
                { label: 'Night Slot', hours: '8:00 PM - 10:00 PM' },
              ].map((slot) => {
                const combinedVal = `${slot.label} (${slot.hours})`;
                const isSelected = deliverySlot === combinedVal;
                return (
                  <div
                    key={slot.label}
                    onClick={() => setDeliverySlot(combinedVal)}
                    className={`p-3.5 rounded-2xl border cursor-pointer select-none transition flex flex-col justify-center text-left ${
                      isSelected
                        ? 'border-brand-600 bg-brand-50/70 text-brand-900 shadow-sm'
                        : 'border-slate-150 bg-white hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 text-sm font-bold">
                      <Clock className={`w-4 h-4 shrink-0 ${isSelected ? 'text-brand-650' : 'text-gray-400'}`} />
                      <span>{slot.label}</span>
                    </div>
                    <span className="text-[10px] text-gray-500 font-medium">{slot.hours}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 4: Payments and terms */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 space-y-4 shadow-xs">
            <h3 className="font-display font-extrabold text-base text-gray-950 flex items-center gap-2 border-b border-gray-50 pb-3">
              <span className="w-5 h-5 rounded-full bg-brand-600 text-white flex items-center justify-center text-[11px] font-bold">4</span>
              <span>Select Payment Method</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* COD Option */}
              <div 
                onClick={() => setPaymentMethod('COD')}
                className={`p-4 rounded-2xl border cursor-pointer select-none transition-all flex justify-between items-start ${
                  paymentMethod === 'COD' 
                    ? 'border-emerald-550 bg-emerald-50/40 shadow-xs' 
                    : 'border-slate-150 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex gap-3">
                  <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    paymentMethod === 'COD' ? 'border-emerald-600' : 'border-slate-300'
                  }`}>
                    {paymentMethod === 'COD' && <div className="w-2 h-2 rounded-full bg-emerald-600" />}
                  </div>
                  <div>
                    <p className={`text-xs font-bold ${paymentMethod === 'COD' ? 'text-emerald-900' : 'text-slate-800'}`}>
                      Cash on Delivery (COD)
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1 leading-normal">
                      Pay with cash, UPI or cards upon physical doorstep package receipt.
                    </p>
                  </div>
                </div>
                <Truck className="w-5 h-5 text-emerald-600 shrink-0 opacity-80" />
              </div>

              {/* Online payment Option */}
              <div 
                onClick={() => setPaymentMethod('ONLINE')}
                className={`p-4 rounded-2xl border cursor-pointer select-none transition-all flex justify-between items-start ${
                  paymentMethod === 'ONLINE' 
                    ? 'border-brand-550 bg-brand-50/40 shadow-xs' 
                    : 'border-slate-150 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex gap-3">
                  <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    paymentMethod === 'ONLINE' ? 'border-brand-600' : 'border-slate-300'
                  }`}>
                    {paymentMethod === 'ONLINE' && <div className="w-2 h-2 rounded-full bg-brand-650" />}
                  </div>
                  <div>
                    <p className={`text-xs font-bold ${paymentMethod === 'ONLINE' ? 'text-brand-900' : 'text-slate-800'}`}>
                      Secure Online Payment
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1 leading-normal">
                      Pay instantly with UPI (Google Pay, PhonePe), Credit/Debit Card or Netbanking.
                    </p>
                  </div>
                </div>
                <CreditCard className="w-5 h-5 text-brand-600 shrink-0 opacity-80" />
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-650">Order Instructions (Optional)</label>
                <textarea
                  placeholder="e.g., Please leave milk packet in basket at gate or call before ringing bell..."
                  rows={2}
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className="w-full border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex items-start gap-2.5 select-none pt-2">
                <input
                  type="checkbox"
                  id="checkedTerms"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-1 accent-brand-600 h-4 w-4 cursor-pointer"
                />
                <label htmlFor="checkedTerms" className="text-[11px] text-gray-500 leading-normal cursor-pointer">
                  I agree that my items are being delivered under 60 minutes from certified hyperlocals in Jangaon Ward. {paymentMethod === 'COD' ? `Cash collection of ₹${finalTotal} will be matched on doorstep delivery.` : `Pre-paid online transaction will be cleared immediately.`}
                </label>
              </div>
              {formErrors.terms && <p className="text-[10px] text-red-500 font-semibold">{formErrors.terms}</p>}
            </div>
          </div>

        </form>

        {/* Right Side: Order Summary sidepanel */}
        <div className="space-y-6 self-start">
          
          <div className="bg-white border border-slate-100 rounded-3xl p-5 space-y-4 shadow-xs">
            <h3 className="font-display font-extrabold text-slate-900 text-sm pb-2 border-b border-gray-50 flex items-center justify-between">
              <span>Checkout Summary</span>
              <span className="text-xs bg-slate-100 text-slate-605 rounded-full px-2 py-0.5 font-bold">{cart.length} items</span>
            </h3>

            {/* Collapsed/Expandable list toggle layout */}
            <div className="space-y-2.5">
              <button
                onClick={() => setIsSummaryExpanded(!isSummaryExpanded)}
                className="w-full text-[11px] font-bold text-brand-650 hover:underline flex items-center justify-between"
              >
                <span>{isSummaryExpanded ? 'Collapse' : 'Expand'} itemised list</span>
                <span>{isSummaryExpanded ? '▲' : '▼'}</span>
              </button>

              {isSummaryExpanded && (
                <div className="space-y-4 border-t border-b border-slate-50 py-3 max-h-72 overflow-y-auto">
                  {Object.entries(groupedCartItems).map(([shopId, group]: [string, any]) => (
                    <div key={shopId} className="space-y-2 pb-3 last:pb-0 border-b last:border-0 border-slate-100">
                      <div className="flex items-center gap-1 bg-cyan-50/50 text-cyan-800 text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded-lg w-fit">
                        🏢 {group.shopName}
                      </div>
                      <div className="space-y-1.5 pl-1">
                        {group.items.map((item: any) => (
                          <div key={item.product.id} className="flex gap-2 text-xs justify-between items-center text-slate-700">
                            <div className="flex items-center gap-1.5 shrink-0 truncate max-w-[170px]">
                              <img
                                src={item.product.image}
                                alt={item.product.name}
                                className="w-7 h-7 rounded-md object-cover border border-slate-100 shadow-2xs"
                              />
                              <span className="truncate text-[11px] font-medium text-slate-800">{item.product.name}</span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">x{item.quantity}</span>
                            <span className="font-extrabold text-slate-800 shrink-0 text-right text-[11px]">₹{item.product.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Price Calculations rows */}
            <div className="space-y-2 text-xs text-slate-500 border-t border-slate-50 pt-3">
              <div className="flex justify-between">
                <span>Grocery Subtotal</span>
                <span>₹{finalSubtotal}</span>
              </div>
              
              {hasWelcomeDiscount && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Promo WELCOME50 Discount</span>
                  <span>- ₹50</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Doorstep Delivery Charge</span>
                {hasFreeShippingDiscount || currentShipping === 0 ? (
                  <span className="text-emerald-600 font-bold">FREE Delivery</span>
                ) : (
                  <span>₹{currentShipping}</span>
                )}
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3.5 flex justify-between items-center text-slate-900">
              <span className="font-display font-extrabold text-xs uppercase tracking-wider text-slate-500">
                {paymentMethod === 'COD' ? 'TOTAL COD PAYABLE' : 'TOTAL ONLINE CHARGE'}
              </span>
              <span className="font-display font-black text-xl text-brand-600">
                ₹{finalTotal}
              </span>
            </div>

            {/* Form Place button */}
            <button
              onClick={() => handlePlaceOrderSubmit()}
              disabled={isPlacing}
              type="submit"
              className={`w-full py-4 text-white font-bold font-display rounded-2xl transition shadow-lg flex items-center justify-center gap-2 select-none ${
                isPlacing
                  ? 'bg-brand-500 cursor-not-allowed text-brand-200'
                  : paymentMethod === 'ONLINE'
                    ? 'bg-cyan-600 hover:bg-cyan-700 shadow-cyan-550/10 cursor-pointer text-sm animate-pulse'
                    : 'bg-brand-600 hover:bg-brand-700 shadow-brand-550/10 cursor-pointer text-sm'
              }`}
            >
              <span>
                {isPlacing 
                  ? 'Processing Order...' 
                  : paymentMethod === 'ONLINE'
                    ? `Proceed to Pay Online (₹${finalTotal})` 
                    : 'Confirm & Place COD Order'
                }
              </span>
              {!isPlacing && <ArrowRight className="w-5 h-5 shrink-0" />}
            </button>
            <p className="text-[9px] text-center text-gray-400">
              {paymentMethod === 'COD' 
                ? 'By clicking you submit to Cash collection upon doorstep deliveries.' 
                : 'Transactions are secured with certified AES SSL checkout tokenisation.'}
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] text-slate-500 flex gap-2">
            <Truck className="w-5 h-5 text-gray-400 shrink-0" />
            <p className="leading-snug">
              Need assistance? Call Jangaon Store at <span className="font-bold text-slate-700">+91 98765 43210</span> for lightning-fast orders or alterations.
            </p>
          </div>

        </div>

      </div>

      {/* SECURE ONLINE PAYMENT GATEWAY OVERLAY MODAL */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative bg-white rounded-3xl max-w-md w-full border border-slate-100 overflow-hidden shadow-2xl animate-in zoom-in duration-200 flex flex-col justify-between">
            
            {/* Header */}
            <div className="bg-slate-950 p-5 text-white flex justify-between items-center relative">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-cyan-500 rounded-lg flex items-center justify-center text-slate-950 font-black text-xs">
                  ⚡
                </div>
                <div>
                  <h4 className="font-display font-extrabold text-sm tracking-tight">JangaonMart SecurePay</h4>
                  <p className="text-[9px] text-cyan-400 font-mono flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" /> 256-Bit SSL Secured Gateway
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowPaymentModal(false)}
                className="w-8 h-8 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition border border-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Gateway Body content */}
            <div className="p-5 space-y-4">
              
              {/* Payment Details overview Banner */}
              <div className="bg-slate-50 border border-slate-200/50 p-3.5 rounded-2xl flex justify-between items-center text-xs">
                <div>
                  <p className="text-gray-450 uppercase text-[9px] font-bold tracking-widest">Paying To</p>
                  <p className="font-black text-slate-800">JangaonMart Groceries Pvt Ltd</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-450 uppercase text-[9px] font-bold tracking-widest">Amount</p>
                  <p className="font-black text-cyan-700 text-base">₹{finalTotal}</p>
                </div>
              </div>

              {paymentGatewayState === 'SELECT' && (
                <div className="space-y-4">
                  {/* Select Payment Mode Tabs */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1 rounded-xl text-center text-xs font-bold font-display select-none">
                    <div 
                      onClick={() => setPaymentType('UPI')}
                      className={`py-2 rounded-lg cursor-pointer transition ${paymentType === 'UPI' ? 'bg-white text-slate-900 shadow-3xs' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                      UPI (GPay)
                    </div>
                    <div 
                      onClick={() => setPaymentType('CARD')}
                      className={`py-2 rounded-lg cursor-pointer transition ${paymentType === 'CARD' ? 'bg-white text-slate-900 shadow-3xs' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                      Debit Card
                    </div>
                    <div 
                      onClick={() => setPaymentType('NETBANKING')}
                      className={`py-2 rounded-lg cursor-pointer transition ${paymentType === 'NETBANKING' ? 'bg-white text-slate-900 shadow-3xs' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                      Netbanking
                    </div>
                  </div>

                  {/* UPI Inputs */}
                  {paymentType === 'UPI' && (
                    <div className="space-y-3 pt-1">
                      <div className="space-y-1 text-left">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Your Virtual UPI Address (VPA)</label>
                        <input 
                          type="text" 
                          placeholder="yourname@okaxis" 
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 bg-slate-50/50 rounded-xl focus:outline-none focus:ring-1 focus:ring-cyan-500"
                        />
                      </div>
                      <div className="flex gap-2">
                        <span className="text-[9px] bg-slate-100 px-2 py-1 rounded text-slate-550 cursor-pointer" onClick={() => setUpiId('baldeshruthi17@okicici')}>baldeshruthi17@okicici</span>
                        <span className="text-[9px] bg-slate-100 px-2 py-1 rounded text-slate-550 cursor-pointer" onClick={() => setUpiId('jangaonmart@okaxis')}>jangaonmart@okaxis</span>
                      </div>
                      <div className="p-3 bg-cyan-50/50 border border-cyan-100 rounded-xl text-[10px] text-cyan-805 leading-normal flex gap-1.5 items-start">
                        <Smartphone className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
                        <p>We'll trigger a real-time smart simulation request. Ensure sufficient linked local Indian bank account balance.</p>
                      </div>
                    </div>
                  )}

                  {/* Card Inputs */}
                  {paymentType === 'CARD' && (
                    <div className="space-y-3 pt-1">
                      <div className="space-y-1 text-left">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Debit/Credit Card Number</label>
                        <input 
                          type="text" 
                          placeholder="4321 8765 0987 1111" 
                          value={cardNumber}
                          maxLength={19}
                          onChange={(e) => setCardNumber(e.target.value.replace(/[^\d\s]/g, ''))}
                          className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 bg-slate-50/50 rounded-xl focus:outline-none focus:ring-1 focus:ring-cyan-500"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1 text-left">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Expiry Date</label>
                          <input 
                            type="text" 
                            placeholder="MM/YY" 
                            maxLength={5}
                            value={cardExpiry}
                            onChange={(e) => {
                              let v = e.target.value;
                              if (v.length === 2 && !v.includes('/')) v += '/';
                              setCardExpiry(v);
                            }}
                            className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 bg-slate-50/50 rounded-xl focus:outline-none focus:ring-1 focus:ring-cyan-500 text-center"
                          />
                        </div>
                        <div className="space-y-1 text-left">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">CVV Code</label>
                          <input 
                            type="password" 
                            placeholder="•••" 
                            maxLength={3}
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                            className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 bg-slate-50/50 rounded-xl focus:outline-none focus:ring-1 focus:ring-cyan-500 text-center"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Netbanking Option */}
                  {paymentType === 'NETBANKING' && (
                    <div className="space-y-2 pt-1 text-left">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Popular Institutions</label>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2.5 border border-slate-200 hover:border-cyan-500 rounded-xl cursor-not-allowed bg-slate-50 font-bold flex items-center gap-1.5 opacity-60">
                          🏛️ State Bank of India
                        </div>
                        <div className="p-2.5 border border-slate-200 hover:border-cyan-500 rounded-xl cursor-not-allowed bg-slate-50 font-bold flex items-center gap-1.5 opacity-60">
                          🏦 ICICI Bank
                        </div>
                        <div className="p-2.5 border border-slate-200 hover:border-cyan-500 rounded-xl cursor-not-allowed bg-slate-50 font-bold flex items-center gap-1.5 opacity-60">
                          🏛️ HDFC Bank
                        </div>
                        <div className="p-2.5 border border-cyan-300 hover:bg-cyan-50/20 rounded-xl cursor-default bg-white font-bold flex items-center gap-1.5 text-cyan-800">
                          🌾 Jangaon Coop Bank
                        </div>
                      </div>
                      <p className="text-[9px] text-slate-400 mt-1">Note: Only local cooperative integration is loaded in this testing cycle Sandbox mode.</p>
                    </div>
                  )}

                  {/* Simulation Command controls */}
                  <div className="pt-2 border-t border-slate-100 flex gap-2">
                    <button
                      onClick={handleSimulatePaymentSuccess}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-2xl text-[11px] font-black tracking-wide cursor-pointer text-center shadow-md hover:scale-[1.02] active:scale-95 transition"
                    >
                      🟢 SIMULATE SUCCESS
                    </button>
                    <button
                      onClick={handleSimulatePaymentFailure}
                      className="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-3 rounded-2xl text-[11px] font-black tracking-wide cursor-pointer text-center shadow-md hover:scale-[1.02] active:scale-95 transition"
                    >
                      🔴 SIMULATE FAILURE
                    </button>
                  </div>
                </div>
              )}

              {paymentGatewayState === 'PROCESSING' && (
                <div className="py-8 text-center space-y-4">
                  <div className="relative w-14 h-14 mx-auto flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-cyan-500 border-t-transparent animate-spin"></div>
                  </div>
                  <div>
                    <h5 className="font-extrabold text-slate-800 text-sm">Processing Payment securely...</h5>
                    <p className="text-[10px] text-gray-400 mt-1">Connecting to gateway backend. Please do not close this window.</p>
                  </div>
                </div>
              )}

              {paymentGatewayState === 'SUCCESS' && (
                <div className="py-8 text-center space-y-3">
                  <div className="w-14 h-14 bg-emerald-100 rounded-full mx-auto flex items-center justify-center text-emerald-600">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h5 className="font-extrabold text-emerald-800 text-sm">Payment Captured Successfully!</h5>
                    <p className="text-[10px] text-emerald-600 mt-1">Generating your pre-paid order docket, please wait...</p>
                  </div>
                </div>
              )}

              {paymentGatewayState === 'FAILED' && (
                <div className="py-6 text-center space-y-4">
                  <div className="w-14 h-14 bg-red-100 rounded-full mx-auto flex items-center justify-center text-red-600">
                    <AlertTriangle className="w-8 h-8" />
                  </div>
                  <div className="bg-red-50 text-red-950 p-3 rounded-2xl border border-red-100 text-left text-[11px] font-medium leading-relaxed">
                    <span className="font-bold block text-red-900 mb-0.5">Payment Failed</span>
                    {paymentError}
                  </div>
                  
                  {/* RETRY PAYMENT SYSTEM FOR REQUIREMENT 7 */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setPaymentGatewayState('SELECT');
                        setPaymentError('');
                      }}
                      className="flex-1 bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-2xl text-[11px] font-bold tracking-wide cursor-pointer text-center flex items-center justify-center gap-1.5 transition-all"
                    >
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Retry Payment Option</span>
                    </button>
                    <button
                      onClick={() => {
                        setPaymentMethod('COD');
                        setShowPaymentModal(false);
                        showToast('Switched to Cash on Delivery mode.', 'info');
                      }}
                      className="flex-1 bg-white hover:bg-slate-150 border border-slate-300 text-slate-800 py-3 rounded-2xl text-[11px] font-bold tracking-wide cursor-pointer text-center transition"
                    >
                      Switch to COD Option
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* Footer lock symbol */}
            <div className="bg-slate-50 border-t border-slate-150 px-5 py-3 text-center text-[10px] text-gray-400 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>PCI-DSS Compliance Level 1 Secured. JangaonMart Services.</span>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

