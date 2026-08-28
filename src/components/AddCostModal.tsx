import React, { useState } from 'react';
import { X, Scissors, UserCheck } from 'lucide-react';
import { Order, OrderCost, Partner, ShopProfile } from '../types';

interface AddCostModalProps {
  isOpen: boolean;
  order: Order | null;
  partners: Partner[];
  shopProfile: ShopProfile;
  onClose: () => void;
  onAddCost: (orderId: string, cost: OrderCost) => void;
}

export const AddCostModal: React.FC<AddCostModalProps> = ({
  isOpen,
  order,
  partners,
  shopProfile,
  onClose,
  onAddCost,
}) => {
  const [costType, setCostType] = useState<OrderCost['costType']>('Telafi');
  const [item, setItem] = useState('');
  const [amount, setAmount] = useState('');
  const [partnerId, setPartnerId] = useState(partners[0]?.id || '');
  const [status, setStatus] = useState<OrderCost['status']>('Unpaid');
  const [notes, setNotes] = useState('');

  if (!isOpen || !order) return null;

  const selectedPartner = partners.find((p) => p.id === partnerId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount) || 0;
    if (parsedAmount <= 0) return;

    const newCost: OrderCost = {
      id: crypto.randomUUID(),
      item: item || costType,
      costType: costType,
      amount: parsedAmount,
      partnerId: partnerId,
      partnerName: selectedPartner?.name,
      status: status,
      notes: notes,
    };

    onAddCost(order.id, newCost);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#fff8f4] dark:bg-[#1c1510] text-[#211a15] dark:text-[#f7ebe1] rounded-xl border border-[#d7c3b2]/30 dark:border-[#524438] shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#d7c3b2]/20 dark:border-[#524438] flex justify-between items-center bg-white dark:bg-[#241a13]">
          <div className="flex items-center gap-2">
            <Scissors className="w-5 h-5 text-[#885000] dark:text-[#ffb86d]" />
            <h2 className="font-headline text-lg font-bold text-[#211a15] dark:text-white">
              Add Cost & Labor
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#847466] dark:text-[#a08e80] hover:text-[#885000] dark:hover:text-[#ffb86d] hover:bg-[#ede0d6] dark:hover:bg-[#33261c] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#524438] dark:text-[#d7c3b2] mb-1">
              Cost Category *
            </label>
            <select
              value={costType}
              onChange={(e) => setCostType(e.target.value as OrderCost['costType'])}
              className="w-full px-3 py-2 bg-white dark:bg-[#241a13] border border-[#211a15]/15 dark:border-[#524438] rounded-lg text-sm text-[#211a15] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#885000]"
            >
              <option value="Telafi">Telafi (Pleating & Traditional Crafts)</option>
              <option value="Sefi">Sefi / Tailoring</option>
              <option value="Material">Material / Fabric</option>
              <option value="Manufacturing">Assembly / Manufacturing</option>
              <option value="Delivery">Delivery & Logistics</option>
              <option value="Other">Other Workshop Overhead</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#524438] dark:text-[#d7c3b2] mb-1">
              Description / Item Name *
            </label>
            <input
              type="text"
              required
              value={item}
              onChange={(e) => setItem(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-[#241a13] border border-[#211a15]/15 dark:border-[#524438] rounded-lg text-sm text-[#211a15] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#885000]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#524438] dark:text-[#d7c3b2] mb-1">
              Amount ({shopProfile.currency}) *
            </label>
            <input
              type="number"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-[#241a13] border border-[#211a15]/15 dark:border-[#524438] rounded-lg text-base font-bold text-[#211a15] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#885000]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#524438] dark:text-[#d7c3b2] mb-1">
              Partner / Sub-contractor
            </label>
            <select
              value={partnerId}
              onChange={(e) => setPartnerId(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-[#241a13] border border-[#211a15]/15 dark:border-[#524438] rounded-lg text-sm text-[#211a15] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#885000]"
            >
              <option value="">None / In-House</option>
              {partners.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.type})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#524438] dark:text-[#d7c3b2] mb-1">
              Payment Status *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Unpaid', 'Partially Paid', 'Paid'] as OrderCost['status'][]).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatus(st)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all ${
                    status === st
                      ? 'bg-[#885000] text-white border-[#885000] shadow-sm'
                      : 'bg-white dark:bg-[#241a13] text-[#524438] dark:text-[#d7c3b2] border-[#211a15]/15 dark:border-[#524438] hover:bg-[#fff8f4] dark:hover:bg-[#33261c]'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#524438] dark:text-[#d7c3b2] mb-1">
              Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Due before garment release"
              className="w-full px-3 py-2 bg-white dark:bg-[#241a13] border border-[#211a15]/15 dark:border-[#524438] rounded-lg text-sm text-[#211a15] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#885000]"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2.5 border-t border-[#d7c3b2]/20 dark:border-[#524438]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-[#211a15]/15 dark:border-[#524438] text-xs font-semibold text-[#524438] dark:text-[#d7c3b2] hover:bg-[#ede0d6] dark:hover:bg-[#33261c] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-[#885000] text-white text-xs font-bold shadow hover:bg-[#a6681c] active:scale-95 transition-all"
            >
              Save Cost
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
