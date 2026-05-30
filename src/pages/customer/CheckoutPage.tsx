import React, { useState, useEffect } from 'react';
import { useAppState } from '../../context/StateContext';
import { ShieldCheck, ArrowRight, ClipboardList, Clock, Truck, Plus, Trash2, MapPin } from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const {
    cart,
    currentUser,
    cartSubtotal,
    deliveryFee,
    placeOrder,
    navigate,
  } = useAppState();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [deliverySlot, setDeliverySlot] = useState('Morning (8:00 AM - 11:00 AM)');
  const [acceptTerms, setAcceptTerms] = useState(true);
  const [orderNotes, setOrderNotes] = useState('');
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);
  const [isPlacing, setIsPlacing] = useState(false);

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

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

  const handlePlaceOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setIsPlacing(true);
      // Place the express order
      await placeOrder(
        name.trim(),
        phone.trim(),
        address.trim(),
        landmark.trim(),
        deliverySlot,
        orderNotes.trim()
      );
    } catch (err) {
      console.error(err);
    } finally {
      setIsPlacing(false);
    }
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
              <span>Payment Confirmation</span>
            </h3>

            <div className="p-4 bg-emerald-50 border border-emerald-250 rounded-2xl flex items-center justify-between text-emerald-950">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-750 font-bold shrink-0">
                  ₹
                </div>
                <div>
                  <p className="text-xs font-bold text-emerald-900">Cash on Delivery (COD) only</p>
                  <p className="text-[10px] text-emerald-600">No advance payment needed. Hand-over cash on grocery checks.</p>
                </div>
              </div>
              <ShieldCheck className="w-6 h-6 text-emerald-700 shrink-0" />
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
                  I agree that my items are being delivered under 60 minutes from certified hyperlocals in Jangaon Ward. Cash collection of ₹{finalTotal} will be matched on doorstep delivery.
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
                <div className="space-y-2 border-t border-b border-slate-50 py-3 max-h-56 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.product.id} className="flex gap-2 text-xs justify-between items-center text-slate-700">
                      <div className="flex items-center gap-2 shrink-0 truncate max-w-[155px]">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-8 h-8 rounded object-cover border"
                        />
                        <span className="truncate">{item.product.name}</span>
                      </div>
                      <span className="text-gray-400">x{item.quantity}</span>
                      <span className="font-semibold text-gray-800 shrink-0 text-right">₹{item.product.price * item.quantity}</span>
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
              <span className="font-display font-extrabold text-sm">TOTAL COD PAYABLE</span>
              <span className="font-display font-black text-xl text-brand-600">
                ₹{finalTotal}
              </span>
            </div>

            {/* Form Place button */}
            <button
              onClick={handlePlaceOrderSubmit}
              disabled={isPlacing}
              type="submit"
              className={`w-full py-4 text-white font-bold font-display rounded-2xl transition shadow-lg flex items-center justify-center gap-2 select-none ${
                isPlacing
                  ? 'bg-brand-500 cursor-not-allowed text-brand-200'
                  : 'bg-brand-600 hover:bg-brand-700 shadow-brand-550/10 cursor-pointer text-base'
              }`}
            >
              <span>{isPlacing ? 'Processing Order...' : 'Confirm & Place COD Order'}</span>
              {!isPlacing && <ArrowRight className="w-5 h-5 shrink-0" />}
            </button>
            <p className="text-[9px] text-center text-gray-400">By clicking you submit to Cash collection upon deliveries.</p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] text-slate-500 flex gap-2">
            <Truck className="w-5 h-5 text-gray-400 shrink-0" />
            <p className="leading-snug">
              Need assistance? Call Jangaon Store at <span className="font-bold text-slate-700">+91 98765 43210</span> for lightning-fast orders or alterations.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
