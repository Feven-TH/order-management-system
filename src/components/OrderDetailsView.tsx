import React, { useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  Phone,
  User,
  Scissors,
  Plus,
  DollarSign,
  CreditCard,
  Ruler,
  Image as ImageIcon,
  Share2,
  Printer,
  CheckCircle2,
  Trash2,
  Edit2,
  MessageCircle,
  TrendingUp,
} from 'lucide-react';
import { Order, OrderStatus, ShopProfile } from '../types';

interface OrderDetailsViewProps {
  order: Order;
  shopProfile: ShopProfile;
  onBack: () => void;
  onUpdateOrder: (updated: Order) => void;
  onDeleteOrder: (orderId: string) => void;
  onOpenAddPayment: () => void;
  onOpenAddCost: () => void;
  onOpenPhotoPreview: (photoUrl: string) => void;
  onOpenMessageSender: (recipientName: string, recipientPhone: string, message: string) => void;
}

export const OrderDetailsView: React.FC<OrderDetailsViewProps> = ({
  order,
  shopProfile,
  onBack,
  onUpdateOrder,
  onDeleteOrder,
  onOpenAddPayment,
  onOpenAddCost,
  onOpenPhotoPreview,
  onOpenMessageSender,
}) => {
  const [isEditingMeasurements, setIsEditingMeasurements] = useState(false);
  const [measurementDraft, setMeasurementDraft] = useState(order.measurements || {});
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);

  const statuses: OrderStatus[] = [
    'Confirmed',
    'In Progress',
    'In Cutting',
    'First Fitting',
    'Ready for Fitting',
    'Ready',
    'Completed',
  ];

  const totalCosts = order.costs.reduce((acc, c) => acc + (c.amount || 0), 0);
  const remainingPayment = Math.max(0, order.price - order.paid);
  const orderProfit = order.price - totalCosts;
  const profitMargin = order.price > 0 ? Math.round((orderProfit / order.price) * 100) : 0;

  const handleStatusChange = (newStatus: OrderStatus) => {
    onUpdateOrder({
      ...order,
      status: newStatus,
    });
    setStatusMenuOpen(false);
  };

  const handleSaveMeasurements = () => {
    onUpdateOrder({
      ...order,
      measurements: measurementDraft,
    });
    setIsEditingMeasurements(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        onUpdateOrder({
          ...order,
          referencePhotos: [...(order.referencePhotos || []), reader.result as string],
        });
      };
      reader.readAsDataURL(files[0]);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSendReminder = () => {
    const text = `Hello ${order.customerName}, this is ${shopProfile.name}. We are currently working on your ${order.itemType}. Due date is ${order.dueDate}. Current balance: ${remainingPayment.toLocaleString()} ${shopProfile.currency}.`;
    onOpenMessageSender(order.customerName, order.customerPhone, text);
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-10 py-6 md:py-8 space-y-6 animate-fadeIn pb-16">
      {/* Top Bar / Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#d7c3b2]/20 dark:border-[#524438] pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-lg bg-white dark:bg-[#241a13] border border-[#d7c3b2]/30 text-[#524438] hover:text-[#885000] hover:bg-[#fff1e7] transition-all shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="font-headline text-2xl md:text-3xl font-bold text-[#211a15] dark:text-white">
                {order.customerName}'s {order.itemType}
              </h1>

              {/* Status Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setStatusMenuOpen(!statusMenuOpen)}
                  className="px-3 py-1 bg-[#fdbd72]/30 border border-[#fdbd72] text-[#784a05] dark:text-[#ffb86d] text-xs font-headline font-bold rounded-lg hover:bg-[#fdbd72]/50 transition-all flex items-center gap-1.5"
                >
                  <span>{order.status}</span>
                  <span className="text-[10px]">▼</span>
                </button>

                {statusMenuOpen && (
                  <div className="absolute left-0 mt-2 w-44 bg-white dark:bg-[#241a13] border border-[#d7c3b2]/40 rounded-xl shadow-xl z-50 py-1 divide-y divide-[#d7c3b2]/20">
                    {statuses.map((st) => (
                      <button
                        key={st}
                        onClick={() => handleStatusChange(st)}
                        className={`w-full text-left px-3.5 py-2 text-xs font-semibold hover:bg-[#fff1e7] dark:hover:bg-[#33261c] transition-colors ${
                          order.status === st
                            ? 'text-[#885000] font-bold bg-[#fff1e7]/60'
                            : 'text-[#524438] dark:text-[#d7c3b2]'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <p className="text-xs text-[#847466] dark:text-[#a08e80] mt-0.5">
              Created on {order.createdAt}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSendReminder}
            className="px-3 py-2 rounded-lg bg-green-50 text-green-800 border border-green-200 hover:bg-green-100 text-xs font-semibold flex items-center gap-1.5 transition-all"
            title="Send WhatsApp / SMS Reminder"
          >
            <MessageCircle className="w-4 h-4 text-green-700" />
            <span className="hidden sm:inline">Message Customer</span>
          </button>
          <button
            onClick={handlePrint}
            className="p-2 rounded-lg bg-white dark:bg-[#241a13] border border-[#d7c3b2]/30 text-[#524438] hover:text-[#885000] text-xs font-semibold flex items-center gap-1 shadow-sm transition-all"
            title="Print Invoice / Cutting Sheet"
          >
            <Printer className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              if (confirm('Are you sure you want to delete this order?')) {
                onDeleteOrder(order.id);
                onBack();
              }
            }}
            className="p-2 rounded-lg bg-white dark:bg-[#241a13] border border-red-200 text-[#ba1a1a] hover:bg-red-50 text-xs font-semibold flex items-center gap-1 shadow-sm transition-all"
            title="Delete Order"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Grid: Left column (Details & Photos & Measurements) | Right column (Finances, Payments, Costs) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-7 space-y-6">
          {/* Customer & Garment Specs Card */}
          <div className="bg-white dark:bg-[#241a13] p-6 rounded-xl border border-[#d7c3b2]/20 dark:border-[#524438] shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#d7c3b2]/20">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-[#fdbd72] text-[#784a05] font-bold flex items-center justify-center text-base">
                  {order.customerName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-headline font-bold text-base text-[#211a15] dark:text-white">
                    {order.customerName}
                  </h3>
                  <p className="text-xs text-[#524438] dark:text-[#d7c3b2] flex items-center gap-1">
                    <Phone className="w-3 h-3 text-[#885000]" /> {order.customerPhone}
                  </p>
                </div>
              </div>

              <div className="flex gap-4 text-xs font-medium">
                <div>
                  <span className="text-[#847466] block">Item Type</span>
                  <span className="font-bold text-[#211a15] dark:text-white">
                    {order.itemType}
                  </span>
                </div>
                <div>
                  <span className="text-[#847466] block">Due Date</span>
                  <span className="font-bold text-[#ba1a1a] flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {order.dueDate}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#524438] dark:text-[#d7c3b2] mb-1">
                Garment Description & Notes
              </h4>
              <p className="text-sm text-[#211a15] dark:text-[#f7ebe1] leading-relaxed bg-[#fff8f4] dark:bg-[#1a120c] p-3.5 rounded-lg border border-[#d7c3b2]/20">
                {order.description || 'No specific tailoring description provided.'}
              </p>
            </div>
          </div>

          {/* Reference Photos Gallery */}
          <div className="bg-white dark:bg-[#241a13] p-6 rounded-xl border border-[#d7c3b2]/20 dark:border-[#524438] shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-[#885000]" />
                <h3 className="font-headline font-bold text-base text-[#211a15] dark:text-white">
                  Reference Photos & Sketches
                </h3>
              </div>
              <label className="cursor-pointer text-xs font-bold text-[#885000] dark:text-[#ffb86d] hover:underline flex items-center gap-1">
                <Plus className="w-3.5 h-3.5" /> Add Photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {order.referencePhotos && order.referencePhotos.length > 0 ? (
                order.referencePhotos.map((photo, idx) => (
                  <div
                    key={idx}
                    onClick={() => onOpenPhotoPreview(photo)}
                    className="group relative aspect-square rounded-lg overflow-hidden border border-[#d7c3b2]/30 cursor-pointer shadow-sm hover:border-[#885000] transition-all"
                  >
                    <img
                      src={photo}
                      alt={`Reference ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium">
                      Click to expand
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-8 text-center border-2 border-dashed border-[#d7c3b2]/30 rounded-lg bg-[#fff8f4] dark:bg-[#1a120c]">
                  <ImageIcon className="w-8 h-8 mx-auto text-[#847466] mb-1" />
                  <p className="text-xs text-[#524438] dark:text-[#d7c3b2]">
                    No reference photos attached.
                  </p>
                  <label className="mt-2 inline-block text-xs font-bold text-[#885000] cursor-pointer hover:underline">
                    Upload garment sketch or fabric swatch
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Measurements Card with Technical Mannequin */}
          <div className="bg-white dark:bg-[#241a13] p-6 rounded-xl border border-[#d7c3b2]/20 dark:border-[#524438] shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Ruler className="w-5 h-5 text-[#885000]" />
                <h3 className="font-headline font-bold text-base text-[#211a15] dark:text-white">
                  Client Measurements (cm)
                </h3>
              </div>

              {isEditingMeasurements ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsEditingMeasurements(false)}
                    className="text-xs text-[#847466] hover:underline"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveMeasurements}
                    className="text-xs font-bold bg-[#885000] text-white px-3 py-1 rounded"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditingMeasurements(true)}
                  className="text-xs font-bold text-[#885000] dark:text-[#ffb86d] hover:underline flex items-center gap-1"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
              {/* Measurements values */}
              <div className="sm:col-span-8 grid grid-cols-2 gap-3">
                {Object.entries(
                  order.measurements || {
                    shoulder: 38,
                    bust: 92,
                    waist: 70,
                    hips: 98,
                    length: 145,
                  }
                ).map(([key, val]) => (
                  <div
                    key={key}
                    className="p-2.5 bg-[#fff8f4] dark:bg-[#1a120c] rounded-lg border border-[#d7c3b2]/20 flex items-center justify-between"
                  >
                    <span className="text-xs uppercase font-medium text-[#524438] dark:text-[#d7c3b2]">
                      {key}
                    </span>
                    {isEditingMeasurements ? (
                      <input
                        type="number"
                        value={measurementDraft[key] || ''}
                        onChange={(e) =>
                          setMeasurementDraft({
                            ...measurementDraft,
                            [key]: Number(e.target.value),
                          })
                        }
                        className="w-16 px-1.5 py-0.5 text-right font-mono text-sm bg-white dark:bg-[#241a13] border border-[#885000] rounded"
                      />
                    ) : (
                      <span className="font-mono text-sm font-bold text-[#211a15] dark:text-white">
                        {val} <span className="text-[11px] font-normal text-[#847466]">cm</span>
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Mannequin Illustration */}
              <div className="sm:col-span-4 flex flex-col items-center justify-center p-3 bg-[#fff1e7]/40 dark:bg-[#33261c]/40 rounded-xl border border-[#d7c3b2]/20">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuB5BIT7CC_qvVC82I86IJ69KqgUwV5AgdRNVZhhYXYP3-JJ48t-Nj9rzEhzf5nHDigq1IMgxiTLbu77t_V0jnVfSIn_0hcxSPdee5lTgSuBy8aiQwoTR3qpOZ026gsBbHS6bo3M-C2z6AssUomXYHaW5Ag4l7nRjUVVesKPJYegxTU0Xi-lZO7Ev8-hlNufK122M_8ejSHanvuPtjGgjc8_2G0dxEvPuDzNLt7BDcIfX3H-vN2FBI22iw"
                  alt="Tailor silhouette guide"
                  className="w-24 h-auto object-contain mix-blend-multiply dark:mix-blend-normal opacity-80"
                />
                <span className="text-[10px] text-[#847466] font-mono mt-1">
                  Bespoke Body Map
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Financials, Payments, Costs */}
        <div className="lg:col-span-5 space-y-6">
          {/* Payment & Settlement Card */}
          <div className="bg-white dark:bg-[#241a13] p-5 sm:p-6 rounded-xl border border-[#d7c3b2]/20 dark:border-[#524438] shadow-sm space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <CreditCard className="w-5 h-5 text-[#885000] shrink-0" />
                <h3 className="font-headline font-bold text-base text-[#211a15] dark:text-white truncate">
                  Payment Status
                </h3>
              </div>
              <button
                onClick={onOpenAddPayment}
                className="px-3 py-1.5 bg-[#fff1e7] dark:bg-[#33261c] hover:bg-[#ede0d6] dark:hover:bg-[#423225] text-[#885000] dark:text-[#ffb86d] border border-[#d7c3b2]/60 dark:border-[#524438] text-xs font-bold rounded-lg shadow-2xs flex items-center gap-1.5 active:scale-95 transition-all shrink-0 whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Record Payment</span>
              </button>
            </div>

            {/* Balances breakdown */}
            <div className="grid grid-cols-3 gap-2 text-center p-3 bg-[#fff8f4] dark:bg-[#1a120c] rounded-xl border border-[#d7c3b2]/20">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#847466]">Total</span>
                <p className="font-headline font-bold text-sm md:text-base text-[#211a15] dark:text-white">
                  {order.price.toLocaleString()}
                </p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#847466]">Paid</span>
                <p className="font-headline font-bold text-sm md:text-base text-green-700 dark:text-green-400">
                  {order.paid.toLocaleString()}
                </p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#847466]">Remaining</span>
                <p
                  className={`font-headline font-bold text-sm md:text-base ${
                    remainingPayment > 0
                      ? 'text-[#ba1a1a]'
                      : 'text-green-700 dark:text-green-400'
                  }`}
                >
                  {remainingPayment.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Payment history list */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#524438] dark:text-[#d7c3b2] mb-2">
                Transaction Logs
              </h4>
              {order.paymentLogs && order.paymentLogs.length > 0 ? (
                <div className="space-y-2">
                  {order.paymentLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between p-2.5 bg-white dark:bg-[#2a2018] rounded-lg border border-[#d7c3b2]/20 text-xs"
                    >
                      <div>
                        <span className="font-bold text-[#211a15] dark:text-white">
                          {log.amount.toLocaleString()} {shopProfile.currency}
                        </span>
                        <span className="text-[#847466] ml-2">via {log.method}</span>
                        {log.note && <p className="text-[11px] text-[#524438]">{log.note}</p>}
                      </div>
                      <span className="text-[#847466] font-mono text-[11px]">{log.date}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-4 text-center border border-dashed border-[#d7c3b2]/30 rounded-lg">
                  <p className="text-xs text-[#847466]">No payments logged yet.</p>
                  <button
                    onClick={onOpenAddPayment}
                    className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#fff1e7] dark:bg-[#33261c] hover:bg-[#ede0d6] dark:hover:bg-[#423225] text-[#885000] dark:text-[#ffb86d] border border-[#d7c3b2]/60 dark:border-[#524438] text-xs font-bold rounded-lg shadow-2xs active:scale-95 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Record First Payment</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Costs & Labor Card */}
          <div className="bg-white dark:bg-[#241a13] p-5 sm:p-6 rounded-xl border border-[#d7c3b2]/20 dark:border-[#524438] shadow-sm space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Scissors className="w-5 h-5 text-[#885000] shrink-0" />
                <h3 className="font-headline font-bold text-base text-[#211a15] dark:text-white truncate">
                  Costs & Labor
                </h3>
              </div>
              <button
                onClick={onOpenAddCost}
                className="px-3 py-1.5 bg-[#fff1e7] dark:bg-[#33261c] hover:bg-[#ede0d6] dark:hover:bg-[#423225] text-[#885000] dark:text-[#ffb86d] border border-[#d7c3b2]/60 dark:border-[#524438] text-xs font-bold rounded-lg shadow-2xs flex items-center gap-1.5 active:scale-95 transition-all shrink-0 whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Cost</span>
              </button>
            </div>

            {order.costs && order.costs.length > 0 ? (
              <div className="space-y-2">
                {order.costs.map((cost) => (
                  <div
                    key={cost.id}
                    className="p-3 bg-[#fff8f4] dark:bg-[#1a120c] rounded-lg border border-[#d7c3b2]/20 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-headline font-bold text-xs text-[#211a15] dark:text-white">
                        {cost.item || cost.costType}
                      </span>
                      {cost.partnerName && (
                        <span className="text-[11px] text-[#524438] dark:text-[#d7c3b2] block">
                          Partner: {cost.partnerName}
                        </span>
                      )}
                      {cost.notes && (
                        <span className="text-[10px] text-[#847466] block">{cost.notes}</span>
                      )}
                    </div>

                    <div className="text-right">
                      <span className="font-mono text-xs font-bold text-[#211a15] dark:text-white">
                        {cost.amount.toLocaleString()} {shopProfile.currency}
                      </span>
                      <span
                        className={`text-[10px] block font-semibold ${
                          cost.status === 'Paid'
                            ? 'text-green-700'
                            : cost.status === 'Partially Paid'
                            ? 'text-[#845411]'
                            : 'text-[#ba1a1a]'
                        }`}
                      >
                        {cost.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-4 text-center border border-dashed border-[#d7c3b2]/30 rounded-lg">
                <p className="text-xs text-[#847466]">No labor or materials costs entered.</p>
                <button
                  onClick={onOpenAddCost}
                  className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#fff1e7] dark:bg-[#33261c] hover:bg-[#ede0d6] dark:hover:bg-[#423225] text-[#885000] dark:text-[#ffb86d] border border-[#d7c3b2]/60 dark:border-[#524438] text-xs font-bold rounded-lg shadow-2xs active:scale-95 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Material / Telafi Cost</span>
                </button>
              </div>
            )}
          </div>

          {/* Profitability Summary Bento Card */}
          <div className="bg-[#fff1e7] dark:bg-[#2a2018] p-6 rounded-xl border border-[#d7c3b2]/30 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#524438] dark:text-[#d7c3b2]">
                Piece Profitability
              </span>
              <span className="px-2 py-0.5 bg-green-100 text-green-900 text-[11px] font-bold rounded">
                {profitMargin}% Margin
              </span>
            </div>

            <div className="flex justify-between items-baseline">
              <span className="text-sm text-[#524438] dark:text-[#d7c3b2]">Net Profit:</span>
              <span className="font-headline text-2xl font-bold text-[#885000] dark:text-[#ffb86d]">
                {orderProfit.toLocaleString()} {shopProfile.currency}
              </span>
            </div>

            <div className="pt-2 border-t border-[#d7c3b2]/20 flex justify-between text-xs text-[#847466]">
              <span>Revenue: {order.price.toLocaleString()}</span>
              <span>Total Cost: {totalCosts.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
