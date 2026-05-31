import React, { useState } from 'react';
import { useAppState } from '../../context/StateContext';
import { Product } from '../../types';
import { Search, Save, AlertTriangle, ToggleLeft, ToggleRight, CheckCircle, Package } from 'lucide-react';

export const AdminInventoryManagement: React.FC = () => {
  const { products, updateProduct, showToast } = useAppState();

  const [searchQuery, setSearchQuery] = useState('');
  
  // Track temporary stock inputs to allow typing before clicking Save
  const [stockInputs, setStockInputs] = useState<{ [id: string]: number }>({});

  const handleStockInputChange = (productId: string, val: string) => {
    const num = val === '' ? 0 : Number(val);
    setStockInputs((prev) => ({ ...prev, [productId]: num }));
  };

  // Commit single stock save change
  const handleSaveStock = (product: Product) => {
    const inputVal = stockInputs[product.id];
    const newStock = inputVal !== undefined ? inputVal : product.stock;

    updateProduct({
      ...product,
      stock: newStock,
      isAvailable: newStock > 0 ? product.isAvailable : false, // Out of stock items auto disable or warn
    });

    showToast(`Stock levels set to ${newStock} for "${product.name}"`, 'success');
  };

  // Toggle active availability of products directly
  const handleToggleAvailability = (product: Product) => {
    const updatedStatus = !product.isAvailable;
    updateProduct({
      ...product,
      isAvailable: updatedStatus,
    });
    showToast(`"${product.name}" is now ${updatedStatus ? 'VISIBLE' : 'HIDDEN'} on customer store`, 'success');
  };

  const handleBulkRestockAllLowStock = () => {
    const lowStockOnes = products.filter((p) => p.stock < 10);
    if (lowStockOnes.length === 0) {
      showToast('No low stock items need replenishment!', 'success');
      return;
    }

    lowStockOnes.forEach((prod) => {
      // Bulk update sets everything to 50
      updateProduct({
        ...prod,
        stock: 50,
        isAvailable: true,
      });
    });

    showToast(`Replenished all ${lowStockOnes.length} low-stock items to 50 units!`, 'success');
  };

  const filteredProducts = products.filter((p) => {
    return (
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.brand && p.brand.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-display font-black text-xl text-gray-900 tracking-tight">Inventory & Stock Console</h2>
          <p className="text-xs text-gray-500">Fast inline adjustments to shelves quantities and item visibility</p>
        </div>

        <button
          onClick={handleBulkRestockAllLowStock}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition cursor-pointer select-none flex items-center gap-1.5 shadow"
        >
          <Package className="w-4 h-4 text-brand-400" />
          <span>Restock All Low Stock to 50</span>
        </button>
      </div>

      {/* Search box controller */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-100 flex items-center text-xs font-semibold text-slate-705 shadow-xs">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search catalog items by name, category or brand details..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 bg-slate-50/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-xs"
          />
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400" />
        </div>
      </div>

      {/* Main inventory bulk editor table */}
      <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-xs">
        {filteredProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[9px]">
                  <th className="p-4">Product details</th>
                  <th className="p-4">Catalog Department</th>
                  <th className="p-4">Active Stock Count</th>
                  <th className="p-4">Display Toggle</th>
                  <th className="p-4 text-right">Commit Changes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredProducts.map((p) => {
                  const tempVal = stockInputs[p.id];
                  const currentInputValue = tempVal !== undefined ? tempVal : p.stock;
                  
                  const isLow = p.stock < 10;
                  const isOut = p.stock === 0;

                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-slate-50/10 transition ${
                        isOut ? 'bg-red-50/10' : isLow ? 'bg-amber-50/10' : ''
                      }`}
                    >
                      
                      {/* Products profile */}
                      <td className="p-4 flex items-center gap-3">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-10 h-10 object-cover rounded-lg border shrink-0 bg-slate-50"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-slate-905 truncate max-w-[200px]">{p.name}</p>
                          <p className="text-[10px] text-gray-400">{p.unit} unit size</p>
                        </div>
                      </td>

                      {/* Department category */}
                      <td className="p-4 font-semibold text-slate-500 capitalize">
                        {p.category}
                      </td>

                      {/* Editable stocks field */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={0}
                            value={currentInputValue}
                            onChange={(e) => handleStockInputChange(p.id, e.target.value)}
                            className={`w-20 px-2.5 py-1.5 border rounded-lg text-xs font-mono font-bold text-center focus:outline-none focus:ring-1 focus:ring-brand-500 ${
                              isOut
                                ? 'border-red-300 bg-red-50 text-red-700'
                                : isLow
                                ? 'border-amber-300 bg-amber-50 text-amber-800'
                                : 'border-slate-200 bg-white'
                            }`}
                          />
                          {(isOut || isLow) && (
                            <AlertTriangle className={`w-4 h-4 shrink-0 ${isOut ? 'text-red-500' : 'text-amber-550 animate-pulse'}`} />
                          )}
                        </div>
                      </td>

                      {/* Availability switcher */}
                      <td className="p-4">
                        <button
                          onClick={() => handleToggleAvailability(p)}
                          className={`flex items-center gap-1.5 text-[11px] font-bold transition-colors ${
                            p.isAvailable ? 'text-emerald-600' : 'text-slate-400'
                          }`}
                          title="Toggle Customer store visibility"
                        >
                          {p.isAvailable ? (
                            <ToggleRight className="w-7 h-7 text-emerald-500" />
                          ) : (
                            <ToggleLeft className="w-7 h-7 text-gray-300" />
                          )}
                          <span>{p.isAvailable ? 'VISIBLE' : 'HIDDEN'}</span>
                        </button>
                      </td>

                      {/* Inline single save trigger */}
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleSaveStock(p)}
                          disabled={p.stock === currentInputValue}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold flex items-center gap-1 ml-auto border transition ${
                            p.stock === currentInputValue
                              ? 'bg-slate-50 border-slate-150 text-slate-350 cursor-not-allowed'
                              : 'bg-brand-600 text-white hover:bg-brand-700 border-transparent shadow shadow-brand-50 cursor-pointer'
                          }`}
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>SAVE Stock</span>
                        </button>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-gray-400 text-xs">
            No products match search queries parameters.
          </div>
        )}
      </div>

    </div>
  );
};
