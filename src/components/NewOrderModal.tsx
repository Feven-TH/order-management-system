import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Plus,
  Calendar,
  DollarSign,
  Ruler,
  Upload,
  Sparkles,
  Scissors,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Customer, Order, OrderMeasurement, PaymentMethod, ShopProfile } from '../types';
import confetti from 'canvas-confetti';

interface NewOrderModalProps {
  isOpen: boolean;
  customers: Customer[];
  shopProfile: ShopProfile;
  preselectedCustomerId?: string | null;
  onClose: () => void;
  onCreateOrder: (newOrder: Order) => void;
  onOpenNewCustomer: () => void;
}

export const NewOrderModal: React.FC<NewOrderModalProps> = ({
  isOpen,
  customers,
  shopProfile,
  preselectedCustomerId,
  onClose,
  onCreateOrder,
  onOpenNewCustomer,
}) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState(
    preselectedCustomerId || customers[0]?.id || ''
  );
  const [itemType, setItemType] = useState('');
  const [price, setPrice] = useState('');
  const [deposit, setDeposit] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Telebirr');
  const [dueDate, setDueDate] = useState('');
  const [description, setDescription] = useState('');

  // Measurement modes
  const [measurementMode, setMeasurementMode] = useState<'reuse' | 'new'>('new');
  const [measurements, setMeasurements] = useState<OrderMeasurement>({});

  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);

  // Sync selectedCustomerId when modal opens or preselectedCustomerId changes
  useEffect(() => {
    if (preselectedCustomerId) {
      setSelectedCustomerId(preselectedCustomerId);
      const targetCustomer = customers.find((c) => c.id === preselectedCustomerId);
      if (targetCustomer && targetCustomer.totalOrders === 0) {
        setMeasurementMode('new');
      }
    } else if (customers.length > 0 && !customers.some((c) => c.id === selectedCustomerId)) {
      setSelectedCustomerId(customers[0].id);
    }
  }, [preselectedCustomerId, customers, isOpen]);

  if (!isOpen) return null;

  const selectedCustomer =
    customers.find((c) => c.id === selectedCustomerId) || customers[0];

  if (!selectedCustomer) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
        <div className="bg-[#fff8f4] dark:bg-[#1c1510] text-[#211a15] dark:text-[#f7ebe1] rounded-xl border border-[#d7c3b2]/30 dark:border-[#524438] shadow-2xl w-full max-w-md overflow-hidden">
          <div className="px-6 py-4 border-b border-[#d7c3b2]/20 dark:border-[#524438] flex justify-between items-center bg-white dark:bg-[#241a13]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#a6681c]/15 text-[#885000] dark:text-[#ffb86d] flex items-center justify-center">
                <Scissors className="w-4 h-4" />
              </div>
              <h2 className="font-headline text-lg font-bold text-[#211a15] dark:text-white">
                Create New Order
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-[#847466] dark:text-[#a08e80] hover:text-[#885000] dark:hover:text-[#ffb86d] hover:bg-[#ede0d6] dark:hover:bg-[#33261c] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div className="rounded-lg border border-[#d7c3b2]/40 dark:border-[#524438] bg-white dark:bg-[#241a13] p-4">
              <p className="font-headline text-base font-bold text-[#211a15] dark:text-white">
                Add a customer first
              </p>
              <p className="mt-1 text-sm text-[#524438] dark:text-[#d7c3b2]">
                Orders need to be attached to a customer profile.
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenNewCustomer}
              className="w-full bg-[#a6681c] hover:bg-[#885000] text-white font-headline text-sm font-semibold py-2.5 px-4 rounded-lg shadow-sm flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>New Customer</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleCustomerSelect = (id: string) => {
    setSelectedCustomerId(id);
    const target = customers.find((c) => c.id === id);
    if (target && target.totalOrders === 0) {
      setMeasurementMode('new');
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedPhotos([...uploadedPhotos, reader.result as string]);
      };
      reader.readAsDataURL(files[0]);
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const orderNum = `#ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const parsedPrice = parseFloat(price) || 0;
    const parsedDeposit = parseFloat(deposit) || 0;

    const newOrder: Order = {
      id: crypto.randomUUID(),
      orderNumber: orderNum,
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      customerPhone: selectedCustomer.phone,
      itemType: itemType,
      price: parsedPrice,
      deposit: parsedDeposit,
      paid: parsedDeposit,
      status: 'Confirmed',
      dueDate: dueDate,
      createdAt: new Date().toISOString().split('T')[0],
      description: description,
      measurements: measurements,
      referencePhotos: uploadedPhotos,
      costs: [],
      paymentLogs:
        parsedDeposit > 0
          ? [
              {
                id: crypto.randomUUID(),
                amount: parsedDeposit,
                method: paymentMethod,
                date: new Date().toISOString().split('T')[0],
                note: 'Initial deposit paid at order placement',
              },
            ]
          : [],
    };

    // Confetti celebration for atelier precision
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#a6681c', '#fdbd72', '#211a15'],
    });

    onCreateOrder(newOrder);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#fff8f4] dark:bg-[#1c1510] text-[#211a15] dark:text-[#f7ebe1] rounded-xl border border-[#d7c3b2]/30 dark:border-[#524438] shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#d7c3b2]/20 dark:border-[#524438] flex justify-between items-center bg-white dark:bg-[#241a13]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#a6681c]/15 text-[#885000] dark:text-[#ffb86d] flex items-center justify-center">
              <Scissors className="w-4 h-4" />
            </div>
            <h2 className="font-headline text-lg md:text-xl font-bold text-[#211a15] dark:text-white">
              Create New Order
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#847466] dark:text-[#a08e80] hover:text-[#885000] dark:hover:text-[#ffb86d] hover:bg-[#ede0d6] dark:hover:bg-[#33261c] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleCreate} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Customer Selection */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold uppercase tracking-wider text-[#524438] dark:text-[#d7c3b2]">
                Select Customer *
              </label>
              <button
                type="button"
                onClick={onOpenNewCustomer}
                className="text-xs font-bold text-[#885000] dark:text-[#ffb86d] hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> New Customer
              </button>
            </div>
            <select
              value={selectedCustomerId}
              onChange={(e) => handleCustomerSelect(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white dark:bg-[#241a13] border border-[#211a15]/15 dark:border-[#524438] rounded-lg text-sm text-[#211a15] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#a6681c] font-medium"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.phone}) - {c.totalOrders === 0 ? '✨ New Client (0 orders)' : `${c.totalOrders} past orders`}
                </option>
              ))}
            </select>

            {selectedCustomer && selectedCustomer.totalOrders === 0 && (
              <div className="flex items-center gap-2 p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 rounded-lg text-xs text-amber-800 dark:text-amber-300">
                <Sparkles className="w-4 h-4 shrink-0 text-[#885000] dark:text-[#ffb86d]" />
                <span>
                  <strong>{selectedCustomer.name}</strong> is a newly registered client. Enter their custom measurements below.
                </span>
              </div>
            )}
          </div>

          {/* Garment Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#524438] dark:text-[#d7c3b2] mb-1">
                Item Type *
              </label>
              <input
                type="text"
                required
                value={itemType}
                onChange={(e) => setItemType(e.target.value)}
                placeholder="e.g. 3-Piece Wool Suit"
                className="w-full px-3 py-2 bg-white dark:bg-[#241a13] border border-[#211a15]/15 dark:border-[#524438] rounded-lg text-sm text-[#211a15] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#a6681c]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#524438] dark:text-[#d7c3b2] mb-1">
                Target Due Date *
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-[#241a13] border border-[#211a15]/15 dark:border-[#524438] rounded-lg text-sm text-[#211a15] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#a6681c]"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#524438] dark:text-[#d7c3b2] mb-1">
              Garment Specifications & Fabric Details
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detail cut style, lapels, lining requests, or customer material..."
              className="w-full px-3 py-2 bg-white dark:bg-[#241a13] border border-[#211a15]/15 dark:border-[#524438] rounded-lg text-sm text-[#211a15] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#a6681c]"
            />
          </div>

          {/* Measurements Section */}
          <div className="bg-white dark:bg-[#241a13] p-4 rounded-xl border border-[#d7c3b2]/30 dark:border-[#524438] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#524438] dark:text-[#d7c3b2]">
                Measurements (cm)
              </label>
              <div className="grid grid-cols-2 sm:flex bg-[#fff1e7] dark:bg-[#33261c] rounded-xl p-1 border border-[#d7c3b2]/30 dark:border-[#524438] text-xs w-full sm:w-auto gap-1">
                <button
                  type="button"
                  onClick={() => setMeasurementMode('reuse')}
                  className={`py-2 px-3 sm:py-1.5 sm:px-3.5 rounded-lg font-bold text-xs transition-all text-center flex items-center justify-center gap-1.5 active:scale-95 ${
                    measurementMode === 'reuse'
                      ? 'bg-[#885000] text-white shadow-xs'
                      : 'text-[#524438] dark:text-[#d7c3b2] hover:text-[#885000] dark:hover:text-[#ffb86d]'
                  }`}
                >
                  <Ruler className="w-3.5 h-3.5" />
                  <span className="truncate">Reuse Previous</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMeasurementMode('new')}
                  className={`py-2 px-3 sm:py-1.5 sm:px-3.5 rounded-lg font-bold text-xs transition-all text-center flex items-center justify-center gap-1.5 active:scale-95 ${
                    measurementMode === 'new'
                      ? 'bg-[#885000] text-white shadow-xs'
                      : 'text-[#524438] dark:text-[#d7c3b2] hover:text-[#885000] dark:hover:text-[#ffb86d]'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="truncate">New Measurements</span>
                </button>
              </div>
            </div>

            {measurementMode === 'reuse' ? (
              selectedCustomer.totalOrders === 0 ? (
                <div className="p-3.5 bg-[#fff8f4] dark:bg-[#1a120c] rounded-lg border border-[#d7c3b2]/30 dark:border-[#524438]/40 text-xs text-[#524438] dark:text-[#d7c3b2] space-y-2">
                  <p className="font-semibold text-[#211a15] dark:text-white">
                    No past orders on file for {selectedCustomer.name}.
                  </p>
                  <p className="text-[#847466] dark:text-[#a08e80]">
                    Please provide custom body measurements for this new piece.
                  </p>
                  <button
                    type="button"
                    onClick={() => setMeasurementMode('new')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#885000] hover:bg-[#6e4000] text-white rounded-lg font-bold text-xs shadow-2xs transition-all active:scale-95"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Enter Custom Measurements</span>
                  </button>
                </div>
              ) : (
                <div className="p-3 bg-[#fff8f4] dark:bg-[#1a120c] rounded-lg border border-[#d7c3b2]/20 dark:border-[#524438]/40 text-xs text-[#524438] dark:text-[#d7c3b2]">
                  <p className="font-semibold text-[#211a15] dark:text-white mb-1">
                    Previous measurements are not connected to customer profiles yet.
                  </p>
                  <p className="text-[#847466] dark:text-[#a08e80]">
                    Enter measurements for this order.
                  </p>
                </div>
              )
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                {['shoulder', 'bust', 'waist', 'hips', 'length', 'sleeve', 'neck', 'inseam'].map(
                  (param) => (
                    <div key={param}>
                      <label className="block text-[10px] uppercase font-bold text-[#847466] dark:text-[#a08e80] mb-0.5">
                        {param}
                      </label>
                      <input
                        type="number"
                        placeholder="cm"
                        value={measurements[param] || ''}
                        onChange={(e) =>
                          setMeasurements({
                            ...measurements,
                            [param]: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full px-2.5 py-1.5 bg-[#fff8f4] dark:bg-[#1a120c] border border-[#d7c3b2]/30 dark:border-[#524438] rounded text-xs font-mono text-[#211a15] dark:text-white outline-none focus:border-[#885000]"
                      />
                    </div>
                  )
                )}
              </div>
            )}
          </div>

          {/* Reference Photos Upload */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#524438] dark:text-[#d7c3b2] mb-1">
              Reference Photos & Fabric Sketches
            </label>
            <div className="flex gap-3 items-center overflow-x-auto pb-1">
              {uploadedPhotos.map((photo, i) => (
                <div
                  key={i}
                  className="w-16 h-16 rounded-lg overflow-hidden border border-[#d7c3b2]/40 dark:border-[#524438] relative group shrink-0"
                >
                  <img src={photo} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() =>
                      setUploadedPhotos(uploadedPhotos.filter((_, idx) => idx !== i))
                    }
                    className="absolute inset-0 bg-red-900/60 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}

              <label className="w-16 h-16 rounded-lg border-2 border-dashed border-[#847466]/40 dark:border-[#a08e80]/40 bg-white dark:bg-[#241a13] hover:border-[#885000] dark:hover:border-[#ffb86d] flex flex-col items-center justify-center cursor-pointer transition-colors shrink-0">
                <Upload className="w-4 h-4 text-[#847466] dark:text-[#a08e80]" />
                <span className="text-[9px] text-[#847466] dark:text-[#a08e80] mt-0.5 font-bold">Add</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Financial & Payment Setup */}
          <div className="bg-[#fff1e7] dark:bg-[#2a2018] p-4 rounded-xl border border-[#d7c3b2]/30 dark:border-[#524438] space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#524438] dark:text-[#d7c3b2]">
              Payment Details ({shopProfile.currency})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#524438] dark:text-[#d7c3b2] mb-1">
                  Total Price ({shopProfile.currency}) *
                </label>
                <input
                  type="number"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-[#241a13] border border-[#211a15]/15 dark:border-[#524438] rounded-lg text-sm font-headline font-bold text-[#211a15] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#885000]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#524438] dark:text-[#d7c3b2] mb-1">
                  Initial Deposit ({shopProfile.currency})
                </label>
                <input
                  type="number"
                  value={deposit}
                  onChange={(e) => setDeposit(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-[#241a13] border border-[#211a15]/15 dark:border-[#524438] rounded-lg text-sm font-headline font-bold text-[#211a15] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#885000]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#524438] dark:text-[#d7c3b2] mb-1.5">
                Payment Method
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['Cash', 'Telebirr', 'CBE', 'Other Bank'] as PaymentMethod[]).map((pm) => (
                  <button
                    key={pm}
                    type="button"
                    onClick={() => setPaymentMethod(pm)}
                    className={`py-2 px-3 rounded-lg text-xs font-headline font-bold border transition-all ${
                      paymentMethod === pm
                        ? 'bg-[#885000] text-white border-[#885000] shadow-sm'
                        : 'bg-white dark:bg-[#241a13] text-[#524438] dark:text-[#d7c3b2] border-[#211a15]/15 dark:border-[#524438] hover:bg-[#fff8f4] dark:hover:bg-[#33261c]'
                    }`}
                  >
                    {pm}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex justify-end gap-3 border-t border-[#d7c3b2]/20 dark:border-[#524438]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg border border-[#211a15]/15 dark:border-[#524438] text-sm font-semibold text-[#524438] dark:text-[#d7c3b2] hover:bg-[#ede0d6] dark:hover:bg-[#33261c] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg bg-[#885000] hover:bg-[#a6681c] text-white text-sm font-headline font-bold shadow-md transition-all active:scale-95"
            >
              Create Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
