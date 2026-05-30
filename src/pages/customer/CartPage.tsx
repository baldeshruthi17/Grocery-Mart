import React, { useState } from 'react';
import { useAppState } from '../../context/StateContext';
import { ShoppingBag, ArrowRight, Trash2, Tag, Percent, Info, MapPin, Truck, HelpCircle, ArrowLeft, Ticket } from 'lucide-react';

export const CartPage: React.FC = () => {
  const {
    cart,
    updateCartQuantity,
    removeFromCart,
    cartSubtotal,
    deliveryFee,
    cartTotal,
    navigate,
  } = useAppState();

  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');

  const minOrderValue = 99;
  const isBelowMinOrder = cartSubtotal > 0 && cartSubtotal < minOrderValue;
  const neededForMinOrder = minOrderValue - cartSubtotal;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');

    const cleanCode = couponCode.trim().toUpperCase();

    if (appliedCoupon) {
      setCouponError('A coupon is already active on this order!');
      return;
    }

    if (cleanCode === 'WELCOME50') {
      if (cartSubtotal < 399) {
        setCouponError('Add items worth ₹399 or more to use "WELCOME50"!');
        return;
      }
      setDiscountAmount(50);
      setAppliedCoupon('WELCOME50 (₹50 OFF on orders > ₹399)');
      setCouponCode('');
    } else if (cleanCode === 'JANGFREE') {
      if (deliveryFee === 0) {
        setCouponError('Your shipping is already free!');
        return;
      }
      setDiscountAmount(deliveryFee);
      setAppliedCoupon('JANGFREE (Free delivery fee waived)');
      setCouponCode('');
    } else {
      setCouponError('Invalid coupon. Try WELCOME50 or JANGFREE');
    }
  };

  const handleRemoveCoupon = () => {
    setDiscountAmount(0);
    setAppliedCoupon('');
  };

  const finalOrderSubtotal = Math.max(0, cartSubtotal - discountAmount);
  // Recompute total considering applied coupons
  const finalOrderTotal = Math.max(0, cartSubtotal - (appliedCoupon.includes('WELCOME50') ? 50 : 0) + (appliedCoupon.includes('JANGFREE') ? 0 : deliveryFee));

  return (
    <div className="space-y-6 pb-12 text-left">
      <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
        <div className="p-2.5 bg-brand-50 rounded-xl text-brand-600">
          <ShoppingBag className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-display font-black text-2xl text-gray-900 tracking-tight">Shopping Basket</h1>
          <p className="text-xs text-gray-400">Review your groceries and schedule immediate delivery</p>
        </div>
      </div>

      {cart.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main items listing column */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Minimum order value alert banner */}
            {isBelowMinOrder ? (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-amber-900 shadow-sm animate-pulse">
                <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-xs font-bold text-amber-800">Minimum Order Amount not met!</p>
                  <p className="text-xs">
                    Please add groceries worth <span className="font-extrabold">₹{neededForMinOrder} more</span> to reach the minimum Jangaon delivery threshold of ₹99.
                  </p>
                  <button
                    onClick={() => navigate('#/products')}
                    className="text-xs font-extrabold text-brand-700 hover:underline flex items-center gap-1 pt-1"
                  >
                    <span>Keep Browsing items</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3.5 bg-brand-50/50 border border-brand-100 rounded-xl flex items-center gap-2.5 text-xs text-brand-800">
                <Truck className="w-4 h-4 text-brand-600 shrink-0 animate-bounce" />
                <span className="font-semibold">60-minute doorstep courier guarantee. Fast packing is active!</span>
              </div>
            )}

            <div className="space-y-2.5">
              {cart.map((item) => (
                <div
                  key={item.product.id}
                  className="flex items-center justify-between gap-4 p-4 bg-white border border-slate-100 rounded-2xl hover:shadow-sm transition"
                >
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 object-cover rounded-xl border border-gray-100 shrink-0"
                  />
                  
                  {/* Info details */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{item.product.brand || 'Local'}</p>
                    <h3
                      onClick={() => navigate(`#/product/${item.product.id}`)}
                      className="font-display font-bold text-sm text-gray-950 truncate hover:text-brand-600 cursor-pointer"
                    >
                      {item.product.name}
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">{item.product.unit}</p>
                  </div>

                  {/* Quantity control controls */}
                  <div className="flex items-center bg-gray-100 text-gray-800 rounded-xl border border-gray-200 px-1 py-1 shrink-0 h-8">
                    <button
                      onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                      className="w-6 h-6 hover:bg-slate-200 rounded-lg flex items-center justify-center transition"
                    >
                      <span className="text-sm font-bold">-</span>
                    </button>
                    <span className="text-xs font-black px-2.5">{item.quantity}</span>
                    <button
                      onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                      className="w-6 h-6 hover:bg-slate-200 rounded-lg flex items-center justify-center transition"
                    >
                      <span className="text-sm font-bold">+</span>
                    </button>
                  </div>

                  {/* Item total price */}
                  <div className="text-right shrink-0 min-w-[70px]">
                    <span className="text-sm font-extrabold text-gray-800">
                      ₹{item.product.price * item.quantity}
                    </span>
                    {item.product.mrp > item.product.price && (
                      <p className="text-[10px] text-gray-400 line-through">
                        ₹{item.product.mrp * item.quantity}
                      </p>
                    )}
                  </div>

                  {/* Remove action button */}
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition shrink-0 border border-transparent hover:border-red-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={() => navigate('#/products')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-850 hover:underline select-none pt-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Grocery Catalog</span>
            </button>
          </div>

          {/* Right Summary Column */}
          <div className="space-y-6">
            
            {/* Coupon Code Panel */}
            <div className="bg-white border border-slate-100 rounded-2xl p-5 space-y-4 shadow-xs">
              <h3 className="font-display font-bold text-sm text-slate-800 flex items-center gap-1.5 border-b border-gray-50 pb-2">
                <Ticket className="w-4 h-4 text-brand-600 animate-pulse" />
                <span>Apply Promo Coupon</span>
              </h3>

              {!appliedCoupon ? (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter promocode..."
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 uppercase font-semibold"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
                  >
                    Apply
                  </button>
                </form>
              ) : (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl flex items-center justify-between text-xs font-medium">
                  <div className="flex items-center gap-2">
                    <Percent className="w-4 h-4 text-emerald-600" />
                    <span>Applied: {appliedCoupon}</span>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    className="text-red-500 hover:text-red-700 font-extrabold text-[10px]"
                  >
                    REMOVE
                  </button>
                </div>
              )}

              {couponError && <p className="text-[10px] text-red-500 font-semibold">{couponError}</p>}

              {/* Hints list of active promotional codes */}
              <div className="space-y-2 pt-1 border-t border-slate-50">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Active Coupons</p>
                <div className="text-[10px] space-y-1">
                  <div className="flex justify-between items-center text-slate-600">
                    <code className="bg-slate-100 px-1 py-0.5 rounded font-extrabold text-slate-700 text-[9px]">WELCOME50</code>
                    <span>₹50 cash off (orders &gt; ₹399)</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <code className="bg-slate-100 px-1 py-0.5 rounded font-extrabold text-slate-700 text-[9px]">JANGFREE</code>
                    <span>Waiver on Delivery Fee</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Price invoice computation layout */}
            <div className="bg-white border border-slate-100 rounded-2xl p-5 space-y-4 shadow-sm">
              <h3 className="font-display font-bold text-sm text-slate-900 border-b border-gray-50 pb-2">Invoice Summary</h3>
              
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Price Subtotal</span>
                  <span className="font-semibold text-gray-900">₹{cartSubtotal}</span>
                </div>

                {appliedCoupon.includes('WELCOME50') && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>WELCOME50 Discount</span>
                    <span>- ₹50</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Hyperlocal Jangaon Delivery</span>
                  {appliedCoupon.includes('JANGFREE') ? (
                    <span className="text-emerald-600 font-medium">Free (Coupon)</span>
                  ) : deliveryFee === 0 ? (
                    <span className="text-emerald-600 font-medium">FREE Delivery</span>
                  ) : (
                    <span className="font-semibold text-gray-900">₹{deliveryFee}</span>
                  )}
                </div>

                {cartSubtotal < 499 && (
                  <p className="text-[10px] text-gray-400 pt-1 leading-normal italic text-left">
                    * Shop for ₹499 or more to unlock Free Jangaon Delivery! (Add groceries worth ₹{499 - cartSubtotal} more)
                  </p>
                )}
              </div>

              <div className="border-t border-gray-100 pt-3 flex justify-between items-center text-gray-950">
                <span className="font-display font-bold text-base">To Pay</span>
                <span className="font-display font-black text-2xl text-brand-600">
                  ₹{finalOrderTotal}
                </span>
              </div>

              {/* Action Proceed checkout triggers */}
              <button
                onClick={() => {
                  if (cartSubtotal >= minOrderValue) {
                    // Navigate to checkout with optional coupon details passed
                    navigate(`#/checkout?coupon=${appliedCoupon ? (appliedCoupon.includes('WELCOME50') ? 'WELCOME50' : 'JANGFREE') : ''}`);
                  }
                }}
                disabled={isBelowMinOrder}
                className={`w-full py-4 rounded-xl font-bold font-display text-sm flex items-center justify-center gap-2 shadow-md transition ${
                  isBelowMinOrder
                    ? 'bg-gray-100 border border-gray-200 text-gray-450 cursor-not-allowed shadow-none'
                    : 'bg-brand-600 hover:bg-brand-700 text-white shadow-brand-500/10 cursor-pointer text-base shadow-lg animate-pulse'
                }`}
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-5 h-5 shrink-0" />
              </button>
            </div>

          </div>

        </div>
      ) : (
        /* Empty baskets look and feel */
        <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center max-w-lg mx-auto flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-brand-50 flex items-center justify-center text-brand-600">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-display font-bold text-lg text-slate-800">Your Basket is Empty</h3>
            <p className="text-xs text-slate-500">
              Looks like you haven't added any groceries from local Jangaon supermarkets yet. Let's find something delicious!
            </p>
          </div>
          <button
            onClick={() => navigate('#/products')}
            className="px-5 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs shadow-md shadow-brand-500/10 cursor-pointer"
          >
            Start Shopping Groceries
          </button>
        </div>
      )}

    </div>
  );
};
