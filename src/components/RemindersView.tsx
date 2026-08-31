import React, { useState } from 'react';
import {
  Bell,
  Plus,
  CheckCircle2,
  Calendar,
  Phone,
  MessageCircle,
  Clock,
  Trash2,
  X,
  AlertTriangle,
} from 'lucide-react';
import { ReminderItem, ShopProfile } from '../types';

interface RemindersViewProps {
  reminders: ReminderItem[];
  shopProfile: ShopProfile;
  onAddReminder: (reminder: ReminderItem) => void;
  onUpdateReminder: (reminder: ReminderItem) => void;
  onToggleReminder: (reminderId: string) => void;
  onDeleteReminder: (reminderId: string) => void;
  onOpenMessageSender: (name: string, phone: string, text: string) => void;
}

export const RemindersView: React.FC<RemindersViewProps> = ({
  reminders,
  shopProfile,
  onAddReminder,
  onUpdateReminder,
  onToggleReminder,
  onDeleteReminder,
  onOpenMessageSender,
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingReminder, setEditingReminder] = useState<ReminderItem | null>(null);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState<ReminderItem['type']>('fitting');
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');

  const filteredReminders = reminders.filter((rem) => {
    if (filterType === 'all') return true;
    if (filterType === 'pending') return !rem.completed;
    return rem.type === filterType;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    const newRem: ReminderItem = {
      id: editingReminder?.id || crypto.randomUUID(),
      title,
      description: desc,
      dueDate,
      type,
      completed: editingReminder?.completed || false,
      recipientName,
      recipientPhone,
    };

    if (editingReminder) onUpdateReminder(newRem); else onAddReminder(newRem);
    setShowAddModal(false);
    setEditingReminder(null);
    setTitle('');
    setDesc('');
    setRecipientName('');
    setRecipientPhone('');
  };

  const handleMessageTrigger = (rem: ReminderItem) => {
    const text = `Hello ${rem.recipientName || 'Client'}, this is a reminder from ${shopProfile.name} regarding: ${rem.title}. Scheduled date: ${rem.dueDate}.`;
    onOpenMessageSender(rem.recipientName || 'Client', rem.recipientPhone || '', text);
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-10 py-6 md:py-8 space-y-6 animate-fadeIn pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline text-2xl md:text-3xl font-bold text-[#211a15] dark:text-white">
            Reminders & Fitting Schedule
          </h1>
          <p className="text-sm text-[#524438] dark:text-[#d7c3b2] mt-0.5">
            Keep track of client trial sessions, payment due dates, and supplier deadlines.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-[#a6681c] hover:bg-[#885000] text-white font-headline text-xs sm:text-sm font-semibold px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-lg shadow-sm flex items-center justify-center gap-1.5 sm:gap-2 active:scale-95 transition-all self-start sm:self-auto shrink-0 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Add Reminder</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
        {[
          { id: 'all', label: 'All Tasks' },
          { id: 'pending', label: 'Incomplete Only' },
          { id: 'fitting', label: 'Fitting Sessions' },
          { id: 'payment_due', label: 'Customer Payments' },
          { id: 'partner_payable', label: 'Supplier Payables' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-headline font-semibold transition-all ${
              filterType === tab.id
                ? 'border border-[#a6681c] bg-[#a6681c]/15 text-[#a6681c] dark:bg-[#a6681c]/30 dark:text-[#ffb86d]'
                : 'border border-[#d7c3b2]/40 text-[#524438] dark:text-[#d7c3b2] hover:bg-[#fff1e7]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Reminders List */}
      <div className="bg-white dark:bg-[#241a13] rounded-xl border border-[#d7c3b2]/20 dark:border-[#524438] shadow-sm divide-y divide-[#d7c3b2]/15 dark:divide-[#524438]/40 overflow-hidden">
        {filteredReminders.length === 0 ? (
          <div className="p-12 text-center text-[#847466]">
            <p className="text-sm">No reminders under this filter.</p>
          </div>
        ) : (
          filteredReminders.map((rem) => (
            <div
              key={rem.id}
              onClick={() => { setEditingReminder(rem); setTitle(rem.title); setDesc(rem.description); setDueDate(rem.dueDate); setType(rem.type); setRecipientName(rem.recipientName || ''); setRecipientPhone(rem.recipientPhone || ''); setShowAddModal(true); }}
              className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                rem.completed
                  ? 'bg-[#fff8f4]/60 dark:bg-[#1a120c] opacity-60'
                  : 'hover:bg-[#fff1e7]/30'
              } cursor-pointer`}
            >
              <div className="flex items-start gap-3.5">
                <button
                  onClick={(event) => { event.stopPropagation(); onToggleReminder(rem.id); }}
                  className={`mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                    rem.completed
                      ? 'bg-green-700 border-green-700 text-white'
                      : 'border-[#847466] hover:border-[#885000]'
                  }`}
                >
                  {rem.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                </button>

                <div>
                  <h4
                    className={`font-headline font-bold text-sm text-[#211a15] dark:text-white ${
                      rem.completed ? 'line-through text-[#847466]' : ''
                    }`}
                  >
                    {rem.title}
                  </h4>
                  <p className="text-xs text-[#524438] dark:text-[#d7c3b2] mt-0.5">
                    {rem.description}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-[#847466] mt-1.5 font-medium">
                    <span className="flex items-center gap-1 text-rose-500 dark:text-rose-300 font-semibold">
                      <Calendar className="w-3 h-3" /> Due: {rem.dueDate}
                    </span>
                    {rem.recipientName && <span>• {rem.recipientName}</span>}
                    {rem.amount && (
                      <span>
                        • {rem.amount.toLocaleString()} {shopProfile.currency}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                {rem.recipientPhone && (
                  <button
                    onClick={(event) => { event.stopPropagation(); handleMessageTrigger(rem); }}
                    className="px-3 py-1.5 rounded-lg bg-green-50 text-green-800 border border-green-200 hover:bg-green-100 text-xs font-bold flex items-center gap-1.5 transition-all"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-green-700" />
                    <span>Send SMS/WA</span>
                  </button>
                )}

                <button
                  onClick={(event) => { event.stopPropagation(); onDeleteReminder(rem.id); }}
                  className="p-1.5 rounded text-[#847466] hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Reminder Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#fff8f4] dark:bg-[#1c1510] text-[#211a15] dark:text-[#f7ebe1] rounded-xl border border-[#d7c3b2]/30 dark:border-[#524438] shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-[#d7c3b2]/20 dark:border-[#524438] flex justify-between items-center bg-white dark:bg-[#241a13]">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-[#885000] dark:text-[#ffb86d]" />
                <h3 className="font-headline font-bold text-base text-[#211a15] dark:text-white">
                  Add Reminder / Schedule
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
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Sara Tadesse First Fitting"
                  className="w-full px-3 py-2 bg-white dark:bg-[#241a13] border border-[#211a15]/15 dark:border-[#524438] rounded-lg text-sm text-[#211a15] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#885000]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#524438] dark:text-[#d7c3b2] mb-1">
                  Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as ReminderItem['type'])}
                  className="w-full px-3 py-2 bg-white dark:bg-[#241a13] border border-[#211a15]/15 dark:border-[#524438] rounded-lg text-sm text-[#211a15] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#885000]"
                >
                  <option value="fitting">Fitting Session</option>
                  <option value="payment_due">Payment Due Follow-up</option>
                  <option value="partner_payable">Partner Supplier Invoice</option>
                  <option value="delivery">Garment Delivery / Pickup</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#524438] dark:text-[#d7c3b2] mb-1">
                  Due Date *
                </label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-[#241a13] border border-[#211a15]/15 dark:border-[#524438] rounded-lg text-sm text-[#211a15] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#885000]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#524438] dark:text-[#d7c3b2] mb-1">
                    Recipient Name
                  </label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="e.g. Sara Tadesse"
                    className="w-full px-3 py-2 bg-white dark:bg-[#241a13] border border-[#211a15]/15 dark:border-[#524438] rounded-lg text-sm text-[#211a15] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#885000]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#524438] dark:text-[#d7c3b2] mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    placeholder="+251 912 XXX XXX"
                    className="w-full px-3 py-2 bg-white dark:bg-[#241a13] border border-[#211a15]/15 dark:border-[#524438] rounded-lg text-sm text-[#211a15] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#885000]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#524438] dark:text-[#d7c3b2] mb-1">
                  Description Notes
                </label>
                <textarea
                  rows={2}
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Check sleeve length, adjust shoulder darts..."
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
                  Save Reminder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
