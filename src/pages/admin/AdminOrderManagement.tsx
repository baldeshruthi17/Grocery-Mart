import React, { useState } from 'react';
import { useAppState } from '../../context/StateContext';
import { Order, OrderStatus } from '../../types';
import { Search, Filter, ClipboardList, Info, Phone, MessageSquare, Truck, Eye, X, RefreshCw } from 'lucide-react';
import { DELIVERY_BOYS } from '../../lib/apiInterceptor';

export const AdminOrderManagement: React.FC = () => {
  const { orders, updateOrderStatus, assignDeliveryBoy, showToast } = useAppState();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Selected single order modal states
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const statusesList: OrderStatus[] = ['Pending', 'Accepted', 'Preparing', 'Out for Delivery', 'Delivered'];

  const getStatusBadgeClass = (status: OrderStatus) => {
    switch (status) {
      case 'Pending':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Accepted':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Preparing':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Out for Delivery':
        return 'bg-orange-100 text-orange-900 border-orange-200';
      case 'Delivered':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const handleStatusSelectorChange = (orderId: string, newStatus: OrderStatus) => {
    updateOrderStatus(orderId, newStatus);
  };

  // Filter orders board list
  const filteredOrders = orders.filter((o) => {
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    const matchesSearch =
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.phone.includes(searchQuery);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 text-left">
      <div>
        <h2 className="font-display font-black text-xl text-gray-900 tracking-tight">Orders Fulfillment Board</h2>
        <p className="text-xs text-gray-500">Regulate hyperlocal dispatch progress steps and check delivery addresses</p>
      </div>

      {/* Filter and search controllers */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-100 flex flex-wrap gap-4 items-center justify-between text-xs font-semibold text-slate-700 shadow-xs">
        
        <div className="relative flex-1 min-w-[220px]">
          <input
            type="text"
            placeholder="Search by Order ID, Customer name or WhatsApp phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 bg-slate-50/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-xs"
          />
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400" />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border rounded-xl px-2.5 py-1.5 focus:outline-none text-xs border-slate-200"
          >
            <option value="all">All Statuses ({orders.length})</option>
            {statusesList.map((s) => (
              <option key={s} value={s}>
                {s} ({orders.filter((o) => o.status === s).length})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders board list table */}
      <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-xs">
        {filteredOrders.length > 0 ? (
          <div className="overflow-x-auto text-[11px] sm:text-xs">
            <table className="w-full text-left text-slate-700">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[9px]">
                  <th className="p-4">ID</th>
                  <th className="p-4">Customer Details</th>
                  <th className="p-4">Groceries Ordered</th>
                  <th className="p-4">Scheduled Slot</th>
                  <th className="p-4">Paid Total (COD)</th>
                  <th className="p-4">Fulfillment Status</th>
                  <th className="p-4 text-right">View Extra</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-medium">
                {filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/10 transition">
                    
                    {/* Order ID */}
                    <td className="p-4 font-mono font-bold text-slate-905">{o.id}</td>

                    {/* Customer */}
                    <td className="p-4">
                      <p className="font-bold text-slate-900">{o.customerName}</p>
                      <p className="text-[10px] text-slate-405 leading-none mt-1">+91 {o.phone}</p>
                    </td>

                    {/* Items count & Rider status info */}
                    <td className="p-4">
                      <p className="font-bold text-slate-800">{o.items.length} items</p>
                      {o.assignedRiderName ? (
                        <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-amber-800 bg-amber-50 border border-amber-250 px-1.5 py-0.5 rounded mt-0.5 whitespace-nowrap">
                          🛵 {o.assignedRiderName}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold text-slate-400 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded mt-0.5 whitespace-nowrap">
                          Unassigned
                        </span>
                      )}
                    </td>

                    {/* delivery slot */}
                    <td className="p-4 text-[11px] font-bold text-gray-700">
                      {o.address.deliverySlot.split(' ')[0]}
                    </td>

                    {/* Total invoice */}
                    <td className="p-4 font-extrabold text-slate-950 font-display">
                      ₹{o.total}
                    </td>

                    {/* Dropdown update live */}
                    <td className="p-4">
                      <select
                        value={o.status}
                        onChange={(e) => handleStatusSelectorChange(o.id, e.target.value as OrderStatus)}
                        className={`px-2.5 py-1 text-[10px] font-extrabold rounded-full border focus:outline-none cursor-pointer ${getStatusBadgeClass(o.status)}`}
                      >
                        {statusesList.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Actions view lookup */}
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(o)}
                        className="p-1.5 border border-slate-150 hover:bg-slate-50 rounded-lg text-slate-500 hover:text-slate-900 transition"
                        title="Display full details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-gray-400 space-y-2 text-xs">
            <ClipboardList className="w-8 h-8 text-gray-300 mx-auto" />
            <p>No orders matched selected filters.</p>
          </div>
        )}
      </div>

      {/* Selected Order Lookup Full Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setSelectedOrder(null)} className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
          
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 md:p-8 overflow-y-auto max-h-[85vh] animate-in zoom-in-95 duration-200 text-left space-y-6">
            
            <div className="flex justify-between items-center border-b pb-4">
              <div>
                <span className="text-[9px] font-bold text-brand-650 uppercase tracking-widest bg-brand-50 px-2 py-0.5 rounded-md">Fulfillment lookup</span>
                <h3 className="font-display font-black text-lg text-slate-905 mt-1">
                  Invoice Ref: {selectedOrder.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 border border-slate-100 hover:bg-slate-50 text-slate-400 rounded-full hover:text-slate-900 transition"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Recipients specifications */}
            <div className="space-y-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Delivery Destination info</p>
              <div className="bg-slate-50 border p-4 rounded-2xl text-xs space-y-1 text-slate-650">
                <p className="font-extrabold text-slate-900 text-sm">{selectedOrder.customerName}</p>
                <p>Phone Contact: +91 {selectedOrder.phone}</p>
                <p className="leading-snug pt-1">{selectedOrder.address.fullAddress}</p>
                {selectedOrder.address.landmark && (
                  <p className="font-bold text-brand-700 text-[11px] pt-1">
                    Landmark: {selectedOrder.address.landmark}
                  </p>
                )}
                <p className="text-[10px] text-gray-400 pt-2 border-t mt-2">
                  Delivery hours slot scheduled: <span className="font-bold text-slate-700">{selectedOrder.address.deliverySlot}</span>
                </p>
              </div>
            </div>

            {/* Note instructions details */}
            {selectedOrder.address.notes && (
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Instructions notes</p>
                <p className="p-3 bg-amber-50 rounded-xl border border-amber-250 italic text-xs text-amber-900 leading-normal">
                  "{selectedOrder.address.notes}"
                </p>
              </div>
            )}

            {/* Items packing checklist */}
            <div className="space-y-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-left">Packing checklist items ({selectedOrder.items.length})</p>
              <div className="space-y-2 max-h-48 overflow-y-auto block pr-1">
                {selectedOrder.items.map((item) => (
                  <div key={item.productId} className="flex justify-between items-center text-xs py-1 px-1 border-b">
                    <span className="font-bold text-slate-800">{item.name}</span>
                    <span className="text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">x{item.quantity} units</span>
                    <span className="font-extrabold text-slate-950">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Checkout total invoice */}
            <div className="p-4 bg-slate-50 border whitespace-nowrap rounded-2xl flex items-center justify-between text-xs">
              <div>
                <p className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Invoice subtotal: ₹{selectedOrder.subtotal}</p>
                <p className="text-slate-400 font-bold uppercase tracking-wider text-[9px] mt-0.5">Shipping charge: ₹{selectedOrder.deliveryFee}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-405 mb-0.5">TOTAL PAYABLE</p>
                <p className="text-lg font-black font-display text-brand-600">₹{selectedOrder.total} (COD)</p>
              </div>
            </div>

            {/* Delivery Rider Assignment Selector */}
            <div className="space-y-2 pt-2 border-t">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Assign Delivery Rider</p>
              <select
                value={selectedOrder.deliveryBoyId || ''}
                onChange={(e) => {
                  const riderId = e.target.value;
                  const rider = DELIVERY_BOYS.find(b => b.id === riderId);
                  
                  // Central state update
                  assignDeliveryBoy(selectedOrder.id, riderId || undefined, rider?.name || undefined);
                  
                  // Automate Out for Delivery status on assignment
                  const nextStatus: OrderStatus = riderId ? 'Out for Delivery' : selectedOrder.status;
                  if (riderId) {
                    handleStatusSelectorChange(selectedOrder.id, 'Out for Delivery');
                  }
                  
                  // Modal UI state update
                  setSelectedOrder(prev => prev ? {
                    ...prev,
                    deliveryBoyId: riderId || undefined,
                    assignedRiderName: rider?.name || undefined,
                    status: nextStatus
                  } : null);
                  
                  showToast(riderId ? `Assigned to Rider ${rider?.name} and marked Out for Delivery!` : "Rider unassigned successfully.", 'success');
                }}
                className="w-full px-3 py-2 border rounded-xl bg-slate-50 font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500 text-xs text-slate-800"
              >
                <option value="">-- Click to Assign Delivery Boy --</option>
                {DELIVERY_BOYS.map((boy) => (
                  <option key={boy.id} value={boy.id}>
                    {boy.avatar} {boy.name} ({boy.vehicle})
                  </option>
                ))}
              </select>
            </div>

            {/* Quick manual control buttons */}
            <div className="space-y-2 pt-2 border-t text-left">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Quick Fulfillment Actions</p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => {
                    handleStatusSelectorChange(selectedOrder.id, 'Accepted');
                    setSelectedOrder((prev) => prev ? { ...prev, status: 'Accepted' } : null);
                    showToast(`Order #${selectedOrder.id} manually Accepted!`, 'success');
                  }}
                  className={`py-2 px-3 text-xs font-black rounded-xl border transition flex flex-col items-center justify-center gap-1 ${
                    selectedOrder.status === 'Accepted'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  <span className="text-[8px] opacity-75 uppercase tracking-widest font-mono">Step 1</span>
                  <span>Accept</span>
                </button>

                <button
                  onClick={() => {
                    handleStatusSelectorChange(selectedOrder.id, 'Preparing');
                    setSelectedOrder((prev) => prev ? { ...prev, status: 'Preparing' } : null);
                    showToast(`Order #${selectedOrder.id} marked as Packed / Prepare!`, 'success');
                  }}
                  className={`py-2 px-3 text-xs font-black rounded-xl border transition flex flex-col items-center justify-center gap-1 ${
                    selectedOrder.status === 'Preparing'
                      ? 'bg-purple-600 text-white border-purple-600 shadow-md'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  <span className="text-[8px] opacity-75 uppercase tracking-widest font-mono">Step 2</span>
                  <span>Pack</span>
                </button>

                <button
                  onClick={() => {
                    // Automate selecting first available rider if none allocated
                    const currentRider = selectedOrder.deliveryBoyId 
                      ? DELIVERY_BOYS.find(b => b.id === selectedOrder.deliveryBoyId)
                      : DELIVERY_BOYS[0];
                    
                    if (!selectedOrder.deliveryBoyId && currentRider) {
                      assignDeliveryBoy(selectedOrder.id, currentRider.id, currentRider.name);
                    }
                    
                    handleStatusSelectorChange(selectedOrder.id, 'Out for Delivery');
                    setSelectedOrder((prev) => prev ? { 
                      ...prev, 
                      status: 'Out for Delivery',
                      deliveryBoyId: prev.deliveryBoyId || currentRider?.id,
                      assignedRiderName: prev.assignedRiderName || currentRider?.name
                    } : null);
                    showToast(`Order #${selectedOrder.id} assigned & marked Out for Delivery!`, 'success');
                  }}
                  className={`py-2 px-3 text-xs font-black rounded-xl border transition flex flex-col items-center justify-center gap-1 ${
                    selectedOrder.status === 'Out for Delivery'
                      ? 'bg-orange-605 text-white border-orange-605 bg-orange-600 border-orange-600 shadow-md'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  <span className="text-[8px] opacity-75 uppercase tracking-widest font-mono">Step 3</span>
                  <span>Assign & Out</span>
                </button>
              </div>
            </div>

            {/* Action updater inside modal */}
            <div className="space-y-2 pt-2 border-t">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Fulfillment Board Fine Override</p>
              <div className="flex flex-wrap gap-1.5">
                {statusesList.map((st) => (
                  <button
                    key={st}
                    onClick={() => {
                      handleStatusSelectorChange(selectedOrder.id, st);
                      setSelectedOrder((prev) => prev ? { ...prev, status: st } : null);
                    }}
                    className={`px-2 py-1 text-[9px] font-bold rounded-lg border transition ${
                      selectedOrder.status === st
                        ? 'bg-slate-900 text-white border-slate-900 shadow'
                        : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
