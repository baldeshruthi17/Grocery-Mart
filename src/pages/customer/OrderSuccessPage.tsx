import React from 'react';
import { useAppState } from '../../context/StateContext';
import { motion } from 'motion/react';
import { CheckCircle2, ShoppingBag, ArrowRight, Phone, MessageSquare, Truck, Copy, Check } from 'lucide-react';

export const OrderSuccessPage: React.FC = () => {
  const { currentPath, orders, navigate, showToast } = useAppState();

  // Extract ID: '#/order-success/JM-XXXXXX'
  const pathParts = currentPath.split('/');
  const orderId = pathParts[2] ? pathParts[2].split('?')[0] : '';
  const order = orders.find((o) => o.id === orderId);

  // If no order in path, fallback to latest order
  const activeOrder = order || orders[0];

  const handleCopyId = () => {
    if (!activeOrder) return;
    navigator.clipboard.writeText(activeOrder.id);
    showToast(`Order ID "${activeOrder.id}" copied to clipboard!`, 'success');
  };

  if (!activeOrder) {
    return (
      <div className="py-12 text-center space-y-4">
        <p className="text-gray-500 font-semibold font-display text-lg">No active order was located.</p>
        <button
          onClick={() => navigate('#/products')}
          className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs"
        >
          Browse Groceries
        </button>
      </div>
    );
  }

  // Construct a beautiful WhatsApp share message
  const whatsappMessage = encodeURIComponent(
    `*JangaonMart Order Confirmed!*\n\n` +
    `Hello JangaonMart Team,\n` +
    `I have placed an order on JangaonMart.\n\n` +
    `*Order ID:* ${activeOrder.id}\n` +
    `*Customer:* ${activeOrder.customerName}\n` +
    `*Slot:* ${activeOrder.address.deliverySlot}\n` +
    `*Total Payable (COD):* ₹${activeOrder.total}\n\n` +
    `*Address:* ${activeOrder.address.fullAddress}\n\n` +
    `Please prepare and dispatch my order. Thank you!`
  );

  const whatsappUrl = `https://api.whatsapp.com/send?phone=919876543210&text=${whatsappMessage}`;

  return (
    <div className="max-w-xl mx-auto space-y-8 pb-16 text-center">
      
      {/* 1. Success Circle Animation */}
      <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm space-y-5 flex flex-col items-center justify-center">
        
        <motion.div
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
          className="w-20 h-20 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-600"
        >
          <CheckCircle2 className="w-12 h-12" />
        </motion.div>

        <div className="space-y-1">
          <p className="text-emerald-600 font-extrabold text-[10px] tracking-widest uppercase">Order Confirmed Successfully</p>
          <h1 className="font-display font-black text-2xl text-slate-900 tracking-tight">Your Order Will Be Packed Now</h1>
          <p className="text-xs text-gray-500">Scheduled for doorstep drop-off in Jangaon in <span className="font-bold text-gray-800">60 minutes!</span></p>
        </div>

        {/* Highlighted Order ID with click to copy */}
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-150 rounded-2xl select-none">
          <span className="text-xs text-slate-400 font-bold">ORDER ID:</span>
          <span className="font-mono text-sm font-black text-slate-800 tracking-wider">{activeOrder.id}</span>
          <button
            onClick={handleCopyId}
            className="p-1 text-slate-400 hover:text-slate-800 rounded transition border border-transparent hover:border-slate-200"
            title="Copy Order ID"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Order summary specs */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 space-y-6 shadow-sm text-left">
        <h3 className="font-display font-extrabold text-base text-gray-900 border-b border-gray-50 pb-3">
          Jangaon Delivery Details
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-slate-450 font-bold uppercase tracking-wider text-[9px]">Deliver To</span>
            <p className="font-bold text-gray-900">{activeOrder.customerName}</p>
            <p className="text-gray-600 mt-0.5 leading-snug">{activeOrder.address.fullAddress}</p>
            {activeOrder.address.landmark && (
              <p className="text-[10px] text-brand-700 font-semibold italic mt-1 bg-brand-50/50 p-1 rounded">
                Landmark: {activeOrder.address.landmark}
              </p>
            )}
          </div>

          <div className="space-y-1.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col justify-between">
            <div className="space-y-1">
              <span className="text-slate-450 font-bold uppercase tracking-wider text-[9px]">Scheduled Slot</span>
              <p className="font-bold text-gray-900 flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-brand-600 animate-pulse" />
                <span>{activeOrder.address.deliverySlot}</span>
              </p>
            </div>
            
            <div className="space-y-0.5 pt-3 border-t border-slate-200/50 mt-2">
              <span className="text-slate-450 font-bold uppercase tracking-wider text-[9px]">Standard Contact</span>
              <p className="font-bold text-gray-800">+91 {activeOrder.phone}</p>
            </div>
          </div>
        </div>

        {/* Items invoices summary */}
        <div className="space-y-3.5 pt-2">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest">Ordered Groceries</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {activeOrder.items.map((item) => (
              <div key={item.productId} className="flex justify-between items-center text-xs text-slate-800 py-1.5 border-b border-slate-50 last:border-0">
                <div className="flex items-center gap-2 truncate pr-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-8 h-8 rounded object-cover border border-slate-100"
                  />
                  <span className="truncate">{item.name}</span>
                </div>
                <span className="text-slate-400 shrink-0">x{item.quantity}</span>
                <span className="font-extrabold text-slate-900 shrink-0 text-right min-w-[60px]">₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Invoice pricing summary */}
        <div className="p-4 bg-brand-50/40 rounded-2xl border border-brand-100/20 space-y-2 text-xs">
          <div className="flex justify-between text-slate-500">
            <span>Price Subtotal</span>
            <span>₹{activeOrder.subtotal}</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Shipping & Courier Fee</span>
            <span>{activeOrder.deliveryFee === 0 ? 'FREE Delivery' : `₹${activeOrder.deliveryFee}`}</span>
          </div>
          <div className="border-t border-slate-200/40 pt-2 flex justify-between items-center text-slate-900 text-sm">
            <span className="font-display font-extrabold text-slate-900">Total payable cash on delivery (COD)</span>
            <span className="font-display font-black text-lg text-brand-600">₹{activeOrder.total}</span>
          </div>
        </div>
      </div>

      {/* 3. CTA Option panels */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* WhatsApp sharing confirmation triggers */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 transition cursor-pointer"
        >
          <MessageSquare className="w-4.5 h-4.5 shrink-0" />
          <span>Confirm on WhatsApp</span>
        </a>

        <button
          onClick={() => navigate('#/orders')}
          className="flex-1 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
        >
          <span>Track Live Order</span>
          <ArrowRight className="w-4 h-4 shrink-0" />
        </button>
      </div>

      <button
        onClick={() => navigate('#/products')}
        className="text-xs font-bold text-gray-400 hover:text-brand-600 hover:underline select-none"
      >
        Continue Shopping on JangaonMart
      </button>

    </div>
  );
};
