import React, { useState, useRef, useEffect } from 'react';
import { useAppState } from '../context/StateContext';
import { Product } from '../types';
import { Search, ShoppingBag, User, MapPin, Menu, X, ArrowRight, ShieldCheck, Heart } from 'lucide-react';

export const Header: React.FC = () => {
  const {
    currentPath,
    navigate,
    cart,
    currentUser,
    currentAdmin,
    logoutUser,
    products,
    cartSubtotal,
  } = useAppState();

  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Filter products for autocomplete search
  const filteredProducts = searchQuery.trim()
    ? products
        .filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.category.toLowerCase().includes(searchQuery.toLowerCase()))
        .slice(0, 5)
    : [];

  const handleSelectProduct = (id: string) => {
    setSearchQuery('');
    setShowResults(false);
    navigate(`#/product/${id}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowResults(false);
      navigate(`#/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const activeLinkClass = (path: string) => {
    return currentPath.startsWith(path)
      ? 'text-brand-600 font-semibold border-b-2 border-brand-600'
      : 'text-gray-600 hover:text-brand-600 border-b-2 border-transparent hover:border-brand-200';
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          
          {/* Logo */}
          <div className="flex items-center gap-2 shrink-0 cursor-pointer" onClick={() => navigate('#/')}>
            <div className="bg-brand-600 text-white p-2 rounded-xl shadow-md flex items-center justify-center">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <span className="font-display text-xl sm:text-2xl font-extrabold tracking-tight text-gray-900 flex items-center gap-1">
                Jangaon<span className="text-brand-600">Mart</span>
              </span>
              <p className="hidden sm:block text-[10px] font-medium tracking-wider text-gray-400 -mt-1 uppercase">
                Groceries in 60 Mins
              </p>
            </div>
          </div>

          {/* Hyperlocal Jangaon Delivery Badge */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-brand-50 rounded-full text-brand-800 shrink-0 border border-brand-100">
            <MapPin className="w-4 h-4 text-brand-600 animate-bounce" />
            <span className="text-xs font-semibold">Delivering to Jangaon Town, TS</span>
          </div>

          {/* Autocomplete Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            ref={searchRef}
            className="relative flex-1 max-w-md hidden md:block"
          >
            <div className="relative">
              <input
                type="text"
                placeholder="Search fresh onions, Basmati rice, full cream milk..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowResults(true);
                }}
                onFocus={() => setShowResults(true)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm bg-gray-50/50"
              />
              <Search className="absolute left-3.5 top-2.5 w-4.5 h-4.5 text-gray-400" />
            </div>

            {/* Autocomplete suggestions */}
            {showResults && filteredProducts.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 shadow-xl rounded-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Suggested Products
                </div>
                {filteredProducts.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => handleSelectProduct(p.id)}
                    className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl cursor-pointer transition text-left"
                  >
                    <img
                      src={p.image}
                      alt={p.name}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 object-cover rounded-lg border border-gray-100"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{p.name}</p>
                      <p className="text-xs text-gray-500">
                        {p.unit} • <span className="text-brand-600 font-medium">₹{p.price}</span>
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-300" />
                  </div>
                ))}
              </div>
            )}
          </form>

          {/* Desktop Navigation Link Toggles */}
          <nav className="hidden md:flex items-center gap-6">
            <span className={`cursor-pointer pb-1 text-sm font-medium transition ${activeLinkClass('#/')}`} onClick={() => navigate('#/')}>
              Home
            </span>
            <span className={`cursor-pointer pb-1 text-sm font-medium transition ${activeLinkClass('#/products')}`} onClick={() => navigate('#/products')}>
              Groceries
            </span>
            <span className={`cursor-pointer pb-1 text-sm font-medium transition ${activeLinkClass('#/orders')}`} onClick={() => navigate('#/orders')}>
              My Orders
            </span>
          </nav>

          {/* Right Header Controls buttons */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            {/* Customer Account Button */}
            {currentUser ? (
              <div className="relative group hidden sm:block">
                <button
                  className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 border border-gray-100 rounded-full transition text-sm font-medium text-gray-700"
                >
                  <div className="w-6 h-6 rounded-full bg-brand-600 text-white flex items-center justify-center text-[11px] font-bold">
                    {currentUser.name[0]}
                  </div>
                  <span className="max-w-[80px] truncate">{currentUser.name}</span>
                </button>
                <div className="absolute right-0 top-full mt-1.5 w-48 bg-white border border-gray-100 shadow-xl rounded-2xl p-2 hidden group-hover:block animate-in fade-in duration-200">
                  <div className="px-3 py-2 border-b border-gray-50 text-xs text-gray-400">
                    User: {currentUser.email}
                  </div>
                  <button
                    onClick={() => navigate('#/orders')}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition"
                  >
                    Track Orders
                  </button>
                  <button
                    onClick={logoutUser}
                    className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl transition font-medium"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => navigate('#/orders')}
                className="hidden sm:flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 rounded-full transition text-sm font-medium"
              >
                <User className="w-4 h-4 text-gray-500" />
                <span>Sign In</span>
              </button>
            )}

            {/* Admin Dashboard Entry Button - Only rendered for authenticated admins */}
            {currentAdmin && (
              <button
                onClick={() => navigate('#/admin')}
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-yellow-50 text-yellow-800 border border-yellow-200 rounded-full cursor-pointer transition text-xs font-semibold animate-in fade-in duration-300"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-yellow-600" />
                <span>Admin Panel</span>
              </button>
            )}

            {/* Shopping Cart Trigger */}
            <button
              onClick={() => navigate('#/cart')}
              className="relative p-2.5 sm:px-4 sm:py-2.5 bg-brand-600 text-white rounded-full hover:bg-brand-700 transition flex items-center gap-2 shadow-md shadow-brand-100 select-none group"
            >
              <ShoppingBag className="w-5 h-5 group-hover:scale-105 transition" />
              <span className="hidden sm:inline text-sm font-bold">₹{cartSubtotal}</span>
              {totalCartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full text-[10px] font-extrabold w-5 h-5 flex items-center justify-center border-2 border-white animate-pulse">
                  {totalCartCount}
                </span>
              )}
            </button>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-500 hover:text-gray-900 border border-gray-150 rounded-full md:hidden transition"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Navigation Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white shadow-xl py-4 px-6 space-y-4 animate-in fade-in duration-200">
          
          {/* Autocomplete Search input for mobile users */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-blue-200 focus:border-brand-500 focus:outline-none rounded-xl text-sm bg-gray-50"
            />
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          </form>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                navigate('#/');
              }}
              className="flex flex-col items-center justify-center p-3 border border-gray-150 rounded-2xl hover:bg-brand-50 text-gray-700"
            >
              <span className="text-sm font-semibold">Home Dashboard</span>
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                navigate('#/products');
              }}
              className="flex flex-col items-center justify-center p-3 border border-gray-150 rounded-2xl hover:bg-brand-50 text-gray-700"
            >
              <span className="text-sm font-semibold">Browse Groceries</span>
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                navigate('#/orders');
              }}
              className={`flex flex-col items-center justify-center p-3 border border-gray-150 rounded-2xl hover:bg-brand-50 text-gray-700 ${!currentAdmin ? 'col-span-2' : ''}`}
            >
              <span className="text-sm font-semibold">My Orders</span>
            </button>
            {currentAdmin && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('#/admin');
                }}
                className="flex flex-col items-center justify-center p-3 border border-gray-150 rounded-2xl hover:bg-yellow-50 text-gray-700 col-span-2 animate-in slide-in-from-bottom-2 duration-150"
              >
                <span className="text-sm font-semibold text-yellow-800">Admin Operations</span>
              </button>
            )}
          </div>

          {/* Customer info for mobile */}
          {currentUser ? (
            <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-2xl">
              <div>
                <p className="text-xs text-gray-400">Signed in as</p>
                <p className="text-sm font-bold text-gray-800">{currentUser.name}</p>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logoutUser();
                }}
                className="text-xs font-bold text-red-600 hover:underline"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                navigate('#/orders');
              }}
              className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-center text-sm font-semibold shadow-md inline-block"
            >
              Sign In to Account
            </button>
          )}

          <div className="flex items-center gap-1.5 justify-center py-1 bg-brand-50 rounded-full text-brand-800">
            <MapPin className="w-3.5 h-3.5 text-brand-600" />
            <span className="text-[11px] font-bold">Now Delivering to Jangaon Town, TS</span>
          </div>
        </div>
      )}
    </header>
  );
};
