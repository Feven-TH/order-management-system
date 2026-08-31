import React, { useState } from 'react';
import {
  Package,
  Plus,
  AlertTriangle,
  Scissors,
  TrendingDown,
  X,
  Edit2,
  CheckCircle2,
} from 'lucide-react';
import { InventoryItem, Order, ShopProfile } from '../types';

interface InventoryViewProps {
  inventory: InventoryItem[];
  orders: Order[];
  shopProfile: ShopProfile;
  onAddInventory: (item: InventoryItem) => void;
  onUpdateInventory: (item: InventoryItem) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  inventory,
  orders,
  shopProfile,
  onAddInventory,
  onUpdateInventory,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<InventoryItem['category']>('Fabric');
  const [stock, setStock] = useState('');
  const [unit, setUnit] = useState('');
  const [costPerUnit, setCostPerUnit] = useState('');
  const [minStockLevel, setMinStockLevel] = useState('');
  const [supplier, setSupplier] = useState('');

  const totalInventoryValue = inventory.reduce(
    (acc, item) => acc + item.stock * item.costPerUnit,
    0
  );

  const lowStockItems = inventory.filter((item) => item.stock <= item.minStockLevel);
  const consumptionLog = orders
    .flatMap((order) =>
      order.materials.map((material) => ({
        ...material,
        orderId: order.id,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
      }))
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const newItem: InventoryItem = {
      id: editingItem?.id || crypto.randomUUID(),
      name,
      category,
      stock: parseFloat(stock) || 0,
      unit,
      costPerUnit: parseFloat(costPerUnit) || 0,
      minStockLevel: parseFloat(minStockLevel) || 0,
      supplier,
    };

    if (editingItem) onUpdateInventory(newItem); else onAddInventory(newItem);
    setShowAddModal(false);
    setEditingItem(null);
    setName('');
    setSupplier('');
  };

  const openEditItem = (item: InventoryItem) => {
    setEditingItem(item);
    setName(item.name);
    setCategory(item.category);
    setStock(String(item.stock));
    setUnit(item.unit);
    setCostPerUnit(String(item.costPerUnit));
    setMinStockLevel(String(item.minStockLevel));
    setSupplier(item.supplier || '');
    setShowAddModal(true);
  };

  const handleStockAdjustment = (item: InventoryItem, delta: number) => {
    const newStock = Math.max(0, item.stock + delta);
    onUpdateInventory({
      ...item,
      stock: newStock,
    });
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-10 py-6 md:py-8 space-y-6 animate-fadeIn pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline text-2xl md:text-3xl font-bold text-[#211a15] dark:text-white">
            Raw Materials & Haberdashery
          </h1>
          <p className="text-sm text-[#524438] dark:text-[#d7c3b2] mt-0.5">
            Monitor suiting wool bolts, silk rolls, horn buttons, canvas, and zippers.
          </p>
        </div>

        <button
          onClick={() => { setEditingItem(null); setName(''); setStock(''); setUnit(''); setCostPerUnit(''); setMinStockLevel(''); setSupplier(''); setShowAddModal(true); }}
          className="bg-[#a6681c] hover:bg-[#885000] text-white font-headline text-xs sm:text-sm font-semibold px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-lg shadow-sm flex items-center justify-center gap-1.5 sm:gap-2 active:scale-95 transition-all self-start sm:self-auto shrink-0 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Add Material</span>
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#fff1e7] dark:bg-[#2a2018] p-6 rounded-xl border border-[#d7c3b2]/30 flex justify-between items-center">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#524438] dark:text-[#d7c3b2]">
              Total Material Valuation
            </span>
            <p className="font-headline text-3xl font-bold text-[#885000] dark:text-[#ffb86d] mt-1">
              {totalInventoryValue.toLocaleString()} {shopProfile.currency}
            </p>
            <p className="text-xs text-[#524438] dark:text-[#d7c3b2] mt-0.5">
              Across {inventory.length} distinct material and trim SKU items
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-[#fdbd72] text-[#784a05] flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-[#fff1e7] dark:bg-[#2a2018] p-6 rounded-xl border border-[#d7c3b2]/30 flex justify-between items-center">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#524438] dark:text-[#d7c3b2]">
              Low Stock Alerts
            </span>
            <p
              className={`font-headline text-3xl font-bold mt-1 ${
                lowStockItems.length > 0 ? 'text-[#ba1a1a]' : 'text-green-700'
              }`}
            >
              {lowStockItems.length} Items Below Threshold
            </p>
            <p className="text-xs text-[#524438] dark:text-[#d7c3b2] mt-0.5">
              {lowStockItems.length > 0
                ? 'Requires supplier reorder before cutting begins'
                : 'All material stock levels healthy'}
            </p>
          </div>
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center ${
              lowStockItems.length > 0
                ? 'bg-red-100 text-[#ba1a1a]'
                : 'bg-green-100 text-green-800'
            }`}
          >
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Inventory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {inventory.map((item) => {
          const isLow = item.stock <= item.minStockLevel;
          return (
            <div
              key={item.id}
              onClick={() => openEditItem(item)}
              className="bg-white dark:bg-[#241a13] border border-[#d7c3b2]/25 dark:border-[#524438] rounded-xl p-5 flex flex-col justify-between hover:shadow-md transition-all shadow-sm cursor-pointer"
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[11px] font-semibold text-[#885000] dark:text-[#ffb86d] uppercase">
                    {item.category}
                  </span>
                  {isLow ? (
                    <span className="px-2 py-0.5 bg-red-100 text-[#ba1a1a] text-[10px] font-bold rounded">
                      Low Stock
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-green-50 text-green-800 text-[10px] font-semibold rounded">
                      In Stock
                    </span>
                  )}
                </div>

                <h4 className="font-headline font-bold text-base text-[#211a15] dark:text-white">
                  {item.name}
                </h4>

                {item.supplier && (
                  <p className="text-xs text-[#847466] mt-0.5">Supplier: {item.supplier}</p>
                )}

                <p className="text-xs text-[#524438] dark:text-[#d7c3b2] mt-2">
                  Unit Cost:{' '}
                  <span className="font-bold">
                    {item.costPerUnit} {shopProfile.currency}
                  </span>{' '}
                  / {item.unit}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#d7c3b2]/20 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#847466] block">
                    Available Stock
                  </span>
                  <span className="font-headline font-bold text-lg text-[#211a15] dark:text-white">
                    {item.stock}{' '}
                    <span className="text-xs font-normal text-[#847466]">{item.unit}</span>
                  </span>
                </div>

                <div className="flex items-center gap-1.5 bg-[#fff8f4] dark:bg-[#1a120c] p-1 rounded-lg border border-[#d7c3b2]/30">
                  <button
                    onClick={(event) => { event.stopPropagation(); handleStockAdjustment(item, -1); }}
                    className="w-7 h-7 rounded bg-white dark:bg-[#241a13] border border-[#d7c3b2]/40 text-[#211a15] dark:text-white font-bold flex items-center justify-center hover:bg-[#ede0d6]"
                  >
                    -
                  </button>
                  <button
                    onClick={(event) => { event.stopPropagation(); handleStockAdjustment(item, 1); }}
                    className="w-7 h-7 rounded bg-[#885000] text-white font-bold flex items-center justify-center hover:bg-[#a6681c]"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Order Consumption Log */}
      <section className="bg-white dark:bg-[#241a13] border border-[#d7c3b2]/25 dark:border-[#524438] rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[#d7c3b2]/20 dark:border-[#524438] flex items-center gap-2">
          <Scissors className="w-4 h-4 text-[#885000]" />
          <div>
            <h2 className="font-headline font-bold text-base text-[#211a15] dark:text-white">Order Consumption Log</h2>
            <p className="text-[11px] text-[#847466]">Materials deducted from inventory for active orders.</p>
          </div>
        </div>

        {consumptionLog.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-xs">
              <thead className="bg-[#fff8f4] dark:bg-[#1a120c] text-[#847466] uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-5 py-3 font-semibold">Material</th>
                  <th className="px-4 py-3 font-semibold">Order</th>
                  <th className="px-4 py-3 font-semibold text-right">Quantity</th>
                  <th className="px-5 py-3 font-semibold text-right">Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d7c3b2]/15">
                {consumptionLog.map((entry) => (
                  <tr key={entry.id} className="text-[#524438] dark:text-[#d7c3b2]">
                    <td className="px-5 py-3 font-semibold text-[#211a15] dark:text-white">{entry.materialName}</td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-[#211a15] dark:text-white">{entry.orderNumber}</span>
                      <span className="block text-[11px] text-[#847466]">{entry.customerName}</span>
                    </td>
                    <td className="px-4 py-3 text-right">{entry.quantityUsed.toLocaleString()} {entry.unit}</td>
                    <td className="px-5 py-3 text-right font-mono font-semibold text-[#211a15] dark:text-white">
                      {entry.totalCost.toLocaleString()} {shopProfile.currency}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="px-5 py-7 text-center text-xs text-[#847466]">No materials have been assigned to orders yet.</p>
        )}
      </section>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#fff8f4] dark:bg-[#1c1510] text-[#211a15] dark:text-[#f7ebe1] rounded-xl border border-[#d7c3b2]/30 dark:border-[#524438] shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-[#d7c3b2]/20 dark:border-[#524438] flex justify-between items-center bg-white dark:bg-[#241a13]">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-[#885000] dark:text-[#ffb86d]" />
                <h3 className="font-headline font-bold text-base text-[#211a15] dark:text-white">
                  {editingItem ? 'Edit Material / SKU' : 'Add Material / SKU'}
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-full text-[#847466] dark:text-[#a08e80] hover:text-[#885000] dark:hover:text-[#ffb86d] hover:bg-[#ede0d6] dark:hover:bg-[#33261c] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#524438] dark:text-[#d7c3b2] mb-1">
                  Item / Fabric Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Italian Super 150s Navy Wool"
                  className="w-full px-3 py-2 bg-white dark:bg-[#241a13] border border-[#211a15]/15 dark:border-[#524438] rounded-lg text-sm text-[#211a15] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#885000]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#524438] dark:text-[#d7c3b2] mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as InventoryItem['category'])}
                    className="w-full px-3 py-2 bg-white dark:bg-[#241a13] border border-[#211a15]/15 dark:border-[#524438] rounded-lg text-sm text-[#211a15] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#885000]"
                  >
                    <option value="Fabric">Fabric</option>
                    <option value="Lining">Lining</option>
                    <option value="Trims & Buttons">Trims & Buttons</option>
                    <option value="Zipper">Zipper</option>
                    <option value="Thread">Thread</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#524438] dark:text-[#d7c3b2] mb-1">
                    Unit
                  </label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="meters / pcs / sets"
                    className="w-full px-3 py-2 bg-white dark:bg-[#241a13] border border-[#211a15]/15 dark:border-[#524438] rounded-lg text-sm text-[#211a15] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#885000]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#524438] dark:text-[#d7c3b2] mb-1">
                    Initial Stock
                  </label>
                  <input
                    type="number"
                    required
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-[#241a13] border border-[#211a15]/15 dark:border-[#524438] rounded-lg text-sm text-[#211a15] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#885000]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#524438] dark:text-[#d7c3b2] mb-1">
                    Cost per Unit ({shopProfile.currency})
                  </label>
                  <input
                    type="number"
                    required
                    value={costPerUnit}
                    onChange={(e) => setCostPerUnit(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-[#241a13] border border-[#211a15]/15 dark:border-[#524438] rounded-lg text-sm text-[#211a15] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#885000]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#524438] dark:text-[#d7c3b2] mb-1">
                  Supplier / Vendor
                </label>
                <input
                  type="text"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  placeholder="e.g. Ethio Textiles Co."
                  className="w-full px-3 py-2 bg-white dark:bg-[#241a13] border border-[#211a15]/15 dark:border-[#524438] rounded-lg text-sm text-[#211a15] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#885000]"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2.5 border-t border-[#d7c3b2]/20 dark:border-[#524438]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg border border-[#211a15]/15 dark:border-[#524438] text-xs font-semibold text-[#524438] dark:text-[#d7c3b2] hover:bg-[#ede0d6] dark:hover:bg-[#33261c] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#885000] hover:bg-[#a6681c] text-white text-xs font-bold shadow-2xs active:scale-95 transition-all"
                >
                  Save Material
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
