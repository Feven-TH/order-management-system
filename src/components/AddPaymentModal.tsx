import React, { useState } from 'react';
import { X, CreditCard, DollarSign } from 'lucide-react';
import { Order, PaymentLog, PaymentMethod, ShopProfile } from '../types';

interface AddPaymentModalProps {
  isOpen: boolean;
  order: Order | null;
  shopProfile: ShopProfile;
  onClose: () => void;
  onAddPayment: (orderId: string, paymentLog: PaymentLog) => void;
}

export const AddPaymentModal: React.FC<AddPaymentModalProps> = ({
  isOpen,
  order,
  shopProfile,
  onClose,
  onAddPayment,
}) => {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('Telebirr');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');

  if (!isOpen || !order) return null;

  const remaining = Math.max(0, order.price - order.paid);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount) || 0;
    if (parsedAmount <= 0) return;

    const newLog: PaymentLog = {
      id: `pay-${Date.now()}`,
      amount: parsedAmount,
      method: method,
      date: date,
      note: note,
    };

    onAddPayment(order.id, newLog);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#fff8f4] dark:bg-[#1c1510] text-[#211a15] dark:text-[#f7ebe1] rounded-xl border border-[#d7c3b2]/30 dark:border-[#524438] shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#d7c3b2]/20 dark:border-[#524438] flex justify-between items-center bg-white dark:bg-[#241a13]">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#885000] dark:text-[#ffb86d]" />
            <h2 className="font-headline text-lg font-bold text-[#211a15] dark:text-white">
              Add Payment for {order.orderNumber}
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
          <div className="p-3 bg-[#fff1e7] dark:bg-[#2a2018] rounded-lg border border-[#d7c3b2]/30 dark:border-[#524438] text-xs flex justify-between items-center">
            <span className="text-[#524438] dark:text-[#d7c3b2]">Total Remaining Balance:</span>
            <span className="font-headline font-bold text-sm text-[#ba1a1a] dark:text-[#ffb4ab]">
              {remaining.toLocaleString()} {shopProfile.currency}
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#524438] dark:text-[#d7c3b2] mb-1">
              Amount ({shopProfile.currency}) *
            </label>
            <input
              type="number"
              required
              max={remaining > 0 ? remaining * 1.5 : undefined}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-[#241a13] border border-[#211a15]/15 dark:border-[#524438] rounded-lg text-base font-bold text-[#211a15] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#885000]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#524438] dark:text-[#d7c3b2] mb-1">
              Payment Method *
            </label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as PaymentMethod)}
              className="w-full px-3 py-2 bg-white dark:bg-[#241a13] border border-[#211a15]/15 dark:border-[#524438] rounded-lg text-sm text-[#211a15] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#885000]"
            >
              <option value="Telebirr">Telebirr</option>
              <option value="Cash">Cash</option>
              <option value="CBE">CBE (Commercial Bank of Ethiopia)</option>
              <option value="Other Bank">Other Bank / Transfer</option>
              <option value="Card">Card</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#524438] dark:text-[#d7c3b2] mb-1">
              Payment Date *
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-[#241a13] border border-[#211a15]/15 dark:border-[#524438] rounded-lg text-sm text-[#211a15] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#885000]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#524438] dark:text-[#d7c3b2] mb-1">
              Note (Optional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Received via CBE mobile transfer"
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
              Record Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
