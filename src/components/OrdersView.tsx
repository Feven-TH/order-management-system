import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Calendar,
  Shirt,
  CheckCircle2,
  Clock,
  Filter,
  ArrowUpDown,
  SlidersHorizontal,
  ChevronDown,
  LayoutGrid,
  List as ListIcon,
  Phone,
  MessageSquare,
  AlertTriangle,
  DollarSign,
  FileSpreadsheet,
  Printer,
  Sparkles,
  Scissors,
  Check,
  Eye,
  RefreshCw,
  X,
} from 'lucide-react';
import { Order, OrderStatus, PaymentStatus, ShopProfile } from '../types';
import * as XLSX from 'xlsx';

interface OrdersViewProps {
  orders: Order[];
  shopProfile: ShopProfile;
  onOpenNewOrder: () => void;
  onSelectOrder: (order: Order) => void;
  onUpdateOrderStatus?: (orderId: string, newStatus: OrderStatus) => void;
  onOpenMessageSender?: (recipient: { name: string; phone: string; context?: string }) => void;
  initialFilter?: string;
}

type SortOption =
  | 'dueDate_asc'
  | 'dueDate_desc'
  | 'createdAt_desc'
  | 'createdAt_asc'
  | 'price_desc'
  | 'price_asc'
  | 'balance_desc'
  | 'customer_asc'
  | 'customer_desc'
  | 'status_workflow';

export const OrdersView: React.FC<OrdersViewProps> = ({
  orders,
  shopProfile,
  onOpenNewOrder,
  onSelectOrder,
  onUpdateOrderStatus,
  onOpenMessageSender,
  initialFilter = 'All',
}) => {
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(
    initialFilter === 'All Orders' || initialFilter === 'Unpaid' ? 'All' : initialFilter
  );
  const [paymentFilter, setPaymentFilter] = useState<string>(
    initialFilter === 'Unpaid' ? 'Unpaid' : 'All'
  );
  const [urgencyFilter, setUrgencyFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<SortOption>('dueDate_asc');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  // Status Workflow order for priority sorting
  const workflowOrder: Record<OrderStatus, number> = {
    'Confirmed': 1,
    'Measurements Taken': 2,
    'In Cutting': 3,
    'First Fitting': 4,
    'In Progress': 5,
    'Ready for Fitting': 6,
    'Ready': 7,
    'Completed': 8,
  };

  const statusTabs: { label: string; value: string }[] = [
    { label: 'All', value: 'All' },
    { label: 'Needs attention', value: 'Needs attention' },
    { label: 'In progress', value: 'In progress' },
    { label: 'Ready', value: 'Ready' },
    { label: 'Completed', value: 'Completed' },
  ];

  const inProgressStatuses: OrderStatus[] = [
    'Confirmed',
    'Measurements Taken',
    'In Cutting',
    'First Fitting',
    'In Progress',
    'Ready for Fitting',
  ];

  // Helper to determine due date urgency
  const getDueUrgency = (dueDateStr: string) => {
    if (!dueDateStr) return { label: 'No Date', type: 'normal', days: 999 };
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDateStr);
    due.setHours(0, 0, 0, 0);

    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { label: `Overdue by ${Math.abs(diffDays)}d`, type: 'overdue', days: diffDays };
    }
    if (diffDays === 0) {
      return { label: 'Due Today', type: 'today', days: 0 };
    }
    if (diffDays === 1) {
      return { label: 'Due Tomorrow', type: 'tomorrow', days: 1 };
    }
    if (diffDays <= 7) {
      return { label: `Due in ${diffDays} days`, type: 'this_week', days: diffDays };
    }
    return { label: `Due in ${diffDays} days`, type: 'normal', days: diffDays };
  };

  // Filter and sort computation
  const filteredAndSortedOrders = useMemo(() => {
    let result = orders.filter((order) => {
      // Search matching
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        order.orderNumber.toLowerCase().includes(query) ||
        order.customerName.toLowerCase().includes(query) ||
        order.customerPhone.toLowerCase().includes(query) ||
        order.itemType.toLowerCase().includes(query) ||
        (order.description && order.description.toLowerCase().includes(query)) ||
        (order.notes && order.notes.toLowerCase().includes(query));

      if (!matchesSearch) return false;

      // Status navigation groups the detailed workflow into a few calm, scannable views.
      if (statusFilter === 'Needs attention') {
        if (order.status === 'Completed' || getDueUrgency(order.dueDate).type !== 'overdue') return false;
      } else if (statusFilter === 'In progress') {
        if (!inProgressStatuses.includes(order.status)) return false;
      } else if (statusFilter !== 'All' && order.status !== statusFilter) {
        return false;
      }

      // Payment filter
      if (paymentFilter === 'Fully Paid' && order.paid < order.price) return false;
      if (paymentFilter === 'Partially Paid' && (order.paid === 0 || order.paid >= order.price)) return false;
      if (paymentFilter === 'Unpaid' && order.paid > 0) return false;
      if (paymentFilter === 'Has Balance' && order.paid >= order.price) return false;

      // Urgency filter
      if (urgencyFilter !== 'All') {
        const urgency = getDueUrgency(order.dueDate);
        if (urgencyFilter === 'Overdue' && urgency.type !== 'overdue') return false;
        if (urgencyFilter === 'Today / Tomorrow' && urgency.type !== 'today' && urgency.type !== 'tomorrow') return false;
        if (urgencyFilter === 'This Week' && urgency.days > 7) return false;
        if (urgencyFilter === 'Active (Not Completed)' && order.status === 'Completed') return false;
      }

      return true;
    });

    // Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'dueDate_asc':
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case 'dueDate_desc':
          return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
        case 'createdAt_desc':
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        case 'createdAt_asc':
          return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
        case 'price_desc':
          return b.price - a.price;
        case 'price_asc':
          return a.price - b.price;
        case 'balance_desc':
          return (b.price - b.paid) - (a.price - a.paid);
        case 'customer_asc':
          return a.customerName.localeCompare(b.customerName);
        case 'customer_desc':
          return b.customerName.localeCompare(a.customerName);
        case 'status_workflow':
          return (workflowOrder[a.status] || 99) - (workflowOrder[b.status] || 99);
        default:
          return 0;
      }
    });

    return result;
  }, [orders, searchQuery, statusFilter, paymentFilter, urgencyFilter, sortBy]);

  const ordersByDueDate = useMemo(() => {
    return [...filteredAndSortedOrders].sort((a, b) => {
      const aDueDate = a.dueDate ? new Date(a.dueDate).getTime() : Number.POSITIVE_INFINITY;
      const bDueDate = b.dueDate ? new Date(b.dueDate).getTime() : Number.POSITIVE_INFINITY;
      return aDueDate - bDueDate;
    });
  }, [filteredAndSortedOrders]);

  // Key Metric Aggregations
  const stats = useMemo(() => {
    const totalCount = orders.length;
    const inProduction = orders.filter(
      (o) => o.status !== 'Completed' && o.status !== 'Ready'
    ).length;
    const readyForPickup = orders.filter((o) => o.status === 'Ready').length;
    const overdueCount = orders.filter(
      (o) => o.status !== 'Completed' && getDueUrgency(o.dueDate).type === 'overdue'
    ).length;
    const totalRevenue = orders.reduce((sum, o) => sum + o.price, 0);
    const totalCollected = orders.reduce((sum, o) => sum + o.paid, 0);
    const totalPendingCollection = Math.max(0, totalRevenue - totalCollected);

    return {
      totalCount,
      inProduction,
      readyForPickup,
      overdueCount,
      totalRevenue,
      totalCollected,
      totalPendingCollection,
    };
  }, [orders]);

  // Export orders list to Excel
  const handleExportOrdersExcel = () => {
    const exportData = ordersByDueDate.map((o) => ({
      'Order #': o.orderNumber,
      'Customer Name': o.customerName,
      'Phone': o.customerPhone,
      'Garment / Item': o.itemType,
      'Status': o.status,
      'Due Date': o.dueDate,
      'Price': o.price,
      'Paid': o.paid,
      'Balance Due': Math.max(0, o.price - o.paid),
      'Payment Status': o.paid >= o.price ? 'Fully Paid' : o.paid > 0 ? 'Partially Paid' : 'Unpaid',
      'Created Date': o.createdAt,
      'Notes': o.description || o.notes || '',
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Orders List');
    XLSX.writeFile(wb, `Atelier_Orders_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Print orders list
  const handlePrintList = () => {
    window.print();
  };

  // Helper for Status Badge Styling
  const getStatusBadgeClass = (status: OrderStatus) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-200 text-emerald-900 border-emerald-300';
      case 'Ready':
        return 'bg-emerald-200 text-emerald-900 border-emerald-300';
      case 'Ready for Fitting':
        return 'bg-gray-200 text-gray-900 border-gray-300';
      case 'First Fitting':
        return 'bg-violet-200 text-violet-900 border-violet-300';
      case 'In Cutting':
        return 'bg-amber-200 text-amber-900 border-amber-300';
      case 'In Progress':
        return 'bg-amber-200 text-amber-900 border-amber-300';
      case 'Measurements Taken':
        return 'bg-sky-200 text-sky-900 border-sky-300';
      case 'Confirmed':
      default:
        return 'bg-gray-200 text-gray-900 border-gray-300';
    }
  };

  const getDueDateClass = (dueDateStr: string) => {
    return getDueUrgency(dueDateStr).type === 'overdue' ? 'text-red-400' : 'text-gray-400';
  };

  // Payment Badge Helper
  const getPaymentBadge = (order: Order) => {
    const balance = Math.max(0, order.price - order.paid);
    if (order.paid >= order.price) {
      return (
        <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span> Fully Paid
        </span>
      );
    }
    if (order.paid > 0) {
      return (
        <span className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Due: {balance.toLocaleString()} {shopProfile.currency}
        </span>
      );
    }
    return (
      <span className="text-[11px] text-rose-500 dark:text-rose-300 font-semibold flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span> Unpaid ({balance.toLocaleString()})
      </span>
    );
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-10 py-6 md:py-8 space-y-6 animate-fadeIn pb-24">
      {/* Header with Title and Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-headline text-2xl md:text-3xl font-bold text-[#211a15] dark:text-white">
              Bespoke Garment Orders
            </h1>
            <span className="text-xs font-mono font-bold bg-[#ede0d6] dark:bg-[#33261c] text-[#784a05] dark:text-[#ffb86d] px-2.5 py-0.5 rounded-full">
              {ordersByDueDate.length} {ordersByDueDate.length === 1 ? 'Garment' : 'Garments'}
            </span>
          </div>
          <p className="text-sm text-[#524438] dark:text-[#d7c3b2] mt-0.5">
            Manage cutting schedules, fitting appointments, production stages, and receivables.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {/* Export & Print Toolset */}
          <div className="flex items-center bg-white dark:bg-[#241a13] border border-[#d7c3b2]/35 dark:border-[#524438] rounded-xl p-1 shadow-2xs gap-1">
            <button
              onClick={handleExportOrdersExcel}
              title="Export Orders Spreadsheet (.xlsx)"
              className="px-3 py-1.5 bg-[#15803d] hover:bg-[#166534] dark:bg-[#166534] dark:hover:bg-[#15803d] text-white rounded-lg transition-all text-xs font-bold flex items-center gap-1.5 shadow-2xs border border-[#166534]"
            >
              <FileSpreadsheet className="w-4 h-4 text-white" />
              <span className="hidden sm:inline">Excel</span>
            </button>

            <button
              onClick={handlePrintList}
              title="Print Orders Sheet"
              className="px-2.5 py-1.5 hover:bg-[#fff8f4] dark:hover:bg-[#33261c] text-[#524438] dark:text-[#d7c3b2] hover:text-[#885000] dark:hover:text-[#ffb86d] rounded-lg transition-all text-xs font-semibold flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4 text-[#885000] dark:text-[#ffb86d]" />
              <span className="hidden sm:inline">Print</span>
            </button>
          </div>

          {/* Primary Action Button */}
          <button
            onClick={onOpenNewOrder}
            className="bg-[#a6681c] hover:bg-[#885000] text-white font-headline text-xs sm:text-sm font-semibold px-4 py-2 sm:py-2.5 rounded-xl shadow-sm flex items-center justify-center gap-1.5 active:scale-95 transition-all whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>New Order</span>
          </button>
        </div>
      </div>

      {/* Atelier Production Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
        {/* Total Orders Card */}
        <div
          onClick={() => {
            setStatusFilter('All');
            setPaymentFilter('All');
            setUrgencyFilter('All');
          }}
          className="bg-white dark:bg-[#241a13] border border-[#d7c3b2]/30 dark:border-[#524438] rounded-xl p-3.5 sm:p-4 shadow-2xs hover:border-[#a6681c]/60 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-[#847466] dark:text-[#a08e80]">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Orders</span>
            <Shirt className="w-4 h-4 text-[#885000]" />
          </div>
          <p className="text-xl sm:text-2xl font-bold font-headline text-[#211a15] dark:text-white mt-1.5">
            {stats.totalCount}
          </p>
          <span className="text-[11px] text-[#524438] dark:text-[#d7c3b2]">
            {stats.totalRevenue.toLocaleString()} {shopProfile.currency} book value
          </span>
        </div>

        {/* In Production Card */}
        <div
          onClick={() => {
            setStatusFilter('All');
            setUrgencyFilter('Active (Not Completed)');
          }}
          className="bg-white dark:bg-[#241a13] border border-[#d7c3b2]/30 dark:border-[#524438] rounded-xl p-3.5 sm:p-4 shadow-2xs hover:border-[#a6681c]/60 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-[#847466] dark:text-[#a08e80]">
            <span className="text-xs font-semibold uppercase tracking-wider">In Production</span>
            <Scissors className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-xl sm:text-2xl font-bold font-headline text-[#a6681c] dark:text-[#ffb86d] mt-1.5">
            {stats.inProduction}
          </p>
          <span className="text-[11px] text-[#524438] dark:text-[#d7c3b2]">
            Cutting, sewing & fittings
          </span>
        </div>

        {/* Ready for Pickup Card */}
        <div
          onClick={() => {
            setStatusFilter('Ready');
          }}
          className="bg-white dark:bg-[#241a13] border border-[#d7c3b2]/30 dark:border-[#524438] rounded-xl p-3.5 sm:p-4 shadow-2xs hover:border-[#a6681c]/60 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-[#847466] dark:text-[#a08e80]">
            <span className="text-xs font-semibold uppercase tracking-wider">Ready for Pickup</span>
            <CheckCircle2 className="w-4 h-4 text-green-600" />
          </div>
          <p className="text-xl sm:text-2xl font-bold font-headline text-green-700 dark:text-green-400 mt-1.5">
            {stats.readyForPickup}
          </p>
          <span className="text-[11px] text-[#524438] dark:text-[#d7c3b2]">
            Awaiting client collection
          </span>
        </div>

        {/* Pending Balance Receivables */}
        <div
          onClick={() => {
            setPaymentFilter('Has Balance');
          }}
          className="bg-white dark:bg-[#241a13] border border-[#d7c3b2]/30 dark:border-[#524438] rounded-xl p-3.5 sm:p-4 shadow-2xs hover:border-[#a6681c]/60 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-[#847466] dark:text-[#a08e80]">
            <span className="text-xs font-semibold uppercase tracking-wider">Unpaid Balances</span>
            <DollarSign className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-xl sm:text-2xl font-bold font-headline text-rose-500 dark:text-rose-300 mt-1.5">
            {stats.totalPendingCollection.toLocaleString()} <span className="text-xs font-normal font-sans text-[#524438] dark:text-[#d7c3b2]">{shopProfile.currency}</span>
          </p>
          <span className="text-[11px] text-[#524438] dark:text-[#d7c3b2]">
            {stats.overdueCount > 0 ? `⚠️ ${stats.overdueCount} orders overdue` : 'Pending collection on delivery'}
          </span>
        </div>
      </div>

      {/* Compact order controls */}
      <section className="space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center gap-2 border-y border-[#d7c3b2]/45 dark:border-[#524438] py-2.5">
          <div className="relative flex-1 min-w-0">
            <Search className="w-4 h-4 absolute left-0 top-1/2 -translate-y-1/2 text-[#847466]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search orders"
              className="w-full bg-transparent pl-7 pr-7 py-1.5 outline-none text-sm text-[#211a15] dark:text-white placeholder:text-[#847466]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-[#847466] hover:text-[#885000] p-1"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 self-end lg:self-auto">
            <button
              onClick={() => setShowFilterDrawer((isOpen) => !isOpen)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                showFilterDrawer || paymentFilter !== 'All' || urgencyFilter !== 'All'
                  ? 'text-[#885000] dark:text-[#ffb86d]'
                  : 'text-[#524438] dark:text-[#d7c3b2] hover:text-[#885000]'
              }`}
              aria-expanded={showFilterDrawer}
            >
              <Filter className="w-3.5 h-3.5" />
              Filters
            </button>

            <div className="flex items-center gap-1 border-l border-[#d7c3b2]/45 dark:border-[#524438] pl-2.5">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#847466] shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="max-w-40 bg-transparent text-xs font-semibold text-[#524438] dark:text-[#d7c3b2] outline-none cursor-pointer"
                aria-label="Sort orders"
              >
                <option value="dueDate_asc">Due date</option>
                <option value="dueDate_desc">Due date, latest</option>
                <option value="createdAt_desc">Newest first</option>
                <option value="createdAt_asc">Oldest first</option>
                <option value="price_desc">Value, high to low</option>
                <option value="price_asc">Value, low to high</option>
                <option value="balance_desc">Balance due</option>
                <option value="customer_asc">Customer, A–Z</option>
                <option value="customer_desc">Customer, Z–A</option>
                <option value="status_workflow">Workflow stage</option>
              </select>
            </div>

            <div className="flex items-center border-l border-[#d7c3b2]/45 dark:border-[#524438] pl-1.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 transition-colors ${viewMode === 'grid' ? 'text-[#885000] dark:text-[#ffb86d]' : 'text-[#847466] hover:text-[#885000]'}`}
                title="Grid view"
                aria-label="Grid view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 transition-colors ${viewMode === 'table' ? 'text-[#885000] dark:text-[#ffb86d]' : 'text-[#847466] hover:text-[#885000]'}`}
                title="Table view"
                aria-label="Table view"
              >
                <ListIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {showFilterDrawer && (
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[#524438] dark:text-[#d7c3b2]">
            <label className="flex items-center gap-2">
              <span className="text-[#847466]">Payment</span>
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="bg-transparent border-b border-[#d7c3b2]/60 dark:border-[#524438] py-1 font-semibold outline-none"
              >
                <option value="All">Any payment</option>
                <option value="Fully Paid">Fully paid</option>
                <option value="Partially Paid">Partially paid</option>
                <option value="Unpaid">Unpaid</option>
                <option value="Has Balance">Has balance</option>
              </select>
            </label>
            <label className="flex items-center gap-2">
              <span className="text-[#847466]">Urgency</span>
              <select
                value={urgencyFilter}
                onChange={(e) => setUrgencyFilter(e.target.value)}
                className="bg-transparent border-b border-[#d7c3b2]/60 dark:border-[#524438] py-1 font-semibold outline-none"
              >
                <option value="All">Any due date</option>
                <option value="Overdue">Overdue</option>
                <option value="Today / Tomorrow">Today or tomorrow</option>
                <option value="This Week">This week</option>
              </select>
            </label>
          </div>
        )}

        {(paymentFilter !== 'All' || urgencyFilter !== 'All') && (
          <div className="flex flex-wrap items-center gap-1.5">
            {paymentFilter !== 'All' && (
              <button
                onClick={() => setPaymentFilter('All')}
                className="inline-flex items-center gap-1 rounded-md bg-[#f3ede4] dark:bg-[#33261c] px-2 py-1 text-[11px] font-medium text-[#524438] dark:text-[#d7c3b2] hover:text-[#885000]"
              >
                Payment: {paymentFilter} <X className="w-3 h-3" />
              </button>
            )}
            {urgencyFilter !== 'All' && (
              <button
                onClick={() => setUrgencyFilter('All')}
                className="inline-flex items-center gap-1 rounded-md bg-[#f3ede4] dark:bg-[#33261c] px-2 py-1 text-[11px] font-medium text-[#524438] dark:text-[#d7c3b2] hover:text-[#885000]"
              >
                Urgency: {urgencyFilter} <X className="w-3 h-3" />
              </button>
            )}
          </div>
        )}

        <nav className="flex items-center gap-5 overflow-x-auto border-b border-[#d7c3b2]/45 dark:border-[#524438] hide-scrollbar" aria-label="Order status">
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`whitespace-nowrap border-b-2 py-2 text-sm font-medium transition-colors ${
                statusFilter === tab.value
                  ? 'border-amber-600 text-[#211a15] dark:text-white'
                  : 'border-transparent text-[#847466] hover:text-[#524438] dark:hover:text-[#d7c3b2]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </section>

      {/* Orders List View (Grid Cards vs Table) */}
              {ordersByDueDate.length === 0 ? (
        <div className="bg-white dark:bg-[#241a13] border border-dashed border-[#d7c3b2]/40 dark:border-[#524438] rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-3 shadow-2xs">
          <div className="w-14 h-14 rounded-full bg-[#fff1e7] dark:bg-[#33261c] flex items-center justify-center text-[#885000]">
            <Shirt className="w-7 h-7" />
          </div>
          <h3 className="font-headline font-bold text-lg text-[#211a15] dark:text-white">
            No matching bespoke garments
          </h3>
          <p className="text-xs text-[#524438] dark:text-[#d7c3b2] max-w-md">
            {searchQuery || statusFilter !== 'All' || paymentFilter !== 'All'
              ? 'No orders matched your chosen filter or search query. Try clearing filters.'
              : 'Start logging your bespoke tailoring, Habesha Kemis, and couture orders.'}
          </p>
          <div className="flex gap-2 mt-2">
            {(searchQuery || statusFilter !== 'All' || paymentFilter !== 'All') && (
              <button
                onClick={() => {
                  setStatusFilter('All');
                  setPaymentFilter('All');
                  setUrgencyFilter('All');
                  setSearchQuery('');
                }}
                className="bg-[#fff8f4] dark:bg-[#1a120c] border border-[#d7c3b2]/40 text-[#524438] dark:text-[#d7c3b2] text-xs font-semibold px-4 py-2 rounded-lg"
              >
                Clear Filters
              </button>
            )}
            <button
              onClick={onOpenNewOrder}
              className="bg-[#a6681c] text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-sm flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Create New Order
            </button>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {ordersByDueDate.map((order) => {
            const urgency = getDueUrgency(order.dueDate);
            const balance = Math.max(0, order.price - order.paid);
            const paymentPercent = Math.min(100, Math.round((order.paid / (order.price || 1)) * 100));

            return (
              <article
                key={order.id}
                className="bg-white dark:bg-[#241a13] border border-[#d7c3b2]/30 dark:border-[#524438] rounded-2xl p-5 flex flex-col justify-between hover:shadow-[0px_6px_24px_rgba(38,15,1,0.08)] cursor-pointer transition-all hover:border-[#a6681c]/60 hover:bg-[#a6681c]/5 group relative overflow-hidden"
                onClick={() => onSelectOrder(order)}
              >
                {/* Top urgency strip if overdue */}
                {urgency.type === 'overdue' && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-rose-400" />
                )}

                <div>
                  {/* Top Bar: Garment Style Badge + Status Badge */}
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center gap-2 flex-wrap min-w-0">
                      <span className="text-xs font-headline font-bold text-[#885000] dark:text-[#ffb86d] bg-[#fff8f4] dark:bg-[#1a120c] px-2.5 py-1 rounded-lg border border-[#d7c3b2]/30 flex items-center gap-1.5">
                        <Shirt className="w-3.5 h-3.5 text-[#885000]" />
                        <span className="truncate">{order.itemType}</span>
                      </span>

                      {urgency.type === 'overdue' ? (
                        <span className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200/60 dark:bg-rose-950/50 dark:border-rose-900/40 px-1.5 py-0.5 rounded flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-rose-500" /> {urgency.label}
                        </span>
                      ) : urgency.type === 'today' ? (
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-100 dark:bg-amber-950/50 px-1.5 py-0.5 rounded">
                          Due Today
                        </span>
                      ) : null}
                    </div>

                    <span
                      className={`text-[11px] font-headline font-semibold px-2.5 py-0.5 rounded-lg border shrink-0 ${getStatusBadgeClass(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </div>

                  {/* Customer details */}
                  <div className="mt-3.5">
                    <h3 className="font-headline text-lg font-bold text-[#211a15] dark:text-white group-hover:text-[#a6681c] transition-colors line-clamp-1">
                      {order.customerName}
                    </h3>
                    <p className="text-xs text-[#847466] dark:text-[#a08e80] flex items-center gap-1.5 mt-0.5">
                      <Phone className="w-3 h-3 text-[#885000]" />
                      <span>{order.customerPhone}</span>
                    </p>
                  </div>

                  {/* Pricing & Schedule Breakdown Card */}
                  <div className="mt-3.5 bg-[#fff8f4] dark:bg-[#1a120c] border border-[#d7c3b2]/25 dark:border-[#524438] rounded-xl p-3 flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-[11px] text-[#847466] dark:text-[#a08e80] flex items-center gap-1 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-[#885000]" /> Due:{' '}
                        <span className={getDueDateClass(order.dueDate)}>{order.dueDate}</span>
                      </p>
                      {order.notes && (
                        <p className="text-[11px] text-[#524438] dark:text-[#d7c3b2] truncate mt-0.5 max-w-[180px]">
                          {order.notes}
                        </p>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-headline font-bold text-sm text-[#211a15] dark:text-white block">
                        {order.price.toLocaleString()} {shopProfile.currency}
                      </span>
                      {getPaymentBadge(order)}
                    </div>
                  </div>

                  {/* Payment Progress Bar */}
                  <div className="mt-3">
                    <div className="flex justify-between text-[10px] text-[#847466] dark:text-[#a08e80] font-medium mb-1">
                      <span>Paid: {order.paid.toLocaleString()} {shopProfile.currency} ({paymentPercent}%)</span>
                      {balance > 0 && <span className="text-rose-500 font-bold">Bal: {balance.toLocaleString()}</span>}
                    </div>
                    <div className="w-full bg-[#ede0d6] dark:bg-[#33261c] h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          paymentPercent === 100 ? 'bg-emerald-600' : 'bg-[#a6681c]'
                        }`}
                        style={{ width: `${paymentPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="flex items-center justify-between pt-3.5 mt-4 border-t border-[#d7c3b2]/20 dark:border-[#524438]/40">
                  <div className="flex items-center gap-1.5">
                    {onOpenMessageSender && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenMessageSender({
                            name: order.customerName,
                            phone: order.customerPhone,
                            context: `${order.itemType} for ${order.customerName}`,
                          });
                        }}
                        className="p-1.5 text-[#524438] dark:text-[#d7c3b2] hover:text-[#a6681c] hover:bg-[#a6681c]/10 rounded-lg transition-colors"
                        title="Send SMS / WhatsApp update"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <a
                      href={`tel:${order.customerPhone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 text-[#524438] dark:text-[#d7c3b2] hover:text-[#a6681c] hover:bg-[#a6681c]/10 rounded-lg transition-colors"
                      title="Call Client"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  <span className="text-xs font-semibold text-[#885000] dark:text-[#ffb86d] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    View Details & Measurements →
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        /* TABLE / LIST VIEW */
        <div className="bg-white dark:bg-[#241a13] border border-[#d7c3b2]/30 dark:border-[#524438] rounded-2xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#fff8f4] dark:bg-[#1a120c] border-b border-[#d7c3b2]/25 dark:border-[#524438] text-[11px] font-headline uppercase tracking-wider text-[#847466] dark:text-[#a08e80]">
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Garment / Item</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4 text-right">Price</th>
                  <th className="py-3 px-4 text-right">Paid</th>
                  <th className="py-3 px-4 text-right">Balance</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d7c3b2]/15 dark:divide-[#524438]/30 text-xs text-[#211a15] dark:text-white">
                {ordersByDueDate.map((order) => {
                  const urgency = getDueUrgency(order.dueDate);
                  const balance = Math.max(0, order.price - order.paid);

                  return (
                    <tr
                      key={order.id}
                      onClick={() => onSelectOrder(order)}
                      className="hover:bg-[#a6681c]/5 dark:hover:bg-[#33261c]/60 cursor-pointer transition-colors"
                    >
                      {/* Customer */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold font-headline">{order.customerName}</div>
                        <div className="text-[11px] text-[#847466]">{order.customerPhone}</div>
                      </td>

                      {/* Garment */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 font-semibold text-[#885000] dark:text-[#ffb86d]">
                          <Shirt className="w-3.5 h-3.5" />
                          {order.itemType}
                        </span>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block text-[10px] font-semibold px-2.5 py-0.5 rounded border whitespace-nowrap ${getStatusBadgeClass(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </td>

                      {/* Due Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-medium">
                          <span className={getDueDateClass(order.dueDate)}>{order.dueDate}</span>
                        </div>
                        {urgency.type === 'overdue' && (
                          <span className="text-[10px] text-rose-500 font-bold">
                            ⚠️ Overdue
                          </span>
                        )}
                        {urgency.type === 'today' && (
                          <span className="text-[10px] text-amber-700 font-bold">
                            Due Today
                          </span>
                        )}
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-4 text-right font-bold">
                        {order.price.toLocaleString()} {shopProfile.currency}
                      </td>

                      {/* Paid */}
                      <td className="py-3.5 px-4 text-right text-emerald-700 dark:text-emerald-400 font-semibold">
                        {order.paid.toLocaleString()}
                      </td>

                      {/* Balance */}
                      <td className="py-3.5 px-4 text-right">
                        {balance > 0 ? (
                          <span className="text-rose-500 dark:text-rose-300 font-bold">
                            {balance.toLocaleString()} {shopProfile.currency}
                          </span>
                        ) : (
                          <span className="text-emerald-700 dark:text-emerald-400 text-[11px] font-medium">
                            Paid ✓
                          </span>
                        )}
                      </td>

                      {/* Action Shortcuts */}
                      <td className="py-3.5 px-4 text-center">
                        <div
                          className="flex items-center justify-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => onSelectOrder(order)}
                            className="p-1.5 text-[#524438] dark:text-[#d7c3b2] hover:text-[#a6681c] hover:bg-[#ede0d6] dark:hover:bg-[#33261c] rounded-lg transition-colors"
                            title="View Full Order & Measurements"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {onOpenMessageSender && (
                            <button
                              onClick={() =>
                                onOpenMessageSender({
                                  name: order.customerName,
                                  phone: order.customerPhone,
                                  context: `${order.itemType} for ${order.customerName}`,
                                })
                              }
                              className="p-1.5 text-[#524438] dark:text-[#d7c3b2] hover:text-[#a6681c] hover:bg-[#ede0d6] dark:hover:bg-[#33261c] rounded-lg transition-colors"
                              title="Send Message"
                            >
                              <MessageSquare className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
