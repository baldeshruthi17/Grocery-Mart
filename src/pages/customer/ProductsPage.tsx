import React, { useState, useEffect } from 'react';
import { useAppState } from '../../context/StateContext';
import { categories } from '../../data/dummyData';
import { ProductCard } from '../../components/ProductCard';
import { Search, Filter, ArrowUpDown, X, ListFilter, AlertCircle, ShoppingBag } from 'lucide-react';

export const ProductsPage: React.FC = () => {
  const { products, currentPath, navigate } = useAppState();

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchVal, setSearchVal] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('featured');
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false);

  // Parse URL query parameters on path change
  useEffect(() => {
    const hash = window.location.hash;
    const queryIndex = hash.indexOf('?');
    if (queryIndex !== -1) {
      const queryString = hash.substring(queryIndex + 1);
      const params = new URLSearchParams(queryString);
      
      const catParam = params.get('category');
      const searchParam = params.get('search');
      
      if (catParam) {
        setActiveCategory(catParam);
      } else {
        setActiveCategory('all');
      }

      if (searchParam) {
        setSearchVal(searchParam);
      } else {
        setSearchVal('');
      }
    } else {
      setActiveCategory('all');
      setSearchVal('');
    }
  }, [currentPath]);

  // Handle active filters on products catalog
  const filteredProducts = products.filter((product) => {
    // 1. Category Filter Check
    const matchesCategory = activeCategory === 'all' || product.category === activeCategory;

    // 2. Search Text Check
    const matchesSearch =
      !searchVal.trim() ||
      product.name.toLowerCase().includes(searchVal.toLowerCase()) ||
      (product.brand && product.brand.toLowerCase().includes(searchVal.toLowerCase())) ||
      product.category.toLowerCase().includes(searchVal.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  // Handle Sort By algorithm
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-low') {
      return a.price - b.price;
    } else if (sortBy === 'price-high') {
      return b.price - a.price;
    } else if (sortBy === 'discount') {
      return b.discount - a.discount;
    } else if (sortBy === 'stock') {
      return b.stock - a.stock;
    }
    // Default/Popular
    return b.id.localeCompare(a.id);
  });

  const clearAllFilters = () => {
    setSearchVal('');
    setActiveCategory('all');
    setSortBy('featured');
    navigate('#/products');
  };

  const handleCategorySelect = (catId: string) => {
    setIsMobileDrawerOpen(false);
    navigate(catId === 'all' ? '#/products' : `#/products?category=${catId}`);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Search Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col sm:flex-row gap-4 items-center justify-between text-left">
        <div className="space-y-1 w-full sm:w-auto">
          <h1 className="font-display font-black text-2xl text-gray-900 tracking-tight flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-brand-600 animate-pulse" />
            <span>JangaonMart Fresh Catalog</span>
          </h1>
          <p className="text-xs text-gray-400">Showing {sortedProducts.length} high quality grocery items</p>
        </div>

        {/* Dynamic filter indicator tags */}
        {(activeCategory !== 'all' || searchVal) && (
          <button
            onClick={clearAllFilters}
            className="flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-700 hover:underline max-sm:self-start border border-red-200 px-3 py-1.5 rounded-full bg-red-50/50"
          >
            <X className="w-3.5 h-3.5" />
            <span>Clear Filters</span>
          </button>
        )}
      </div>

      <div className="flex gap-6 relative">
        
        {/* 1. Category Filter Sidebar (Desktop Layout) */}
        <aside className="w-64 shrink-0 hidden lg:block space-y-6 self-start">
          <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4 shadow-xs text-left">
            <h3 className="font-display font-bold text-sm tracking-widest text-slate-800 uppercase flex items-center gap-2 border-b border-gray-100 pb-3">
              <ListFilter className="w-4.5 h-4.5 text-brand-600" />
              <span>Departments</span>
            </h3>

            <div className="space-y-1">
              <button
                onClick={() => handleCategorySelect('all')}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition ${
                  activeCategory === 'all'
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-50'
                    : 'text-gray-700 hover:bg-slate-50'
                }`}
              >
                <span>All Departments</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${activeCategory === 'all' ? 'bg-brand-700 text-white' : 'bg-slate-100 text-gray-500'}`}>
                  {products.length}
                </span>
              </button>

              {categories.map((cat) => {
                const count = products.filter((p) => p.category === cat.id).length;
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleCategorySelect(cat.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition ${
                      activeCategory === cat.id
                        ? 'bg-brand-600 text-white shadow-md shadow-brand-50'
                        : 'text-gray-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${activeCategory === cat.id ? 'bg-brand-700 text-white' : 'bg-slate-100 text-gray-500'}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* 2. Main list section */}
        <div className="flex-1 space-y-4">
          
          {/* Filters & Sorting Top Bar */}
          <div className="bg-white rounded-2xl border border-slate-100 p-3 flex flex-wrap items-center justify-between gap-3 text-left">
            
            {/* Search Input inline */}
            <div className="relative flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="Search within this catalog..."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className="w-full pl-9 pr-8 py-1.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-xs bg-slate-50/50"
              />
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400" />
              {searchVal && (
                <button
                  onClick={() => setSearchVal('')}
                  className="absolute right-2.5 top-2 hover:text-red-500"
                >
                  <X className="w-3.5 h-3.5 text-gray-400" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Mobile Filter Trigger Button */}
              <button
                onClick={() => setIsMobileDrawerOpen(true)}
                className="lg:hidden flex items-center gap-1 px-3 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-gray-700"
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Filters</span>
              </button>

              {/* Sort selector dropdown */}
              <div className="flex items-center gap-1.5">
                <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-xs font-semibold bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-500 text-gray-700"
                >
                  <option value="featured">Featured (Recent)</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="discount">Highest Discount</option>
                  <option value="stock">High Stock Level</option>
                </select>
              </div>
            </div>

          </div>

          {/* 3. Products Grid Layout (1 col mobile, 2 col tablet, 4 col desktop) */}
          {sortedProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {sortedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            /* Blank state configuration */
            <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div className="max-w-md space-y-2">
                <h3 className="font-display font-bold text-lg text-slate-800">No Grocery Products Found</h3>
                <p className="text-xs text-slate-500 leading-normal">
                  We couldn't find any products in "{activeCategory === 'all' ? 'All' : activeCategory}" department matching "{searchVal}". Try modifying your wording.
                </p>
              </div>
              <button
                onClick={clearAllFilters}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          )}

        </div>
      </div>

      {/* 4. Mobile Category Filter drawer */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
          {/* Overlay background */}
          <div
            onClick={() => setIsMobileDrawerOpen(false)}
            className="absolute inset-0 bg-black/50 transition-opacity"
          />
          
          <div className="relative w-80 bg-white h-full shadow-2xl flex flex-col p-6 space-y-6 animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between border-b border-slate-50 pb-4">
              <h3 className="font-display font-extrabold text-base text-gray-800">Select Department</h3>
              <button
                onClick={() => setIsMobileDrawerOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-900 transition border border-gray-100 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2">
              <button
                onClick={() => handleCategorySelect('all')}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition ${
                  activeCategory === 'all'
                    ? 'bg-brand-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-slate-50 border border-transparent'
                }`}
              >
                <span>All Departments</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${activeCategory === 'all' ? 'bg-brand-700 text-white' : 'bg-slate-100 text-gray-500'}`}>
                  {products.length}
                </span>
              </button>

              {categories.map((cat) => {
                const count = products.filter((p) => p.category === cat.id).length;
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleCategorySelect(cat.id)}
                    className={`w-full text-left px-3 py-3 rounded-xl text-xs font-bold flex items-center justify-between transition ${
                      activeCategory === cat.id
                        ? 'bg-brand-600 text-white shadow-md'
                        : 'text-gray-700 hover:bg-slate-50 border border-slate-50'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${activeCategory === cat.id ? 'bg-brand-700 text-white' : 'bg-slate-100 text-gray-500'}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={clearAllFilters}
              className="w-full py-3 border border-red-200 text-red-650 font-bold rounded-xl text-xs hover:bg-red-50 text-center"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
