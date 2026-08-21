import React, { useState } from 'react';
import {
  Handshake,
  Plus,
  Phone,
  Mail,
  Wallet,
  CheckCircle2,
  DollarSign,
  AlertCircle,
  FileText,
  X,
} from 'lucide-react';
import { Partner, PartnerInvoice, ShopProfile } from '../types';

interface PartnersViewProps {
  partners: Partner[];
  invoices: PartnerInvoice[];
  shopProfile: ShopProfile;
  onAddPartner: (partner: Partner) => void;
  onSettleInvoice: (invoiceId: string) => void;
  onSettlePartnerBalance: (partnerId: string, amount: number) => void;
}

export const PartnersView: React.FC<PartnersViewProps> = ({
  partners,
  invoices,
  shopProfile,
  onAddPartner,
  onSettleInvoice,
  onSettlePartnerBalance,
}) => {
  const [showAddPartnerModal, setShowAddPartnerModal] = useState(false);
  const [newPartnerName, setNewPartnerName] = useState('');
  const [newPartnerType, setNewPartnerType] = useState<Partner['type']>('Fabric Supplier');
  const [newPartnerPhone, setNewPartnerPhone] = useState('');
  const [newPartnerNotes, setNewPartnerNotes] = useState('');

  // Settle balance modal
  const [settlePartner, setSettlePartner] = useState<Partner | null>(null);
  const [settleAmount, setSettleAmount] = useState('');

  const totalOwed = partners.reduce((acc, p) => acc + p.balanceOwed, 0);

  const handleCreatePartner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartnerName) return;

    const partner: Partner = {
      id: `part-${Date.now()}`,
      name: newPartnerName,
      type: newPartnerType,
      phone: newPartnerPhone,
      balanceOwed: 0,
      totalPaid: 0,
      notes: newPartnerNotes,
    };

    onAddPartner(partner);
    setShowAddPartnerModal(false);
    setNewPartnerName('');
    setNewPartnerPhone('');
    setNewPartnerNotes('');
  };

  const handleConfirmSettle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settlePartner) return;
    const amt = parseFloat(settleAmount) || 0;
    if (amt <= 0) return;

    onSettlePartnerBalance(settlePartner.id, amt);
    setSettlePartner(null);
    setSettleAmount('');
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-10 py-6 md:py-8 space-y-6 animate-fadeIn pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline text-2xl md:text-3xl font-bold text-[#211a15] dark:text-white">
            Partners & Sub-Contractors
          </h1>
          <p className="text-sm text-[#524438] dark:text-[#d7c3b2] mt-0.5">
            Manage fabric suppliers, Telafi masters, seamstress workshops, and courier payables.
          </p>
        </div>

        <button
          onClick={() => setShowAddPartnerModal(true)}
          className="bg-[#a6681c] hover:bg-[#885000] text-white font-headline text-xs sm:text-sm font-semibold px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-lg shadow-sm flex items-center justify-center gap-1.5 sm:gap-2 active:scale-95 transition-all self-start sm:self-auto shrink-0 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Add Partner</span>
        </button>
      </div>

      {/* Summary Card */}
      <div className="bg-[#fff1e7] dark:bg-[#2a2018] p-6 rounded-xl border border-[#d7c3b2]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#524438] dark:text-[#d7c3b2]">
            Total Outstanding Payables
          </span>
          <p className="font-headline text-3xl font-bold text-[#ba1a1a] mt-1">
            {totalOwed.toLocaleString()} {shopProfile.currency}
          </p>
          <p className="text-xs text-[#524438] dark:text-[#d7c3b2] mt-0.5">
            Across {partners.length} active trade suppliers & craftsmen
          </p>
        </div>
      </div>

      {/* Invoices List */}
      <div className="bg-white dark:bg-[#241a13] rounded-xl border border-[#d7c3b2]/20 dark:border-[#524438] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#d7c3b2]/20 bg-[#fff8f4] dark:bg-[#1a120c] flex justify-between items-center">
          <h3 className="font-headline font-bold text-base text-[#211a15] dark:text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#885000]" />
            Upcoming Trade Invoices & Rent
          </h3>
        </div>

        <div className="divide-y divide-[#d7c3b2]/15 dark:divide-[#524438]/40">
          {invoices.map((inv) => (
            <div
              key={inv.id}
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#fff1e7]/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#fff1e7] dark:bg-[#33261c] text-[#885000] dark:text-[#ffb86d] flex items-center justify-center font-bold text-xs">
                  {inv.category.slice(0, 3).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-headline font-bold text-sm text-[#211a15] dark:text-white">
                    {inv.title} ({inv.invoiceNumber})
                  </h4>
                  <p className="text-xs text-[#524438] dark:text-[#d7c3b2]">
                    Partner: <span className="font-semibold">{inv.partnerName}</span> • Due:{' '}
                    <span
                      className={`font-semibold ${
                        inv.status === 'Due Tomorrow' || inv.status === 'Overdue'
                          ? 'text-[#ba1a1a]'
                          : 'text-[#524438]'
                      }`}
                    >
                      {inv.dueDate} ({inv.status})
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-auto">
                <span className="font-mono text-sm font-bold text-[#211a15] dark:text-white">
                  {inv.amount.toLocaleString()} {shopProfile.currency}
                </span>

                {inv.status !== 'Paid' ? (
                  <button
                    onClick={() => onSettleInvoice(inv.id)}
                    className="px-3 py-1.5 bg-green-50 text-green-800 border border-green-300 hover:bg-green-100 text-xs font-bold rounded-lg transition-all"
                  >
                    Mark Paid
                  </button>
                ) : (
                  <span className="text-xs text-green-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Paid
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Partners List Grid */}
      <h3 className="font-headline font-bold text-lg text-[#211a15] dark:text-white mt-8 mb-4">
        Registered Craftsmen & Suppliers
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {partners.map((partner) => (
          <div
            key={partner.id}
            className="bg-white dark:bg-[#241a13] border border-[#d7c3b2]/25 dark:border-[#524438] rounded-xl p-5 flex flex-col justify-between hover:shadow-md transition-all shadow-sm"
          >
            <div>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-headline font-bold text-base text-[#211a15] dark:text-white">
                    {partner.name}
                  </h4>
                  <span className="text-xs text-[#885000] dark:text-[#ffb86d] font-semibold">
                    {partner.type}
                  </span>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#fff1e7] dark:bg-[#33261c] text-[#885000] flex items-center justify-center">
                  <Handshake className="w-4 h-4" />
                </div>
              </div>

              {partner.phone && (
                <p className="text-xs text-[#524438] dark:text-[#d7c3b2] flex items-center gap-1.5 my-1.5">
                  <Phone className="w-3 h-3 text-[#885000]" /> {partner.phone}
                </p>
              )}

              {partner.notes && (
                <p className="text-xs text-[#847466] italic bg-[#fff8f4] dark:bg-[#1a120c] p-2 rounded border border-[#d7c3b2]/20 mt-2">
                  {partner.notes}
                </p>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-[#d7c3b2]/20 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#847466] block">
                  Balance Owed
                </span>
                <span
                  className={`font-mono text-sm font-bold ${
                    partner.balanceOwed > 0 ? 'text-[#ba1a1a]' : 'text-green-700'
                  }`}
                >
                  {partner.balanceOwed.toLocaleString()} {shopProfile.currency}
                </span>
              </div>

              {partner.balanceOwed > 0 && (
                <button
                  onClick={() => {
                    setSettlePartner(partner);
                    setSettleAmount(partner.balanceOwed.toString());
                  }}
                  className="px-3 py-1.5 bg-[#885000] text-white text-xs font-bold rounded-lg shadow hover:bg-[#a6681c] transition-all"
                >
                  Settle Balance
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Partner Modal */}
      {showAddPartnerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#fff8f4] dark:bg-[#1c1510] text-[#211a15] dark:text-[#f7ebe1] rounded-xl border border-[#d7c3b2]/30 dark:border-[#524438] shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-[#d7c3b2]/20 dark:border-[#524438] flex justify-between items-center bg-white dark:bg-[#241a13]">
              <div className="flex items-center gap-2">
                <Handshake className="w-5 h-5 text-[#885000] dark:text-[#ffb86d]" />
                <h3 className="font-headline font-bold text-base text-[#211a15] dark:text-white">
                  Add Partner / Craftsman
                </h3>
              </div>
              <button
                onClick={() => setShowAddPartnerModal(false)}
                className="p-1.5 rounded-full text-[#847466] dark:text-[#a08e80] hover:text-[#885000] dark:hover:text-[#ffb86d] hover:bg-[#ede0d6] dark:hover:bg-[#33261c] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePartner} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#524438] dark:text-[#d7c3b2] mb-1">
                  Partner / Business Name *
                </label>
                <input
                  type="text"
                  required
                  value={newPartnerName}
                  onChange={(e) => setNewPartnerName(e.target.value)}
                  placeholder="e.g. Merkato Silk Importers"
                  className="w-full px-3 py-2 bg-white dark:bg-[#241a13] border border-[#211a15]/15 dark:border-[#524438] rounded-lg text-sm text-[#211a15] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#885000]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#524438] dark:text-[#d7c3b2] mb-1">
                  Service Category *
                </label>
                <select
                  value={newPartnerType}
                  onChange={(e) => setNewPartnerType(e.target.value as Partner['type'])}
                  className="w-full px-3 py-2 bg-white dark:bg-[#241a13] border border-[#211a15]/15 dark:border-[#524438] rounded-lg text-sm text-[#211a15] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#885000]"
                >
                  <option value="Fabric Supplier">Fabric Supplier</option>
                  <option value="Telafi / Tailor">Telafi / Hand Craftsman</option>
                  <option value="Assembly / Manufacturing">Assembly Workshop</option>
                  <option value="Delivery">Delivery / Courier</option>
                  <option value="Embroidery">Embroidery & Beading</option>
                  <option value="Workshop Rent">Workshop Rent & Utilities</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#524438] dark:text-[#d7c3b2] mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={newPartnerPhone}
                  onChange={(e) => setNewPartnerPhone(e.target.value)}
                  placeholder="+251 911 XXX XXX"
                  className="w-full px-3 py-2 bg-white dark:bg-[#241a13] border border-[#211a15]/15 dark:border-[#524438] rounded-lg text-sm text-[#211a15] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#885000]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#524438] dark:text-[#d7c3b2] mb-1">
                  Notes
                </label>
                <textarea
                  rows={2}
                  value={newPartnerNotes}
                  onChange={(e) => setNewPartnerNotes(e.target.value)}
                  placeholder="Specialty materials, turnaround time, bank details..."
                  className="w-full px-3 py-2 bg-white dark:bg-[#241a13] border border-[#211a15]/15 dark:border-[#524438] rounded-lg text-sm text-[#211a15] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#885000]"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2.5 border-t border-[#d7c3b2]/20 dark:border-[#524438]">
                <button
                  type="button"
                  onClick={() => setShowAddPartnerModal(false)}
                  className="px-4 py-2 rounded-lg border border-[#211a15]/15 dark:border-[#524438] text-xs font-semibold text-[#524438] dark:text-[#d7c3b2] hover:bg-[#ede0d6] dark:hover:bg-[#33261c] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#885000] hover:bg-[#a6681c] text-white text-xs font-bold shadow-2xs active:scale-95 transition-all"
                >
                  Save Partner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Settle Modal */}
      {settlePartner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#fff8f4] dark:bg-[#1c1510] text-[#211a15] dark:text-[#f7ebe1] rounded-xl border border-[#d7c3b2]/30 dark:border-[#524438] shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-[#d7c3b2]/20 dark:border-[#524438] flex justify-between items-center bg-white dark:bg-[#241a13]">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-[#885000] dark:text-[#ffb86d]" />
                <h3 className="font-headline font-bold text-base text-[#211a15] dark:text-white">
                  Settle Payables: {settlePartner.name}
                </h3>
              </div>
              <button
                onClick={() => setSettlePartner(null)}
                className="p-1.5 rounded-full text-[#847466] dark:text-[#a08e80] hover:text-[#885000] dark:hover:text-[#ffb86d] hover:bg-[#ede0d6] dark:hover:bg-[#33261c] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmSettle} className="p-6 space-y-4">
              <div className="p-3 bg-[#fff1e7] dark:bg-[#2a2018] rounded-lg border border-[#d7c3b2]/30 dark:border-[#524438] text-xs">
                <p className="text-[#524438] dark:text-[#d7c3b2]">
                  Current balance due to <span className="font-semibold text-[#211a15] dark:text-white">{settlePartner.name}</span> is{' '}
                  <span className="font-bold text-[#ba1a1a] dark:text-[#ffb4ab]">
                    {settlePartner.balanceOwed.toLocaleString()} {shopProfile.currency}
                  </span>
                  .
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#524438] dark:text-[#d7c3b2] mb-1">
                  Settlement Amount ({shopProfile.currency}) *
                </label>
                <input
                  type="number"
                  required
                  value={settleAmount}
                  onChange={(e) => setSettleAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-[#241a13] border border-[#211a15]/15 dark:border-[#524438] rounded-lg text-base font-bold text-[#211a15] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#885000]"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2.5 border-t border-[#d7c3b2]/20 dark:border-[#524438]">
                <button
                  type="button"
                  onClick={() => setSettlePartner(null)}
                  className="px-4 py-2 rounded-lg border border-[#211a15]/15 dark:border-[#524438] text-xs font-semibold text-[#524438] dark:text-[#d7c3b2] hover:bg-[#ede0d6] dark:hover:bg-[#33261c] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-green-700 hover:bg-green-800 text-white text-xs font-bold shadow-2xs active:scale-95 transition-all"
                >
                  Record Settlement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
