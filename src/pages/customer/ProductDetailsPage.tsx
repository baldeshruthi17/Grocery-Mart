import React, { useState, useEffect } from 'react';
import { useAppState } from '../../context/StateContext';
import { ProductCard } from '../../components/ProductCard';
import { motion } from 'motion/react';
import { ArrowLeft, ShoppingCart, ShieldCheck, Truck, RefreshCw, Check, Star, Sparkles, Plus, Minus, AlertTriangle } from 'lucide-react';

export const ProductDetailsPage: React.FC = () => {
  const { currentPath, products, cart, addToCart, updateCartQuantity, navigate } = useAppState();
  
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'info' | 'benefits' | 'shipping'>('info');

  // Extract ID from path: '#/product/id' or similar
  const pathParts = currentPath.split('/');
  const productId = pathParts[2] ? pathParts[2].split('?')[0] : '';
  const product = products.find((p) => p.id === productId);

  // Reset selected quantity when moving between products
  useEffect(() => {
    setSelectedQuantity(1);
  }, [productId]);

  if (!product) {
    return (
      <div className="py-12 text-center space-y-4">
        <p className="text-gray-500 font-semibold font-display text-lg">Product Not Found or has been retired.</p>
        <button
          onClick={() => navigate('#/products')}
          className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs"
        >
          View Grocery Directory
        </button>
      </div>
    );
  }

  const isLowStock = product.stock > 0 && product.stock <= 10;
  const isOutOfStock = product.stock === 0 || !product.isAvailable;
  
  // Find similar items (same category, excluding this one, maximum 4 items)
  const similarProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id && p.isAvailable)
    .slice(0, 4);

  // Check if item is already added in the cart
  const cartItem = cart.find((item) => item.product.id === product.id);

  const handleAddToCartClick = () => {
    addToCart(product, selectedQuantity);
  };

  return (
    <div className="space-y-12 pb-16 text-left">
      
      {/* Back Button breadcrumb */}
      <button
        onClick={() => {
          // Fall back to products list
          window.history.back();
        }}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-brand-600 transition group select-none cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        <span>Back to Browse</span>
      </button>

      {/* Main product card layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm">
        
        {/* Left column: Image carousel preview container */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center">
            <img
              src={product.image}
              alt={product.name}
              referrerPolicy="no-referrer"
              className={`w-full h-full object-cover ${isOutOfStock ? 'opacity-30 grayscale' : ''}`}
            />
            {product.discount > 0 && !isOutOfStock && (
              <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-extrabold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{product.discount}% SMART DISCOUNT</span>
              </div>
            )}
            {isOutOfStock && (
              <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px] flex items-center justify-center">
                <span className="bg-red-500 text-white font-display text-sm font-bold px-4 py-2 rounded-full uppercase shadow-lg">
                  Out Of Stock Temporary
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right column: Specs and checkout adder */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            
            {/* Category / Brand Row */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md font-bold uppercase tracking-wider">
                Category: {product.category}
              </span>
              {product.brand && (
                <span className="text-[10px] bg-brand-50 text-brand-700 px-2.5 py-1 rounded-md font-bold uppercase tracking-wider border border-brand-100">
                  {product.brand} Verified
                </span>
              )}
            </div>

            <h1 className="font-display text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {product.name}
            </h1>

            <div className="flex items-center gap-3">
              <p className="text-sm text-gray-500 font-semibold">{product.unit} pack size</p>
              <span>•</span>
              {product.stock > 0 ? (
                <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>Available in Stock ({product.stock} units left)</span>
                </span>
              ) : (
                <span className="text-xs text-red-500 font-bold flex items-center gap-1">
                  <Minus className="w-4 h-4 shrink-0" />
                  <span>Out of stock</span>
                </span>
              )}
            </div>

            {/* Price block detailing discount specs */}
            <div className="p-4 bg-brand-50/50 rounded-2xl border border-brand-100/30 flex items-center justify-between mt-3">
              <div className="space-y-0.5">
                <p className="text-xs text-slate-400 font-medium">JangaonMart Price</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-gray-950">₹{product.price}</span>
                  {product.mrp > product.price && (
                    <span className="text-sm text-gray-400 line-through">₹{product.mrp}</span>
                  )}
                </div>
              </div>

              {product.discount > 0 && (
                <div className="bg-red-50 text-red-700 rounded-xl px-3 py-1.5 border border-red-100 text-right">
                  <p className="text-[9px] font-extrabold text-red-500 uppercase tracking-widest">You Save</p>
                  <p className="text-sm font-extrabold">₹{product.mrp - product.price} ({product.discount}%)</p>
                </div>
              )}
            </div>

          </div>

          {/* Description Block */}
          <div className="space-y-3 border-t border-slate-50 pt-5 text-sm leading-relaxed text-gray-600">
            <h3 className="font-display font-bold text-gray-900 text-sm">Product Description</h3>
            <p>{product.description}</p>
          </div>

          {/* Incrementor and Cart adding section */}
          <div className="space-y-4 border-t border-slate-50 pt-5">
            {isOutOfStock ? (
              <button
                disabled
                className="w-full py-4 bg-gray-200 text-gray-400 text-sm font-bold rounded-2xl cursor-not-allowed uppercase tracking-wider"
              >
                Let me know when back in stock
              </button>
            ) : cartItem ? (
              /* Already in cart summary block */
              <div className="space-y-3">
                <p className="text-xs text-brand-700 font-bold bg-brand-50 border border-brand-100 px-3 py-2 rounded-xl text-center">
                  This product is already in your basket! Let's modify the quantity:
                </p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center bg-brand-600 text-white rounded-2xl shadow-md p-1.5 justify-between w-32 select-none">
                    <button
                      onClick={() => updateCartQuantity(product.id, cartItem.quantity - 1)}
                      className="w-8 h-8 hover:bg-brand-700 rounded-xl flex items-center justify-center transition"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-sm font-black shrink-0">{cartItem.quantity}</span>
                    <button
                      onClick={() => updateCartQuantity(product.id, cartItem.quantity + 1)}
                      className="w-8 h-8 hover:bg-brand-700 rounded-xl flex items-center justify-center transition"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => navigate('#/cart')}
                    className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold transition shadow-md cursor-pointer"
                  >
                    Open Basket to Checkout
                  </button>
                </div>
              </div>
            ) : (
              /* Quantity selector on details view first time */
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  {isLowStock && (
                    <div className="flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200 font-medium">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                      <span>Limited quantities available! Max allowed: {product.stock}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  {/* Select size incrementer */}
                  <div className="flex items-center bg-gray-100 text-gray-800 rounded-2xl border border-gray-200 p-1.5 justify-between w-28 select-none">
                    <button
                      onClick={() => setSelectedQuantity(Math.max(1, selectedQuantity - 1))}
                      className="w-8 h-8 hover:bg-gray-200 rounded-xl flex items-center justify-center transition"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-sm font-semibold shrink-0">{selectedQuantity}</span>
                    <button
                      onClick={() => setSelectedQuantity(Math.min(product.stock, selectedQuantity + 1))}
                      className="w-8 h-8 hover:bg-gray-200 rounded-xl flex items-center justify-center transition"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAddToCartClick}
                    className="flex-1 py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-extrabold rounded-2xl transition shadow-lg shadow-brand-500/10 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    <span>ADD TO BASKET • ₹{product.price * selectedQuantity}</span>
                  </motion.button>
                </div>
              </div>
            )}
          </div>

          {/* Hyperlocal confidence row badges */}
          <div className="grid grid-cols-3 gap-3 border-t border-slate-100 pt-5 text-center text-[10px] text-gray-500">
            <div className="flex flex-col items-center p-2.5 bg-slate-50 rounded-xl">
              <Truck className="w-4 h-4 text-brand-600 mb-1" />
              <span className="font-bold text-gray-700">60 Min Delivery</span>
              <span className="text-gray-400 mt-0.5">Jangaon doorstep</span>
            </div>
            <div className="flex flex-col items-center p-2.5 bg-slate-50 rounded-xl">
              <ShieldCheck className="w-4 h-4 text-brand-600 mb-1" />
              <span className="font-bold text-gray-700">Premium Sealing</span>
              <span className="text-gray-400 mt-0.5">100% Hygienic</span>
            </div>
            <div className="flex flex-col items-center p-2.5 bg-slate-50 rounded-xl">
              <RefreshCw className="w-4 h-4 text-brand-600 mb-1" />
              <span className="font-bold text-gray-700">Easy Return</span>
              <span className="text-gray-400 mt-0.5">Return on delivery</span>
            </div>
          </div>

        </div>

      </div>

      {/* Recommended/Similar Products section */}
      {similarProducts.length > 0 && (
        <section className="space-y-6">
          <div className="text-left border-b border-gray-100 pb-3">
            <h2 className="font-display font-black text-xl text-gray-900 tracking-tight">
              People Also Bought
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Similar items in "{product.category}" department</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {similarProducts.map((simProd) => (
              <ProductCard key={simProd.id} product={simProd} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
};
