import React, { useState, useMemo } from 'react';
import {
  Wallet,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Info,
  Plus,
  ArrowRight,
  Filter,
  Calendar,
  FileSpreadsheet,
  Search,
  X,
  Scissors,
  Shirt,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { Order, PartnerInvoice, ShopProfile } from '../types';

interface DashboardViewProps {
  orders: Order[];
  invoices: PartnerInvoice[];
  shopProfile: ShopProfile;
  onOpenNewOrder: () => void;
  onSelectOrder: (order: Order) => void;
  onNavigateToOrders?: (filter?: string) => void;
  onNavigateToFinances: () => void;
  onNavigateToPartners: () => void;
  onExportExcel?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  orders,
  invoices,
  shopProfile,
  onOpenNewOrder,
  onSelectOrder,
  onNavigateToOrders,
  onNavigateToFinances,
  onNavigateToPartners,
  onExportExcel,
}) => {
  const [showAllOrdersModal, setShowAllOrdersModal] = useState(false);
  const [modalSearchQuery, setModalSearchQuery] = useState('');
  const [modalStatusFilter, setModalStatusFilter] = useState('All');

  // Dynamically calculate metrics based on real orders
  const totalRevenue = orders.reduce((acc, o) => acc + (o.price || 0), 0);
  const totalPaidRevenue = orders.reduce((acc, o) => acc + (o.paid || 0), 0);

  const totalOrderCosts = orders.reduce(
    (acc, o) => acc + (o.costs?.reduce((cAcc, c) => cAcc + (c.amount || 0), 0) || 0),
    0
  );
  const totalInvoiceCosts = invoices.reduce((acc, inv) => acc + (inv.amount || 0), 0);
  const totalCosts = totalOrderCosts + totalInvoiceCosts;
  const netProfit = totalRevenue - totalCosts;

  const pendingPaymentOrders = orders.filter(
    (o) => o.price > o.paid && o.status !== 'Completed'
  );

  const upcomingInvoices = invoices.filter((inv) => inv.status !== 'Paid');

  const filteredModalOrders = useMemo(() => {
    return orders.filter((o) => {
      const q = modalSearchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerPhone.toLowerCase().includes(q) ||
        o.itemType.toLowerCase().includes(q);

      if (!matchesSearch) return false;
      if (modalStatusFilter === 'All') return true;
      if (modalStatusFilter === 'Unpaid') return o.paid < o.price;
      return o.status === modalStatusFilter;
    });
  }, [orders, modalSearchQuery, modalStatusFilter]);

  const openOrdersModalWithFilter = (filter: string = 'All') => {
    if (onNavigateToOrders) {
      onNavigateToOrders(filter);
    } else {
      setModalStatusFilter(filter);
      setModalSearchQuery('');
      setShowAllOrdersModal(true);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Ready':
      case 'Completed':
        return 'bg-emerald-200 text-emerald-900 border-emerald-300';
      case 'Ready for Fitting':
        return 'bg-gray-200 text-gray-900 border-gray-300';
      case 'In Progress':
      case 'In Cutting':
        return 'bg-amber-200 text-amber-900 border-amber-300';
      case 'First Fitting':
        return 'bg-violet-200 text-violet-900 border-violet-300';
      case 'Measurements Taken':
        return 'bg-sky-200 text-sky-900 border-sky-300';
      case 'Confirmed':
      default:
        return 'bg-gray-200 text-gray-900 border-gray-300';
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-10 py-6 md:py-8 space-y-6 md:space-y-8 animate-fadeIn pb-16">
      {/* Page Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline text-2xl md:text-3xl font-bold text-[#211a15] dark:text-white">
            Dashboard
          </h1>
          <p className="text-sm text-[#524438] dark:text-[#d7c3b2] mt-0.5">
            Overview of your atelier's performance, garments, and finances.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto w-full sm:w-auto">
          {onExportExcel && (
            <button
              onClick={onExportExcel}
              className="w-auto flex-none bg-[#15803d] hover:bg-[#166534] dark:bg-[#166534] dark:hover:bg-[#15803d] text-white font-headline font-semibold text-xs sm:text-sm py-2.5 px-3.5 rounded-xl shadow-sm flex items-center justify-center gap-1.5 active:scale-95 transition-all shrink-0 border border-[#166534]"
              title="Export all records as Microsoft Excel spreadsheet (.xlsx)"
            >
              <FileSpreadsheet className="w-4 h-4 text-white" />
              <span>Export Excel</span>
            </button>
          )}

          <button
            onClick={onOpenNewOrder}
            className="w-auto flex-none bg-[#a6681c] hover:bg-[#885000] text-white py-2.5 px-4 rounded-xl font-headline font-bold text-xs sm:text-sm shadow-sm flex items-center justify-center gap-1.5 active:scale-95 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>New Order</span>
          </button>
        </div>
      </div>

      {/* Financial Summary Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {/* Total Revenue Card */}
        <div className="bg-white dark:bg-[#241a13] p-5 sm:p-6 rounded-xl border border-[#d7c3b2]/20 dark:border-[#524438] shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-[#fff1e7] dark:bg-[#33261c] text-[#885000] dark:text-[#ffb86d] flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-green-700 bg-green-50 dark:bg-green-950/40 dark:text-green-400 px-2 py-0.5 rounded">
              Live total
            </span>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#524438] dark:text-[#d7c3b2]">
              Total Revenue
            </p>
            <p className="font-headline text-2xl sm:text-3xl md:text-4xl font-bold text-[#211a15] dark:text-white mt-1">
              {totalRevenue.toLocaleString()}{' '}
              <span className="text-base sm:text-lg font-medium text-[#524438] dark:text-[#d7c3b2]">
                {shopProfile.currency}
              </span>
            </p>
            <p className="text-xs text-[#847466] dark:text-[#a08e80] mt-1">
              Collected: {totalPaidRevenue.toLocaleString()} {shopProfile.currency}
            </p>
          </div>
        </div>

        {/* Total Costs Card */}
        <div className="bg-white dark:bg-[#241a13] p-5 sm:p-6 rounded-xl border border-[#d7c3b2]/20 dark:border-[#524438] shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-[#fff8f4] dark:bg-rose-950/40 text-[#524438] dark:text-rose-400 border border-[#d7c3b2]/40 dark:border-rose-900/40 flex items-center justify-center">
              <TrendingDown className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-[#845411] bg-[#fff1e7] border border-[#fdbd72]/40 px-2 py-0.5 rounded">
              Controlled
            </span>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#524438] dark:text-[#d7c3b2]">
              Total Costs
            </p>
            <p className="font-headline text-2xl sm:text-3xl md:text-4xl font-bold text-[#211a15] dark:text-white mt-1">
              {totalCosts.toLocaleString()}{' '}
              <span className="text-base sm:text-lg font-medium text-[#524438] dark:text-[#d7c3b2]">
                {shopProfile.currency}
              </span>
            </p>
            <p className="text-xs text-[#847466] dark:text-[#a08e80] mt-1">
              Materials, Labor & Overheads
            </p>
          </div>
        </div>

        {/* Net Profit Card */}
        <div className="bg-white dark:bg-[#241a13] p-5 sm:p-6 rounded-xl border-2 border-[#a6681c]/40 shadow-sm relative overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-10 h-10 rounded-full bg-[#fff8f4] text-[#885000] border border-[#d7c3b2]/40 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-900 rounded-full text-xs font-bold border border-emerald-300">
              Healthy
            </span>
          </div>
          <div className="relative z-10">
            <p className="text-xs font-bold uppercase tracking-wider text-[#524438] dark:text-[#d7c3b2]">
              Net Profit
            </p>
            <p className="font-headline text-2xl sm:text-3xl md:text-4xl font-bold text-[#211a15] dark:text-[#ffb86d] mt-1">
              {netProfit.toLocaleString()}{' '}
              <span className="text-base sm:text-lg font-medium text-[#524438] dark:text-[#ffb86d]/70">
                {shopProfile.currency}
              </span>
            </p>
            <p className="text-xs text-green-700 dark:text-green-400 font-semibold mt-1">
              Margin: {totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0}%
            </p>
          </div>
        </div>
      </div>

      {/* Alert Notices */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* Outstanding Customer Payments Alert */}
        <div className="bg-[#fff1e7] dark:bg-[#2a2018] p-4 md:p-5 rounded-xl border border-[#d7c3b2]/30 flex items-start gap-3.5 shadow-sm">
          <div className="p-2 rounded-lg bg-[#fff8f4] dark:bg-rose-950/60 text-rose-500 dark:text-rose-400 border border-[#d7c3b2]/40 dark:border-rose-900/40 shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-headline font-semibold text-sm text-[#211a15] dark:text-white">
              Customer Payments Outstanding
            </h3>
            <p className="text-xs md:text-sm text-[#524438] dark:text-[#d7c3b2] mt-0.5">
              {pendingPaymentOrders.length} bespoke orders pending final settlement or deposit.
            </p>
            <button
              onClick={() => openOrdersModalWithFilter('Unpaid')}
              className="mt-2 inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs md:text-sm font-bold text-[#885000] dark:text-[#ffb86d] hover:text-[#a6681c] hover:bg-[#a6681c]/10 transition-colors"
            >
              Review Outstanding Orders <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Costs Outstanding Alert */}
        <div className="bg-[#fff1e7] dark:bg-[#2a2018] p-4 md:p-5 rounded-xl border border-[#d7c3b2]/30 flex items-start gap-3.5 shadow-sm">
          <div className="p-2 rounded-lg bg-[#fff8f4] dark:bg-amber-950 text-[#845411] dark:text-[#fdbd72] border border-[#d7c3b2]/40 dark:border-amber-900/40 shrink-0 mt-0.5">
            <Info className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-headline font-semibold text-sm text-[#211a15] dark:text-white">
              Costs & Payables Outstanding
            </h3>
            <p className="text-xs md:text-sm text-[#524438] dark:text-[#d7c3b2] mt-0.5">
              {upcomingInvoices.length} partner supplier & rent invoices due in this cycle.
            </p>
            <button
              onClick={onNavigateToPartners}
              className="mt-2 inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs md:text-sm font-bold text-[#885000] dark:text-[#ffb86d] hover:text-[#a6681c] hover:bg-[#a6681c]/10 transition-colors"
            >
              Manage Payables <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Orders Card - Fixed Responsive & Zero-Glitch List */}
        <div className="bg-white dark:bg-[#241a13] rounded-xl border border-[#d7c3b2]/20 dark:border-[#524438] overflow-hidden shadow-sm flex flex-col">
          <div className="p-4 md:p-5 border-b border-[#d7c3b2]/20 bg-[#fff8f4] dark:bg-[#1a120c] flex justify-between items-center">
            <h3 className="font-headline font-bold text-base md:text-lg text-[#211a15] dark:text-white">
              Upcoming Bespoke Garments
            </h3>
            <button
              onClick={() => openOrdersModalWithFilter('All')}
              className="text-xs text-[#885000] dark:text-[#ffb86d] hover:underline font-semibold"
            >
              View All ({orders.length})
            </button>
          </div>

          <div className="divide-y divide-[#d7c3b2]/15 dark:divide-[#524438]/40 flex-1">
            {orders.slice(0, 5).map((order) => (
              <div
                key={order.id}
                onClick={() => onSelectOrder(order)}
                className="p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-[#fff1e7]/50 dark:hover:bg-[#33261c] active:bg-[#fff1e7]/80 dark:active:bg-[#33261c]/80 cursor-pointer transition-colors select-none touch-manipulation w-full min-w-0"
              >
                {/* Left Side: Garment Icon + Client Name + Garment info */}
                <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 bg-[#fff1e7] dark:bg-[#33261c] rounded-xl flex items-center justify-center text-[#885000] dark:text-[#ffb86d] border border-[#d7c3b2]/20 shrink-0">
                    <Shirt className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-headline text-xs sm:text-sm font-bold text-[#211a15] dark:text-white truncate">
                      {order.customerName}
                    </p>
                    <p className="text-[11px] sm:text-xs text-[#524438] dark:text-[#d7c3b2] truncate">
                      {order.itemType} • {order.price.toLocaleString()} {shopProfile.currency}
                    </p>
                  </div>
                </div>

                {/* Right Side: Status Badge & Due Date */}
                <div className="text-right shrink-0 flex flex-col items-end gap-1">
                  <span
                    className={`text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded border whitespace-nowrap ${getStatusBadgeClass(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                  <p className="text-[11px] sm:text-xs text-[#ba1a1a] flex items-center gap-1 font-medium whitespace-nowrap">
                    <Calendar className="w-3 h-3 shrink-0" /> Due: {order.dueDate}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-[#fff8f4] dark:bg-[#1a120c] border-t border-[#d7c3b2]/20 text-center">
            <button
              onClick={() => openOrdersModalWithFilter('All')}
              className="text-xs font-bold text-[#885000] dark:text-[#ffb86d] hover:underline"
            >
              Browse All {orders.length} Garments
            </button>
          </div>
        </div>

        {/* Upcoming Costs & Invoices */}
        <div className="bg-white dark:bg-[#241a13] rounded-xl border border-[#d7c3b2]/20 dark:border-[#524438] overflow-hidden shadow-sm flex flex-col">
          <div className="p-4 md:p-5 border-b border-[#d7c3b2]/20 bg-[#fff8f4] dark:bg-[#1a120c] flex justify-between items-center">
            <h3 className="font-headline font-bold text-base md:text-lg text-[#211a15] dark:text-white">
              Upcoming Costs & Payables
            </h3>
            <button
              onClick={onNavigateToPartners}
              className="text-xs text-[#885000] dark:text-[#ffb86d] hover:underline font-semibold"
            >
              Manage
            </button>
          </div>

          <div className="divide-y divide-[#d7c3b2]/15 dark:divide-[#524438]/40 flex-1">
            {invoices.map((inv) => (
              <div
                key={inv.id}
                className="p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-[#fff1e7]/50 dark:hover:bg-[#33261c] transition-colors select-none touch-manipulation w-full min-w-0"
              >
                <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-full bg-[#f3e6dc] dark:bg-[#33261c] flex items-center justify-center text-[#524438] dark:text-[#d7c3b2] border border-[#d7c3b2]/30 shrink-0">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-headline text-xs sm:text-sm font-bold text-[#211a15] dark:text-white truncate">
                      {inv.partnerName}
                    </p>
                    <p className="text-[11px] sm:text-xs text-[#524438] dark:text-[#d7c3b2] truncate">
                      {inv.title} • {inv.invoiceNumber}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="font-mono text-xs sm:text-sm font-bold text-[#211a15] dark:text-white">
                    {inv.amount.toLocaleString()} {shopProfile.currency}
                  </p>
                  <p
                    className={`text-[11px] sm:text-xs mt-0.5 font-medium whitespace-nowrap ${
                      inv.status === 'Due Tomorrow' || inv.status === 'Overdue'
                        ? 'text-[#ba1a1a]'
                        : 'text-[#524438] dark:text-[#d7c3b2]'
                    }`}
                  >
                    {inv.status} ({inv.dueDate})
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-[#fff8f4] dark:bg-[#1a120c] border-t border-[#d7c3b2]/20 text-center">
            <button
              onClick={onNavigateToFinances}
              className="text-xs font-bold text-[#885000] dark:text-[#ffb86d] hover:underline"
            >
              Open Financial Analytics
            </button>
          </div>
        </div>
      </div>

      {/* Embedded All Orders Modal (Clean, Instant, No Separate Screen) */}
      {showAllOrdersModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#150f0b]/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#fff8f4] dark:bg-[#1f1610] text-[#211a15] dark:text-[#f7ebe1] rounded-2xl border border-[#d7c3b2]/30 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-[#d7c3b2]/20 flex justify-between items-center bg-white dark:bg-[#241a13]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#a6681c]/15 text-[#885000] dark:text-[#ffb86d] flex items-center justify-center">
                  <Scissors className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-headline text-lg sm:text-xl font-bold text-[#211a15] dark:text-white">
                    Bespoke Garments & Orders
                  </h2>
                  <p className="text-xs text-[#524438] dark:text-[#d7c3b2]">
                    Select any garment to view measurements, fittings, and payments.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAllOrdersModal(false)}
                className="p-1.5 rounded-full text-[#847466] hover:text-[#885000] dark:hover:text-[#ffb86d] hover:bg-[#ede0d6] dark:hover:bg-[#33261c] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filters Bar */}
            <div className="p-4 bg-white dark:bg-[#241a13] border-b border-[#d7c3b2]/20 flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#847466]" />
                <input
                  type="text"
                  value={modalSearchQuery}
                  onChange={(e) => setModalSearchQuery(e.target.value)}
                  placeholder="Search client, garment, phone..."
                  className="w-full pl-9 pr-3 py-2 bg-[#fff8f4] dark:bg-[#1a120c] border border-[#d7c3b2]/30 rounded-lg text-xs outline-none focus:border-[#a6681c]"
                />
              </div>

              <div className="flex gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 hide-scrollbar">
                {['All', 'Confirmed', 'In Progress', 'In Cutting', 'Ready', 'Completed', 'Unpaid'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setModalStatusFilter(tab)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                      modalStatusFilter === tab
                        ? 'bg-[#885000] text-white'
                        : 'bg-[#fff8f4] dark:bg-[#1a120c] text-[#524438] dark:text-[#d7c3b2] hover:bg-[#ede0d6]'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable Orders List */}
            <div className="flex-1 overflow-y-auto divide-y divide-[#d7c3b2]/15 dark:divide-[#524438]/30">
              {filteredModalOrders.length === 0 ? (
                <div className="p-12 text-center text-sm text-[#847466]">
                  No bespoke orders match the selected filters.
                </div>
              ) : (
                filteredModalOrders.map((order) => (
                  <div
                    key={order.id}
                    onClick={() => {
                      setShowAllOrdersModal(false);
                      onSelectOrder(order);
                    }}
                    className="p-4 flex items-center justify-between gap-3 hover:bg-white dark:hover:bg-[#241a13] cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      <div className="w-11 h-11 bg-[#fff1e7] dark:bg-[#33261c] rounded-xl flex items-center justify-center text-[#885000] dark:text-[#ffb86d] border border-[#d7c3b2]/20 shrink-0">
                        <Shirt className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-headline text-sm font-bold text-[#211a15] dark:text-white truncate">
                          {order.customerName}
                        </p>
                        <p className="text-xs text-[#524438] dark:text-[#d7c3b2] truncate">
                          {order.itemType} • {order.customerPhone}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0 flex flex-col items-end gap-1">
                      <p className="font-mono text-sm font-bold text-[#211a15] dark:text-white">
                        {order.price.toLocaleString()} {shopProfile.currency}
                      </p>
                      <div className="flex items-center gap-2">
                        <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${getStatusBadgeClass(order.status)}`}
                        >
                          {order.status}
                        </span>
                        <span className="text-xs text-[#ba1a1a] flex items-center gap-1 font-medium">
                          <Calendar className="w-3 h-3" /> Due: {order.dueDate}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-white dark:bg-[#241a13] border-t border-[#d7c3b2]/20 flex justify-between items-center">
              <span className="text-xs text-[#847466]">
                Showing {filteredModalOrders.length} of {orders.length} orders
              </span>
              <button
                onClick={() => {
                  setShowAllOrdersModal(false);
                  onOpenNewOrder();
                }}
                className="px-4 py-2 bg-[#885000] hover:bg-[#a6681c] text-white text-xs font-bold rounded-lg flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> New Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
