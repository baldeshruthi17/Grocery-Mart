import React, { useState } from 'react';
import { useAppState } from '../../context/StateContext';
import { Product } from '../../types';
import { categories } from '../../data/dummyData';
import { Edit2, Trash2, Plus, X, Search, AlertCircle, Sparkles, Filter, Percent } from 'lucide-react';

interface AdminProductManagementProps {
  isAddModalOpenInitially?: boolean;
  onModalClose?: () => void;
}

export const AdminProductManagement: React.FC<AdminProductManagementProps> = ({
  isAddModalOpenInitially = false,
  onModalClose,
}) => {
  const { products, addProduct, updateProduct, deleteProduct } = useAppState();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  // Modal forms state
  const [isModalOpen, setIsModalOpen] = useState(isAddModalOpenInitially);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    category: 'staples',
    brand: '',
    price: 0,
    mrp: 0,
    unit: '1 kg',
    description: '',
    stock: 20,
    image: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&q=80&w=600',
    discount: 0,
    isAvailable: true,
  });

  const [formError, setFormError] = useState('');

  // Handle open modal for adding
  const handleOpenAdd = () => {
    setModalMode('add');
    setFormData({
      name: '',
      category: 'staples',
      brand: '',
      price: 10,
      mrp: 12,
      unit: '1 kg',
      description: '',
      stock: 20,
      image: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&q=80&w=600',
      discount: 0,
      isAvailable: true,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  // Handle open modal for editing
  const handleOpenEdit = (prod: Product) => {
    setModalMode('edit');
    setEditingProductId(prod.id);
    setFormData({
      name: prod.name,
      category: prod.category,
      brand: prod.brand || '',
      price: prod.price,
      mrp: prod.mrp,
      unit: prod.unit,
      description: prod.description,
      stock: prod.stock,
      image: prod.image,
      discount: prod.discount,
      isAvailable: prod.isAvailable,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    onModalClose?.();
  };

  const handleFormInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Parse values correctly
    let parsedValue: any = value;
    if (type === 'number') {
      parsedValue = value === '' ? 0 : Number(value);
    } else if (name === 'isAvailable') {
      parsedValue = value === 'true';
    }

    setFormData((prev) => {
      const updated = { ...prev, [name]: parsedValue };
      
      // Auto-compute discount from pricing differences if MRP changed or vice-versa
      if (name === 'price' || name === 'mrp') {
        const p = name === 'price' ? Number(value) : prev.price;
        const m = name === 'mrp' ? Number(value) : prev.mrp;
        if (m > p && m > 0) {
          updated.discount = Math.round(((m - p) / m) * 100);
        } else {
          updated.discount = 0;
        }
      }
      return updated;
    });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Validations bounds
    if (!formData.name.trim()) {
      setFormError('Product title is required');
      return;
    }
    if (formData.price <= 0) {
      setFormError('Price must be greater than 0');
      return;
    }
    if (formData.mrp < formData.price) {
      setFormError('MRP cannot be less than Selling Price');
      return;
    }

    if (modalMode === 'add') {
      addProduct({
        ...formData,
        price: Number(formData.price),
        mrp: Number(formData.mrp),
        stock: Number(formData.stock),
        discount: Number(formData.discount),
      });
    } else {
      if (editingProductId) {
        updateProduct({
          ...formData,
          id: editingProductId,
          price: Number(formData.price),
          mrp: Number(formData.mrp),
          stock: Number(formData.stock),
          discount: Number(formData.discount),
          createdAt: new Date().toISOString(),
        });
      }
    }

    handleCloseModal();
  };

  const handleDeleteClick = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name} from JangaonMart?`)) {
      deleteProduct(id);
    }
  };

  // Filter lists inside management table
  const filteredList = products.filter((p) => {
    const matchesCat = activeCategory === 'all' || p.category === activeCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.brand && p.brand.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6 text-left">
      
      {/* Title block */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-display font-black text-xl text-gray-900 tracking-tight">Active Products Catalogue</h2>
          <p className="text-xs text-gray-500">Edit, add SKUs, and manage items details</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs shadow-md shadow-brand-500/10 transition cursor-pointer flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Searching filters topbar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-100 flex flex-wrap gap-4 items-center justify-between text-xs font-semibold text-slate-700 shadow-xs">
        
        <div className="relative flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search items by name, brand or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 bg-slate-50/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-xs"
          />
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400" />
        </div>

        {/* Categories selector filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-gray-400" />
          <select
            value={activeCategory}
            onChange={(e) => setActiveCategory(e.target.value)}
            className="bg-white border rounded-xl px-2.5 py-1.5 focus:outline-none text-xs border-slate-200"
          >
            <option value="all">All Departments ({products.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Desktop Products table list */}
      <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-xs">
        {filteredList.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-705">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[9px]">
                  <th className="p-4">Item Detail</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Selling Price</th>
                  <th className="p-4">MRP (Savings)</th>
                  <th className="p-4">Stock Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredList.map((p) => {
                  const outOfStock = p.stock === 0 || !p.isAvailable;
                  const lowStock = p.stock > 0 && p.stock <= 10;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/20 transition">
                      
                      {/* Image + Title */}
                      <td className="p-4 flex items-center gap-3">
                        <img
                          src={p.image}
                          alt={p.name}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 object-cover rounded-lg border shrink-0 bg-slate-50"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate max-w-[200px]">{p.name}</p>
                          <p className="text-[10px] text-gray-400">
                            {p.unit} pack size • Brand: <span className="font-medium text-slate-600">{p.brand || 'None'}</span>
                          </p>
                        </div>
                      </td>

                      {/* Department */}
                      <td className="p-4 font-semibold capitalize text-slate-500">
                        {p.category}
                      </td>

                      {/* Selling price */}
                      <td className="p-4 font-extrabold text-slate-950 text-sm">
                        ₹{p.price}
                      </td>

                      {/* MRP */}
                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          <span className="line-through text-slate-400">₹{p.mrp}</span>
                          {p.discount > 0 && (
                            <span className="text-[10px] bg-red-50 text-red-650 px-1.5 py-0.5 rounded-full font-bold">
                              {p.discount}% OFF
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Stock level indicators */}
                      <td className="p-4">
                        {outOfStock ? (
                          <span className="inline-block px-2.5 py-1 rounded-full bg-red-50 text-red-700 border border-red-100 font-bold text-[9px] uppercase tracking-wider">
                            Sold Out
                          </span>
                        ) : lowStock ? (
                          <span className="inline-block px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-bold text-[9px] uppercase tracking-wider animate-pulse">
                            Low ({p.stock})
                          </span>
                        ) : (
                          <span className="inline-block px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100 font-bold text-[9px] uppercase tracking-wider">
                            In Stock ({p.stock})
                          </span>
                        )}
                      </td>

                      {/* Controls */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="p-2 text-slate-400 hover:text-brand-600 border border-slate-150 bg-white rounded-lg transition hover:bg-slate-50"
                            title="Edit Product"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          
                          <button
                            onClick={() => handleDeleteClick(p.id, p.name)}
                            className="p-2 text-slate-350 hover:text-red-600 border border-slate-155 bg-white rounded-lg transition hover:bg-red-50"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-gray-400 space-y-2">
            <AlertCircle className="w-8 h-8 text-gray-300 mx-auto" />
            <p>No products matched your search parameters.</p>
          </div>
        )}
      </div>

      {/* Dynamic Pop dialog Form Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={handleCloseModal} className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
          
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl p-6 md:p-8 overflow-y-auto max-h-[90vh] animate-in zoom-in-95 duration-200 text-left">
            <div className="flex justify-between items-center border-b pb-4 mb-6">
              <h3 className="font-display font-black text-lg text-slate-900">
                {modalMode === 'add' ? 'Add New Grocery Product Form' : 'Edit Product Information'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="p-1 border border-slate-100 hover:bg-slate-50 text-slate-400 rounded-full hover:text-slate-900 transition"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-650">Product Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormInputChange}
                    placeholder="e.g., Tata Premium Salt"
                    className="w-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-650">Brand Name</label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleFormInputChange}
                    placeholder="e.g., Tata / Amul / Local Farm"
                    className="w-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-650">Department *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleFormInputChange}
                    className="w-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs rounded-xl focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-650">Pack Unit Size *</label>
                  <input
                    type="text"
                    name="unit"
                    value={formData.unit}
                    onChange={handleFormInputChange}
                    placeholder="e.g., 5 kg / 200 g / 1 L"
                    className="w-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs rounded-xl focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-650">Stock Quantity *</label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleFormInputChange}
                    className="w-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs rounded-xl focus:outline-none"
                    min={0}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-650">Selling Price (INR) *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleFormInputChange}
                    className="w-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs rounded-xl focus:outline-none"
                    min={1}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-650">MRP (Cross Price) *</label>
                  <input
                    type="number"
                    name="mrp"
                    value={formData.mrp}
                    onChange={handleFormInputChange}
                    className="w-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs rounded-xl focus:outline-none"
                    min={formData.price}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-650">Active Discount (%)</label>
                  <input
                    type="number"
                    name="discount"
                    value={formData.discount}
                    className="w-full border border-slate-100 bg-slate-100 px-3 py-2 text-xs rounded-xl text-slate-500 font-bold"
                    disabled
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-650">External Image URL</label>
                <input
                  type="text"
                  name="image"
                  value={formData.image}
                  onChange={handleFormInputChange}
                  placeholder="Paste direct grocery item image asset URL link"
                  className="w-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs rounded-xl focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-650">Detailed Product Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleFormInputChange}
                  placeholder="Ingredients, usage guidelines, nutritional contents, organic tags, etc."
                  rows={3}
                  className="w-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs rounded-xl focus:outline-none"
                  required
                />
              </div>

              {formError && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-800 text-[11px] rounded-xl font-bold">
                  {formError}
                </div>
              )}

              <div className="flex gap-4 pt-4 border-t">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold text-center transition shadow shadow-brand-500/10 cursor-pointer"
                >
                  {modalMode === 'add' ? 'Confirm Addition' : 'Save Changes'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
