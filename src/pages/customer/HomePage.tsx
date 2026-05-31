import React from 'react';
import { useAppState } from '../../context/StateContext';
import { categories } from '../../data/dummyData';
import { ProductCard } from '../../components/ProductCard';
import { motion } from 'motion/react';
import * as Icons from 'lucide-react';
import { Clock, ShieldCheck, Heart, ArrowRight, Sparkles, Star, Plus, PackageOpen, Footprints, Truck } from 'lucide-react';

export const HomePage: React.FC = () => {
  const { products, navigate } = useAppState();

  // Get 6 top products to showcase
  const topSellingProducts = products
    .filter((p) => p.isAvailable)
    .slice(0, 6);

  // Helper to render lucide icon dynamically
  const renderCategoryIcon = (iconName: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const IconComponent = (Icons as any)[iconName];
    return IconComponent ? <IconComponent className="w-6 h-6" /> : <Icons.ShoppingBag className="w-6 h-6" />;
  };

  const promos = [
    {
      id: 1,
      title: 'Monsoon Staples Sale',
      desc: 'Up to 20% OFF on Tata Sampann Dal, Aashirvaad Atta, Sugar',
      bgClass: 'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 text-amber-950',
      tag: 'SUPER DISCOUNT',
      badgeClass: 'bg-amber-600',
    },
    {
      id: 2,
      title: 'Telangana Fresh Express',
      desc: 'Handpicked local Jangaon vegetables & seasonal sweet fruits',
      bgClass: 'bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 text-emerald-950',
      tag: 'FARM DIRECT',
      badgeClass: 'bg-emerald-600',
    },
    {
      id: 3,
      title: 'Free Delivery Weekend',
      desc: 'No delivery fee on any grocery ordering above ₹99 today only',
      bgClass: 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 text-blue-950',
      tag: 'FREE IN 60 MINS',
      badgeClass: 'bg-blue-600',
    },
  ];

  return (
    <div className="space-y-10 pb-16">
      
      {/* ================= BENTO GRID DASHBOARD ================= */}
      <section className="grid grid-cols-12 gap-5 auto-rows-max">
        
        {/* 1. HERO PROMO: Largest Bento Block (Spans 8/12 on large screens) */}
        <div className="col-span-12 lg:col-span-8 bg-brand-700 rounded-3xl relative overflow-hidden flex flex-col justify-between p-8 md:p-10 text-white shadow-xl border border-brand-800 select-none group min-h-[350px]">
          <div className="relative z-10 max-w-lg text-left">
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-brand-600/60 backdrop-blur-md text-white text-xs font-bold rounded-full mb-4 tracking-wider uppercase border border-brand-500/20">
              <Sparkles className="w-3.5 h-3.5 text-brand-200 animate-pulse" />
              <span>Hyperlocal • 60 Mins Jangaon Delivery</span>
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight mb-4 font-display">
              Fresh Groceries<br/> 
              <span className="text-brand-200 font-extrabold">Delivered in Jangaon</span>
            </h1>
            <p className="text-brand-50/90 text-xs sm:text-sm max-w-sm mb-6 leading-relaxed">
              Get everyday essentials from your favorite local markets straight to your doorstep within an hour. Skip the rush at Station Road shops!
            </p>
          </div>
          
          <div className="relative z-10 flex flex-wrap items-center gap-4 mt-auto text-left">
            <button 
              onClick={() => navigate('#/products')}
              className="bg-white text-brand-800 hover:text-brand-900 px-6 py-3 rounded-xl font-bold shadow-lg hover:scale-[1.03] active:scale-95 transition cursor-pointer"
            >
              Shop Groceries
            </button>
            <div className="text-xs font-semibold text-brand-100 border-l border-brand-600/80 pl-4">
              <span>Min. Order: ₹99</span>
              <span className="mx-2">•</span>
              <span className="text-brand-200">Cash on Delivery</span>
            </div>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute -bottom-12 -right-12 w-72 h-72 bg-brand-500/40 rounded-full blur-3xl group-hover:bg-brand-500/50 transition duration-300 pointer-events-none"></div>
          <div className="absolute top-8 right-8 flex gap-1.5 opacity-60">
            <div className="w-2.5 h-2.5 rounded-full bg-brand-400"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-brand-300"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-brand-200"></div>
          </div>
        </div>

        {/* 2. CATEGORIES QUICK ACCESS BENTO (Spans 4/12 on lg screens, elevated tiles) */}
        <div className="col-span-12 md:col-span-6 lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200 flex flex-col justify-between text-left shadow-xs">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-display font-black text-slate-800 text-base">Popular Categories</h3>
              <span 
                onClick={() => navigate('#/products')}
                className="text-brand-700 text-xs font-bold cursor-pointer hover:underline"
              >
                View All
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div 
                onClick={() => navigate('#/products?category=vegetables')}
                className="bg-emerald-50 rounded-2xl p-4 flex flex-col items-center justify-center border border-emerald-100 hover:border-emerald-300 cursor-pointer transition select-none group"
              >
                <span className="text-3xl mb-1 group-hover:scale-110 transition duration-200">🥦</span>
                <span className="text-xs font-bold text-slate-705">Veggies</span>
              </div>
              <div 
                onClick={() => navigate('#/products?category=dairy')}
                className="bg-blue-50 rounded-2xl p-4 flex flex-col items-center justify-center border border-blue-100 hover:border-blue-300 cursor-pointer transition select-none group"
              >
                <span className="text-3xl mb-1 group-hover:scale-110 transition duration-200">🥛</span>
                <span className="text-xs font-bold text-slate-705">Dairy & Eggs</span>
              </div>
              <div 
                onClick={() => navigate('#/products?category=staples')}
                className="bg-amber-50 rounded-2xl p-4 flex flex-col items-center justify-center border border-amber-100 hover:border-amber-300 cursor-pointer transition select-none group"
              >
                <span className="text-3xl mb-1 group-hover:scale-110 transition duration-200">🌾</span>
                <span className="text-xs font-bold text-slate-705">Staples</span>
              </div>
              <div 
                onClick={() => navigate('#/products?category=snacks')}
                className="bg-yellow-50 rounded-2xl p-4 flex flex-col items-center justify-center border border-yellow-100 hover:border-yellow-300 cursor-pointer transition select-none group"
              >
                <span className="text-3xl mb-1 group-hover:scale-110 transition duration-200">🍪</span>
                <span className="text-xs font-bold text-slate-705">Snacks</span>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-gray-400 mt-4 text-center">Click a tile to browse directly</p>
        </div>

        {/* 3. FLASH DEAL BENTO BLOCK (Spans 4/12 on lg screen, highly colored) */}
        <div 
          onClick={() => navigate('#/products?search=Eggs')}
          className="col-span-12 md:col-span-6 lg:col-span-4 bg-amber-400 rounded-3xl p-6 flex items-center justify-between border border-amber-500/20 shadow-sm hover:shadow-md transition cursor-pointer select-none group min-h-[140px]"
        >
          <div className="text-left space-y-1">
            <p className="text-[10px] font-black uppercase text-amber-955 tracking-tighter bg-amber-500/30 px-2 py-0.5 rounded-md w-max">Limited Time Offer</p>
            <h4 className="text-xl font-black text-amber-955 leading-tight">Save 25% on<br/>Farm Eggs & Dairy</h4>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-900 group-hover:underline mt-1">
              <span>View Deals</span>
              <Icons.ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-5xl group-hover:scale-110 group-hover:rotate-6 transition duration-300 shrink-0 select-none">🥚</div>
        </div>

        {/* 4. REAL-TIME DELIVERY STATUS / ACTIVE MAP BENTO (Spans 8/12 on lg screen) */}
        <div className="col-span-12 lg:col-span-8 bg-slate-900 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between shadow-lg text-left min-h-[160px] border border-slate-800">
          <div className="z-10 flex justify-between items-start gap-4">
            <div>
              <h3 className="text-white font-display font-bold text-base md:text-lg">Live Delivery Status</h3>
              <p className="text-brand-400 text-xs md:text-sm font-semibold flex items-center gap-2 mt-1">
                <span className="w-2.5 h-2.5 bg-brand-400 rounded-full animate-ping"></span>
                <span className="w-2 h-2 bg-brand-500 rounded-full absolute"></span>
                Partner is at Jangaon Chowrasta Store
              </p>
            </div>
            <div className="bg-slate-800 text-slate-300 text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded-full border border-slate-700 shrink-0">
              ID: #JM-8821
            </div>
          </div>
          
          {/* Visual Map Mockup with interactive coordinates lines */}
          <div className="absolute inset-x-0 bottom-0 top-14 opacity-20 pointer-events-none">
             <div className="w-full h-full relative">
                {/* Horizontal road networks */}
                <div className="absolute top-8 left-10 w-2/3 h-1 bg-brand-500/50 rotate-6" />
                <div className="absolute top-20 left-4 w-11/12 h-1 bg-brand-400/30 -rotate-3" />
                {/* Vertical road networks */}
                <div className="absolute top-2 left-1/3 w-1 bg-brand-500/50 h-32" />
                <div className="absolute top-2 left-2/3 w-1 bg-white/40 h-32" />
                
                {/* Visual Landmark markers */}
                <div className="absolute top-6 left-1/3 w-3 h-3 bg-brand-400 rounded-full ring-4 ring-brand-400/20" />
                <div className="absolute bottom-6 left-2/3 w-3 h-3 bg-white rounded-full ring-4 ring-white/20 animate-pulse" />
             </div>
          </div>

          <div className="mt-8 z-10 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-800 rounded-full border border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                <span className="text-lg">🛵</span>
              </div>
              <div className="min-w-0">
                <p className="text-white text-xs font-bold">Arjun Kumar</p>
                <p className="text-slate-400 text-[10px] truncate">Express Delivery Rider • EV Bike</p>
              </div>
            </div>
            <button 
              onClick={() => navigate('#/orders')}
              className="bg-white/10 text-white hover:bg-white/20 px-4 py-2 rounded-xl text-xs font-bold backdrop-blur-md border border-white/10 active:scale-95 transition cursor-pointer"
            >
              Track Active Order
            </button>
          </div>
        </div>

      </section>

      {/* ================= CATEGORIES SECTION RE-REFINED AS BENTO TILE LINE ================= */}
      <section className="space-y-4">
        <div className="text-left">
          <h2 className="font-display font-black text-xl sm:text-2xl text-gray-900 tracking-tight">
            Browse Departments
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">Quick lookup over our full catalogue</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {categories.map((cat) => (
            <motion.div
              key={cat.id}
              whileHover={{ scale: 1.03 }}
              onClick={() => navigate(`#/products?category=${cat.id}`)}
              className={`p-4 rounded-2xl border ${cat.color} flex flex-col items-center justify-center gap-2 cursor-pointer text-center transition hover:shadow-md h-24 select-none`}
            >
              <div className="p-1.5 rounded-xl bg-white shadow-xs shrink-0">
                {renderCategoryIcon(cat.icon)}
              </div>
              <span className="text-[11px] font-bold tracking-tight truncate w-full">
                {cat.name}
              </span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ================= CORE TOP DEMANDED ITEMS GRID ================= */}
      <section className="space-y-5">
        <div className="flex items-center justify-between gap-4">
          <div className="text-left">
            <h2 className="font-display font-black text-xl sm:text-2xl text-gray-950 tracking-tight flex items-center gap-2">
              <Star className="w-5.5 h-5.5 fill-brand-600 text-brand-600 animate-pulse" />
              <span>Express Delivery Catalogue</span>
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Our finest handpicked staples, dairy & essentials</p>
          </div>
          <button
            onClick={() => navigate('#/products')}
            className="text-xs font-bold text-brand-700 hover:text-brand-900 transition flex items-center gap-1 hover:underline cursor-pointer bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-3xs"
          >
            <span>See All Groceries</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {topSellingProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* ================= DELIVERY INFOGRAPHICS ================= */}
      <section className="bg-white rounded-3xl p-6 sm:p-10 text-center space-y-6 border border-slate-200 shadow-3xs">
        <div className="max-w-md mx-auto space-y-1.5">
          <h2 className="font-display font-black text-xl sm:text-2xl text-gray-950 tracking-tight">Our Service Pipeline</h2>
          <p className="text-xs text-gray-500">Uncompromised quality and hygiene delivered in few easy steps</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col items-center space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-700 border border-brand-100 shadow-sm">
              <Icons.MenuSquare className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-sm text-gray-900">1. Assemble Cart</h3>
            <p className="text-xs text-gray-500 max-w-xs leading-normal">
              Browse 30+ staples, fresh farm-direct vegetables, dairy, and confectionery snacks.
            </p>
          </div>

          <div className="flex flex-col items-center space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-700 border border-brand-100 shadow-sm">
              <PackageOpen className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-sm text-gray-900">2. Local Store Dispatch</h3>
            <p className="text-xs text-gray-500 max-w-xs leading-normal">
              Trusted supermarket partners pack and seal your goods securely under proper hygiene norms.
            </p>
          </div>

          <div className="flex flex-col items-center space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-700 border border-brand-100 shadow-sm font-bold">
              <Truck className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-sm text-gray-905">3. Doorstep Handover</h3>
            <p className="text-xs text-gray-500 max-w-xs leading-normal">
              Riders safely dispatch order directly to Court Colony, Siddipet Road, or Station Road home limits of Jangaon.
            </p>
          </div>
        </div>
      </section>

      {/* ================= TESTIMONIALS SECTION ================= */}
      <section className="space-y-5">
        <div className="text-center">
          <h2 className="font-display font-black text-xl text-gray-950 tracking-tight">
            Trusted by Jangaon Families
          </h2>
          <p className="text-xs text-gray-500">Fast delivery, accurate stock counts, reliable cash on delivery</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-left">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs space-y-3">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="text-[11px] text-gray-650 leading-normal italic">
              "Ordering rice and fresh vegetables used to require traveling into Station Road traffic. JangaonMart dropped-off our Basmati and onions in 40 mins flat! Extremely convenient service!"
            </p>
            <div className="flex items-center gap-2 pt-1">
              <div className="w-7 h-7 rounded-full bg-slate-150 text-slate-700 flex items-center justify-center font-bold text-xs animate-pulse">R</div>
              <div>
                <p className="text-xs font-bold text-gray-900">Raju Garu</p>
                <p className="text-[9px] text-gray-400 font-medium">Court Colony, Jangaon</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs space-y-3">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="text-[11px] text-gray-650 leading-normal italic">
              "We placed a dairy and snack order after evening prayers. The milk packets were cold, and the biscuits were fresh. It is wonderful having this fast, online service in our town."
            </p>
            <div className="flex items-center gap-2 pt-1">
              <div className="w-7 h-7 rounded-full bg-slate-150 text-slate-700 flex items-center justify-center font-bold text-xs animate-pulse">S</div>
              <div>
                <p className="text-xs font-bold text-gray-800">Srilatha Reddy</p>
                <p className="text-[9px] text-gray-400 font-medium">Siddipet Road, Jangaon</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs space-y-3">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="text-[11px] text-gray-650 leading-normal italic">
              "An absolute lifesaver for working couples in town! Instant dispatch confirmation, correct weight counts, and reliable Cash-on-Delivery handover. Highly recommended!"
            </p>
            <div className="flex items-center gap-2 pt-1">
              <div className="w-7 h-7 rounded-full bg-slate-150 text-slate-700 flex items-center justify-center font-bold text-xs animate-pulse">K</div>
              <div>
                <p className="text-xs font-bold text-gray-800">Kalyan Chandra</p>
                <p className="text-[9px] text-gray-400 font-medium">Chowrasta, Jangaon</p>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
