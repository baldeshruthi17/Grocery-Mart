import React from 'react';
import { Product } from '../types';
import { useAppState } from '../context/StateContext';
import { motion } from 'motion/react';
import { Plus, Minus, ShoppingCart, Percent, AlertTriangle } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { cart, addToCart, updateCartQuantity, navigate } = useAppState();

  // Find if this product is already in the cart
  const cartItem = cart.find((item) => item.product.id === product.id);
  const isLowStock = product.stock > 0 && product.stock <= 10;
  const isOutOfStock = product.stock === 0 || !product.isAvailable;

  const handleProductClick = () => {
    navigate(`#/product/${product.id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`group relative bg-white rounded-2xl border ${
        isOutOfStock
          ? 'border-gray-200 bg-gray-50/50'
          : isLowStock
          ? 'border-amber-200 hover:shadow-lg hover:shadow-amber-50'
          : 'border-slate-100 hover:shadow-xl hover:shadow-slate-50'
      } p-3.5 flex flex-col justify-between transition-all duration-300 h-full overflow-hidden`}
    >
      {/* Discount Badge */}
      {product.discount > 0 && !isOutOfStock && (
        <div className="absolute top-2.5 left-2.5 z-10 bg-red-500 text-white text-[10px] font-extrabold px-2 py-1 rounded-full flex items-center gap-0.5 shadow-sm">
          <Percent className="w-3 h-3 shrink-0" />
          <span>{product.discount}% OFF</span>
        </div>
      )}

      {/* Stock warning badge */}
      {isLowStock && !isOutOfStock && (
        <div className="absolute top-2.5 right-2.5 z-10 bg-amber-50 text-amber-700 text-[9px] font-bold px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
          <AlertTriangle className="w-2.5 h-2.5 text-amber-500 animate-pulse" />
          <span>Only {product.stock} left!</span>
        </div>
      )}

      {/* Image container click leads to details */}
      <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-50 mb-3 cursor-pointer" onClick={handleProductClick}>
        <img
          src={product.image}
          alt={product.name}
          referrerPolicy="no-referrer"
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
            isOutOfStock ? 'opacity-40 grayscale' : ''
          }`}
        />
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[1px]">
            <span className="bg-red-500 text-white font-display text-xs font-bold px-3 py-1.5 rounded-full shadow-md uppercase tracking-wider">
              Out of stock
            </span>
          </div>
        )}
      </div>

      {/* Product Content info */}
      <div className="flex-1 flex flex-col justify-between">
        <div className="mb-2">
          {/* Brand & Category info line */}
          <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1">
            <span className="text-brand-600 truncate max-w-[80px]">{product.brand || 'JangaonMart'}</span>
            <span>•</span>
            <span className="truncate">{product.category}</span>
          </div>

          <h3
            onClick={handleProductClick}
            className={`font-display font-bold text-sm tracking-tight text-gray-800 line-clamp-2 cursor-pointer hover:text-brand-600 ${
              isOutOfStock ? 'text-gray-400' : ''
            }`}
          >
            {product.name}
          </h3>
          <p className="text-xs text-gray-400 mt-0.5 font-medium">{product.unit}</p>
        </div>

        {/* Pricing & Add/Subtract Controls section */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
          <div className="flex flex-col">
            <span className={`text-base font-extrabold text-gray-900 ${isOutOfStock ? 'text-gray-400' : ''}`}>
              ₹{product.price}
            </span>
            {product.mrp > product.price && (
              <span className="text-xs text-gray-400 line-through -mt-0.5">
                ₹{product.mrp}
              </span>
            )}
          </div>

          {/* Add block */}
          {isOutOfStock ? (
            <button
              disabled
              className="px-3.5 py-1.5 bg-gray-200 text-gray-400 rounded-lg text-xs font-bold cursor-not-allowed uppercase"
            >
              Sold Out
            </button>
          ) : cartItem ? (
            /* Instamart styled Quantity adjuster */
            <div className="flex items-center bg-brand-600 text-white rounded-xl shadow-md min-w-[85px] justify-between h-8 select-none p-1">
              <button
                onClick={() => updateCartQuantity(product.id, cartItem.quantity - 1)}
                className="w-6 h-6 hover:bg-brand-700 rounded-lg flex items-center justify-center transition"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs font-extrabold shrink-0 px-1">{cartItem.quantity}</span>
              <button
                onClick={() => updateCartQuantity(product.id, cartItem.quantity + 1)}
                className="w-6 h-6 hover:bg-brand-700 rounded-lg flex items-center justify-center transition"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            /* Standard Add to Cart button */
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => addToCart(product, 1)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-brand-50 hover:bg-brand-600 text-brand-700 hover:text-white rounded-xl text-xs font-bold border border-brand-200 hover:border-brand-600 transition-colors duration-200 shadow-sm shadow-brand-50 cursor-pointer"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>ADD</span>
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
