import React, { useState, useEffect } from 'react';
import { useAppState } from '../../context/StateContext';
import { AdminLoginPage } from './AdminLoginPage';
import { AdminDashboardHome } from './AdminDashboardHome';
import { AdminProductManagement } from './AdminProductManagement';
import { AdminOrderManagement } from './AdminOrderManagement';
import { AdminInventoryManagement } from './AdminInventoryManagement';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  History,
  LogOut,
  Sparkles,
  ShieldCheck,
  User,
} from 'lucide-react';

export const AdminHub: React.FC = () => {
  const { currentAdmin, adminLogout, navigate, currentPath } = useAppState();
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders' | 'inventory'>('dashboard');
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);

  // If a direct parameter is passed to hash route: e.g. #/admin?tab=orders
  useEffect(() => {
    const hash = window.location.hash;
    const queryIndex = hash.indexOf('?');
    if (queryIndex !== -1) {
      const params = new URLSearchParams(hash.substring(queryIndex + 1));
      const tabParam = params.get('tab');
      if (tabParam === 'products' || tabParam === 'orders' || tabParam === 'inventory' || tabParam === 'dashboard') {
        setActiveTab(tabParam);
      }
    }
  }, [currentPath]);

  // If not logged in, render corporate sign in gate directly
  if (!currentAdmin) {
    return <AdminLoginPage />;
  }

  const handleOpenAddProductFromStats = () => {
    setActiveTab('products');
    setIsAddProductModalOpen(true);
  };

  const handleCloseAddProductModal = () => {
    setIsAddProductModalOpen(false);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 pb-12 select-none">
      
      {/* 1. Left Lateral navigation drawer sidebar */}
      <aside className="w-full lg:w-64 shrink-0 self-start">
        <div className="bg-white border rounded-3xl p-5 space-y-6 shadow-xs text-left">
          
          {/* Admin Identity details */}
          <div className="flex items-center gap-3 bg-brand-50/50 p-3 rounded-2xl border border-brand-100/30">
            <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center font-bold font-display uppercase tracking-wider shrink-0 shadow-sm shadow-brand-200">
              {currentAdmin.name[0]}
            </div>
            <div className="min-w-0">
              <span className="text-[9px] font-extrabold text-brand-650 tracking-wider uppercase bg-brand-100/70 p-0.5 rounded">Store Admin</span>
              <p className="font-bold text-xs text-slate-800 truncate mt-0.5">{currentAdmin.name}</p>
            </div>
          </div>

          {/* Navigation link sets */}
          <nav className="space-y-1 block">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-3.5 mb-2">Workspace Hub</p>
            
            {/* Tab 1: Dashboard home stats */}
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-650 hover:bg-slate-50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              <span>Fulfillment Stats</span>
            </button>

            {/* Tab 2: Products management list */}
            <button
              onClick={() => setActiveTab('products')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition cursor-pointer ${
                activeTab === 'products'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-650 hover:bg-slate-50'
              }`}
            >
              <Package className="w-4 h-4 shrink-0" />
              <span>SKUs Catalogue</span>
            </button>

            {/* Tab 3: Orders dispatch list */}
            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-650 hover:bg-slate-50'
              }`}
            >
              <ShoppingBag className="w-4 h-4 shrink-0" />
              <span>Fulfillment Board</span>
            </button>

            {/* Tab 4: Inventory quantity slots */}
            <button
              onClick={() => setActiveTab('inventory')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition cursor-pointer ${
                activeTab === 'inventory'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-650 hover:bg-slate-50'
              }`}
            >
              <History className="w-4 h-4 shrink-0" />
              <span>Inventory Console</span>
            </button>
          </nav>

          {/* Separation list */}
          <div className="border-t pt-4 space-y-1 block">
            <button
              onClick={adminLogout}
              className="w-full text-left px-3.5 py-2.5 hover:bg-red-50 text-red-650 rounded-xl text-xs font-bold flex items-center gap-2.5 transition"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span>Staff Sign Out</span>
            </button>
          </div>

        </div>
      </aside>

      {/* 2. Main content active tab layout */}
      <main className="flex-1 min-w-0">
        
        {/* Dynamic Section rendering based on active Sidebar state */}
        {activeTab === 'dashboard' && (
          <AdminDashboardHome
            setActiveTab={setActiveTab}
            openAddProductModal={handleOpenAddProductFromStats}
          />
        )}

        {activeTab === 'products' && (
          <AdminProductManagement
            isAddModalOpenInitially={isAddProductModalOpen}
            onModalClose={handleCloseAddProductModal}
          />
        )}

        {activeTab === 'orders' && <AdminOrderManagement />}

        {activeTab === 'inventory' && <AdminInventoryManagement />}

      </main>

    </div>
  );
};
