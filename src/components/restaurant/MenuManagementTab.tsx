import React, { useState } from 'react';
import { useTenant } from '../../context/TenantContext';
import { MenuItem } from '../../types/tenant';
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Sparkles,
  Search,
  CheckCircle2,
  X,
  ExternalLink,
  FileSpreadsheet,
} from 'lucide-react';
import { ExcelMenuUploadModal } from './ExcelMenuUploadModal';

export const MenuManagementTab: React.FC = () => {
  const {
    activeRestaurant,
    activeMenuItems,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    setRole,
  } = useTenant();

  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // Form State
  const [dishName, setDishName] = useState('');
  const [category, setCategory] = useState('Starters');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number>(450);
  const [imageUrl, setImageUrl] = useState('');
  const [isVeg, setIsVeg] = useState<boolean>(true);
  const [isChefSpecial, setIsChefSpecial] = useState<boolean>(false);

  const categories = ['All', 'Starters', 'Mains', 'Breads', 'Rice', 'Desserts', 'Beverages'];

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setDishName('');
    setCategory('Starters');
    setDescription('');
    setPrice(450);
    setImageUrl('https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80');
    setIsVeg(true);
    setIsChefSpecial(false);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (dish: MenuItem) => {
    setEditingItem(dish);
    setDishName(dish.name);
    setCategory(dish.category);
    setDescription(dish.description);
    setPrice(dish.price);
    setImageUrl(dish.imageUrl);
    setIsVeg(dish.isVeg);
    setIsChefSpecial(dish.isChefSpecial || false);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dishName || !price) return;

    if (editingItem) {
      updateMenuItem(editingItem.id, {
        name: dishName,
        category,
        description,
        price: Number(price),
        imageUrl: imageUrl || editingItem.imageUrl,
        isVeg,
        isChefSpecial,
      });
    } else {
      addMenuItem({
        restaurantId: activeRestaurant.id,
        name: dishName,
        category,
        description,
        price: Number(price),
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
        isVeg,
        isChefSpecial,
        isAvailable: true,
        rating: 4.8,
      });
    }

    setIsModalOpen(false);
  };

  const filteredDishes = activeMenuItems.filter((dish) => {
    const matchesCat = selectedCat === 'All' || dish.category === selectedCat;
    const matchesSearch =
      dish.name.toLowerCase().includes(search.toLowerCase()) ||
      dish.description.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Menu Catalog & Recipe Management
          </h2>
          <p className="text-xs text-slate-500">
            Real-time synchronization with guest table QR menus.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsExcelModalOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-50 border border-emerald-300 text-emerald-800 hover:bg-emerald-100 flex items-center space-x-1.5 shadow-sm transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
            <span>Import via Excel / CSV</span>
          </button>

          <button
            onClick={() => setRole('customer')}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center space-x-1.5 transition"
          >
            <span>Live Guest Preview</span>
            <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
          </button>

          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white shadow-sm flex items-center space-x-1.5 transition"
            style={{ backgroundColor: activeRestaurant.branding.primaryColor }}
          >
            <Plus className="w-4 h-4" />
            <span>Add Dish</span>
          </button>
        </div>
      </div>

      {/* Categories and Search Filter */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="w-full sm:w-80 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search menu dishes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none"
            />
          </div>

          <div className="flex items-center space-x-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  selectedCat === cat
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Dishes Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-3">Item</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Price</th>
                <th className="py-3 px-3">Rating</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDishes.map((dish) => (
                <tr key={dish.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-3">
                    <div className="flex items-center space-x-3">
                      <img
                        src={dish.imageUrl}
                        alt={dish.name}
                        className="w-11 h-11 rounded-lg object-cover border border-slate-200 shrink-0"
                      />
                      <div>
                        <div className="font-bold text-slate-900 flex items-center space-x-1.5">
                          <span>{dish.name}</span>
                          {dish.isChefSpecial && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[9px] font-bold">
                              Special
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 line-clamp-1 max-w-xs">
                          {dish.description}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-3 font-semibold text-slate-600">
                    {dish.category}
                  </td>

                  <td className="py-3 px-3">
                    {dish.isVeg ? (
                      <span className="inline-flex items-center space-x-1 text-emerald-700 font-bold text-[11px]">
                        <span className="w-2 h-2 rounded-full bg-emerald-600" />
                        <span>Veg</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 text-rose-700 font-bold text-[11px]">
                        <span className="w-2 h-2 rounded-full bg-rose-600" />
                        <span>Non-Veg</span>
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-3 font-serif font-bold text-slate-900 text-sm">
                    ₹{dish.price}
                  </td>

                  <td className="py-3 px-3 font-bold text-amber-600">
                    ★ {dish.rating}
                  </td>

                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={() => updateMenuItem(dish.id, { isAvailable: !dish.isAvailable })}
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        dish.isAvailable
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {dish.isAvailable ? 'In Stock' : 'Hidden'}
                    </button>
                  </td>

                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end space-x-1">
                      <button
                        onClick={() => handleOpenEditModal(dish)}
                        className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition"
                        title="Edit Dish"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete ${dish.name} from menu?`)) {
                            deleteMenuItem(dish.id);
                          }
                        }}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Delete Dish"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Dish Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-serif font-bold text-lg text-slate-900">
                {editingItem ? 'Edit Dish Details' : 'Add New Culinary Creation'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Dish Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kashmiri Rogan Josh"
                  value={dishName}
                  onChange={(e) => setDishName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
                  >
                    {categories.filter((c) => c !== 'All').map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Gastronomy Description
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe preparation, cuts, spices, and heritage..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Food Photograph URL
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="url"
                    placeholder="https://..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setImageUrl('https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80')
                    }
                    className="px-2.5 py-2 text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200"
                  >
                    Preset Photo
                  </button>
                </div>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <label className="flex items-center space-x-2 p-2.5 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={isVeg}
                    onChange={(e) => setIsVeg(e.target.checked)}
                    className="accent-emerald-600"
                  />
                  <span className="font-semibold text-slate-800">Vegetarian Dish</span>
                </label>

                <label className="flex items-center space-x-2 p-2.5 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={isChefSpecial}
                    onChange={(e) => setIsChefSpecial(e.target.checked)}
                    className="accent-amber-600"
                  />
                  <span className="font-semibold text-slate-800">Chef Special</span>
                </label>
              </div>

              <div className="flex items-center space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl font-bold uppercase tracking-wider text-white shadow-md"
                  style={{ backgroundColor: activeRestaurant.branding.primaryColor }}
                >
                  {editingItem ? 'Update Dish' : 'Publish Dish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Excel Ingestion Modal */}
      {isExcelModalOpen && (
        <ExcelMenuUploadModal onClose={() => setIsExcelModalOpen(false)} />
      )}
    </div>
  );
};
