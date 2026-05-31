import React from 'react';
import { useAppState } from '../../context/StateContext';
import { IndianRupee, ShoppingBag, Package, Activity, AlertTriangle, ArrowRight, UserCheck } from 'lucide-react';

interface AdminDashboardHomeProps {
  setActiveTab: (tab: 'dashboard' | 'products' | 'orders' | 'inventory') => void;
  openAddProductModal: () => void;
}

export const AdminDashboardHome: React.FC<AdminDashboardHomeProps> = ({
  setActiveTab,
  openAddProductModal,
}) => {
  const { orders, products } = useAppState();

  // Find today's date bounds for counting
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  // Compute dynamic stats from active state
  const totalOrdersCount = orders.length;
  const pendingOrdersCount = orders.filter((o) => o.status !== 'Delivered').length;
  const totalProductsCount = products.length;

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);

  // Identify low stock products (< 10 units left)
  const lowStockProducts = products.filter((p) => p.stock > 0 && p.stock < 10);
  const outOfStockCount = products.filter((p) => p.stock === 0 || !p.isAvailable).length;

  // Retrieve 5 most recent orders
  const recentOrders = [...orders].slice(0, 5);

  const getBadgeClass = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-amber-100 text-amber-800';
      case 'Accepted':
        return 'bg-blue-100 text-blue-800';
      case 'Preparing':
        return 'bg-purple-100 text-purple-800';
      case 'Out for Delivery':
        return 'bg-orange-100 text-orange-900';
      case 'Delivered':
        return 'bg-emerald-100 text-emerald-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="space-y-8 text-left">
      
      {/* 4 Core Stat Cards in Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Rev */}
        <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
            <IndianRupee className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">Total Sales Revenue</p>
            <p className="text-2xl font-black text-gray-950">₹{totalRevenue}</p>
            <p className="text-[10px] text-emerald-600 mt-0.5">Live store receipts total</p>
          </div>
        </div>

        {/* Orders Card */}
        <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-650 flex items-center justify-center border border-brand-100 shrink-0">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">Transactions Today</p>
            <p className="text-2xl font-black text-gray-950">{totalOrdersCount}</p>
            <p className="text-[10px] text-brand-600 mt-0.5">Orders submitted in Jangaon</p>
          </div>
        </div>

        {/* Products count */}
        <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-105 shrink-0">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">Store SKUs Active</p>
            <p className="text-2xl font-black text-gray-950">{totalProductsCount}</p>
            <p className="text-[10px] text-blue-500 mt-0.5">{outOfStockCount} items currently sold out</p>
          </div>
        </div>

        {/* Pending slots */}
        <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 shrink-0">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">Active Prepared Orders</p>
            <p className="text-2xl font-black text-gray-950">{pendingOrdersCount}</p>
            <p className="text-[10px] text-amber-600 mt-0.5">Need immediate dispatch</p>
          </div>
        </div>

      </div>

      {/* Quick Action Hub Panel */}
      <section className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 rounded-3xl flex flex-wrap items-center justify-between gap-4 shadow">
        <div className="space-y-1">
          <h3 className="font-display font-extrabold text-base text-white">Administrator Quick Actions</h3>
          <p className="text-xs text-slate-300">Fast triggers to regulate catalog inventory or check current dispatches.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={openAddProductModal}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-brand-500/10 cursor-pointer"
          >
            + Add New Product
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 hover:border-slate-500 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Manage Order Board
          </button>
        </div>
      </section>

      {/* Grid: Recent Orders (Left) vs Low stock warnings (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Recent dispatches table */}
        <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-xs lg:col-span-2 space-y-4 text-left">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="font-display font-bold text-slate-900 text-sm">Recent Store Dispatches</h3>
            <button
              onClick={() => setActiveTab('orders')}
              className="text-xs font-bold text-brand-600 hover:underline flex items-center gap-0.5"
            >
              <span>See All Board</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-400 font-bold border-b border-slate-50">
                    <th className="pb-2">Order ID</th>
                    <th className="pb-2">Customer</th>
                    <th className="pb-2">Payment</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2 text-right">Invoice</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {recentOrders.map((o) => (
                    <tr key={o.id} className="text-slate-700">
                      <td className="py-2.5 font-mono font-bold text-slate-900">{o.id}</td>
                      <td className="py-2.5">
                        <p className="font-bold">{o.customerName}</p>
                        <p className="text-[10px] text-gray-400">+91 {o.phone}</p>
                      </td>
                      <td className="py-2.5 font-medium text-slate-550">COD</td>
                      <td className="py-2.5">
                        <span className={`inline-block px-2 py-0.5 rounded-full font-bold text-[10px] ${getBadgeClass(o.status)}`}>
                          {o.status}
                        </span>
                      </td>
                      <td className="py-2.5 text-right font-bold text-slate-950">₹{o.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center text-gray-400 text-xs">
              No orders have been placed in this session yet.
            </div>
          )}
        </div>

        {/* Right Side: Shelf warning stock alerts */}
        <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-xs space-y-4 text-left">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="font-display font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-500 animate-pulse" />
              <span>Shelf Warnings</span>
            </h3>
            <button
              onClick={() => setActiveTab('inventory')}
              className="text-xs font-bold text-slate-400 hover:text-brand-650"
            >
              Update Stock
            </button>
          </div>

          {lowStockProducts.length > 0 ? (
            <div className="space-y-2.5 max-h-56 overflow-y-auto">
              {lowStockProducts.map((p) => (
                <div
                  key={p.id}
                  className="p-2 bg-amber-50 border border-amber-100 rounded-xl flex items-center justify-between text-xs transition hover:bg-amber-100/40"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-8 h-8 rounded object-cover border shrink-0"
                    />
                    <div className="truncate text-left">
                      <p className="font-bold text-amber-950 truncate max-w-[130px]">{p.name}</p>
                      <p className="text-[10px] text-amber-600 font-semibold">{p.unit} pack</p>
                    </div>
                  </div>
                  <span className="font-mono text-xs text-red-600 font-black shrink-0 px-2.5 py-0.5 bg-red-100/50 rounded-lg">
                    {p.stock} LEFT
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-emerald-600 text-xs font-bold space-y-1">
              <UserCheck className="w-8 h-8 mx-auto text-emerald-500" />
              <p>All stock levels are secure!</p>
              <p className="text-[10px] text-gray-400 font-medium">No items below 10 units.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
