import React, { useState, useEffect } from 'react';
import { X, User, Phone, Mail, MapPin, FileText } from 'lucide-react';
import { Customer } from '../types';

interface NewCustomerModalProps {
  isOpen: boolean;
  customerToEdit?: Customer | null;
  onClose: () => void;
  onSaveCustomer: (customer: Customer) => void;
}

export const NewCustomerModal: React.FC<NewCustomerModalProps> = ({
  isOpen,
  customerToEdit,
  onClose,
  onSaveCustomer,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [altPhone, setAltPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (customerToEdit) {
      setName(customerToEdit.name);
      setPhone(customerToEdit.phone);
      setAltPhone(customerToEdit.altPhone || '');
      setEmail(customerToEdit.email || '');
      setAddress(customerToEdit.address || '');
      setNotes(customerToEdit.notes || '');
    } else {
      setName('');
      setPhone('');
      setAltPhone('');
      setEmail('');
      setAddress('');
      setNotes('');
    }
  }, [customerToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    const initials = name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

    const customer: Customer = {
      id: customerToEdit ? customerToEdit.id : `cust-${Date.now()}`,
      name,
      phone,
      altPhone,
      email,
      address,
      notes,
      initials: initials || 'CL',
      totalOrders: customerToEdit ? customerToEdit.totalOrders : 0,
      balance: customerToEdit ? customerToEdit.balance : 0,
      createdAt: customerToEdit ? customerToEdit.createdAt : new Date().toISOString().split('T')[0],
    };

    onSaveCustomer(customer);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#fff8f4] dark:bg-[#1c1510] text-[#211a15] dark:text-[#f7ebe1] rounded-xl border border-[#d7c3b2]/30 dark:border-[#524438] shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#d7c3b2]/20 dark:border-[#524438] flex justify-between items-center bg-white dark:bg-[#241a13]">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-[#885000] dark:text-[#ffb86d]" />
            <h2 className="font-headline text-lg font-bold text-[#211a15] dark:text-white">
              {customerToEdit ? 'Edit Client Profile' : 'Add New Client'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#847466] dark:text-[#a08e80] hover:text-[#885000] dark:hover:text-[#ffb86d] hover:bg-[#ede0d6] dark:hover:bg-[#33261c] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#524438] dark:text-[#d7c3b2] mb-1">
              Full Name *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#847466] dark:text-[#a08e80] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Customer name"
                className="w-full pl-9 pr-3 py-2 bg-white dark:bg-[#241a13] border border-[#211a15]/15 dark:border-[#524438] rounded-lg text-sm text-[#211a15] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#885000]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#524438] dark:text-[#d7c3b2] mb-1">
                Primary Phone *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#847466] dark:text-[#a08e80] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+251 911 XXX XXX"
                  className="w-full pl-9 pr-3 py-2 bg-white dark:bg-[#241a13] border border-[#211a15]/15 dark:border-[#524438] rounded-lg text-sm text-[#211a15] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#885000]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#524438] dark:text-[#d7c3b2] mb-1">
                Alternate Phone
              </label>
              <input
                type="tel"
                value={altPhone}
                onChange={(e) => setAltPhone(e.target.value)}
                placeholder="0911 XXX XXX"
                className="w-full px-3 py-2 bg-white dark:bg-[#241a13] border border-[#211a15]/15 dark:border-[#524438] rounded-lg text-sm text-[#211a15] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#885000]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#524438] dark:text-[#d7c3b2] mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#847466] dark:text-[#a08e80] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sarah@example.com"
                className="w-full pl-9 pr-3 py-2 bg-white dark:bg-[#241a13] border border-[#211a15]/15 dark:border-[#524438] rounded-lg text-sm text-[#211a15] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#885000]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#524438] dark:text-[#d7c3b2] mb-1">
              Physical / Delivery Address
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-[#847466] dark:text-[#a08e80] absolute left-3 top-2.5" />
              <textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Bole Medhanealem, House 402, Addis Ababa"
                className="w-full pl-9 pr-3 py-2 bg-white dark:bg-[#241a13] border border-[#211a15]/15 dark:border-[#524438] rounded-lg text-sm text-[#211a15] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#885000]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#524438] dark:text-[#d7c3b2] mb-1">
              Tailoring Fit Preferences & Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Prefers silk lining, broad shoulder posture, fitted waist..."
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
              {customerToEdit ? 'Save Changes' : 'Create Client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
