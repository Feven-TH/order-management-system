import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Calendar,
  CreditCard,
  ArrowRight,
  Download,
  Users,
  Handshake,
  CheckCircle2,
  FileSpreadsheet,
  Printer,
  Package,
  Layers,
  HelpCircle,
  Scissors,
  ArrowUpRight,
} from 'lucide-react';
import { Customer, InventoryItem, Order, Partner, PartnerInvoice, ShopProfile } from '../types';
import { exportFinancesToExcel } from '../utils/exportToExcel';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts';

interface FinancesViewProps {
  orders: Order[];
  customers: Customer[];
  partners: Partner[];
  invoices: PartnerInvoice[];
  inventory?: InventoryItem[];
  shopProfile: ShopProfile;
  onNavigateToPartners: () => void;
  onNavigateToOrders: (filter?: string) => void;
  onNavigateToInventory?: () => void;
  onOpenMessageSender: (name: string, phone: string, text: string) => void;
}

export const FinancesView: React.FC<FinancesViewProps> = ({
  orders,
  customers,
  partners,
  invoices,
  inventory = [],
  shopProfile,
  onNavigateToPartners,
  onNavigateToOrders,
  onNavigateToInventory,
  onOpenMessageSender,
}) => {
  const [timeframe, setTimeframe] = useState<'month' | 'quarter' | 'year'>('month');
  const [chartMode, setChartMode] = useState<'revenue' | 'costs' | 'both'>('both');
  const [showInventoryExplainer, setShowInventoryExplainer] = useState(false);

  // Dynamic calculations
  const totalRevenue = orders.reduce((acc, o) => acc + o.price, 0);
  const totalPaid = orders.reduce((acc, o) => acc + o.paid, 0);
  const totalCustomersOwe = Math.max(0, totalRevenue - totalPaid);

  const directGarmentCosts = orders.reduce(
    (acc, o) => acc + o.costs.reduce((cAcc, c) => cAcc + c.amount, 0),
    0
  );
  const supplierInvoiceCosts = invoices.reduce((acc, inv) => acc + inv.amount, 0);
  const totalCosts = directGarmentCosts + supplierInvoiceCosts;
  const netProfit = totalRevenue - totalCosts;

  const totalOwedToPartners = partners.reduce((acc, p) => acc + p.balanceOwed, 0);

  // Inventory valuation calculations
  const totalInventoryValuation = inventory.reduce(
    (acc, item) => acc + item.stock * item.costPerUnit,
    0
  );
  const totalInventoryItemsCount = inventory.reduce((acc, item) => acc + item.stock, 0);

  const fabricsValue = inventory
    .filter((i) => i.category === 'Fabric')
    .reduce((acc, i) => acc + i.stock * i.costPerUnit, 0);
  const liningsValue = inventory
    .filter((i) => i.category === 'Lining')
    .reduce((acc, i) => acc + i.stock * i.costPerUnit, 0);
  const trimsValue = inventory
    .filter((i) => i.category === 'Trim' || i.category === 'Button')
    .reduce((acc, i) => acc + i.stock * i.costPerUnit, 0);
  const otherMaterialsValue = Math.max(0, totalInventoryValuation - (fabricsValue + liningsValue + trimsValue));

  // Monthly trends mock dataset matching realistic workshop seasonality
  const chartData = [
    { month: 'May', revenue: 28000, costs: 12000, profit: 16000 },
    { month: 'Jun', revenue: 34000, costs: 14500, profit: 19500 },
    { month: 'Jul', revenue: 31000, costs: 13000, profit: 18000 },
    { month: 'Aug', revenue: 42000, costs: 17200, profit: 24800 },
    { month: 'Sep', revenue: 38500, costs: 16000, profit: 22500 },
    { month: 'Oct', revenue: totalRevenue, costs: totalCosts, profit: netProfit },
  ];

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-10 py-6 md:py-8 space-y-8 animate-fadeIn pb-24 md:pb-16">
      {/* Header with structured toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-1">
        <div>
          <h1 className="font-headline text-2xl md:text-3xl font-bold text-[#211a15] dark:text-white">
            Finances & Analytics
          </h1>
          <p className="text-sm text-[#524438] dark:text-[#d7c3b2] mt-0.5">
            Monitor cash flow, garment profitability margins, material asset capital, and partner payables.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          {/* Timeframe selector */}
          <div className="flex items-center gap-2 bg-[#fff8f4] dark:bg-[#1a120c] border border-[#d7c3b2]/40 dark:border-[#524438] rounded-xl px-3 py-2 shadow-2xs">
            <Calendar className="w-4 h-4 text-[#885000] dark:text-[#ffb86d]" />
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value as any)}
              className="bg-transparent text-xs font-bold text-[#211a15] dark:text-white outline-none cursor-pointer pr-1"
            >
              <option value="month">This Month (October)</option>
              <option value="quarter">Quarter 3 (Q3)</option>
              <option value="year">Year to Date (2024)</option>
            </select>
          </div>

          {/* Export & Download Action Group */}
          <div className="flex items-center bg-[#fff8f4] dark:bg-[#1a120c] border border-[#d7c3b2]/40 dark:border-[#524438] rounded-xl p-1 shadow-2xs gap-1.5">
            <button
              onClick={() => exportFinancesToExcel(orders, invoices, shopProfile)}
              className="px-3.5 py-1.5 bg-[#15803d] hover:bg-[#166534] dark:bg-[#166534] dark:hover:bg-[#15803d] text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 shadow-xs border border-[#166534]"
              title="Export Full Financial P&L Spreadsheet (.xlsx)"
            >
              <FileSpreadsheet className="w-4 h-4 text-white" />
              <span>Export Excel</span>
            </button>

            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 hover:bg-[#ede0d6]/60 dark:hover:bg-[#2c2016] text-[#524438] dark:text-[#d7c3b2] hover:text-[#885000] rounded-lg transition-all text-xs font-bold flex items-center gap-1.5 active:scale-95"
              title="Print or Save PDF Report"
            >
              <Printer className="w-3.5 h-3.5 text-[#885000]" />
              <span>Print / PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Revenue */}
        <div className="bg-white dark:bg-[#241a13] p-5 sm:p-6 rounded-xl border border-[#d7c3b2]/30 dark:border-[#524438] shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-3">
            <div className="w-10 h-10 rounded-full bg-[#fff1e7] dark:bg-[#33261c] text-[#885000] dark:text-[#ffb86d] flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-[#15803d] bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-800/40 px-2 py-0.5 rounded-full">
              +12.5% vs last mo
            </span>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#784a05] dark:text-[#ffb86d]">
              Total Revenue
            </p>
            <p className="font-headline text-2xl sm:text-3xl font-bold text-[#211a15] dark:text-white mt-1">
              {totalRevenue.toLocaleString()}{' '}
              <span className="text-sm font-medium text-[#524438] dark:text-[#d7c3b2]">
                {shopProfile.currency}
              </span>
            </p>
            <p className="text-[11px] text-[#784a05] dark:text-[#d7c3b2] mt-1 font-medium">
              Collected: {totalPaid.toLocaleString()} {shopProfile.currency}
            </p>
          </div>
        </div>

        {/* Total Costs */}
        <div className="bg-white dark:bg-[#241a13] p-5 sm:p-6 rounded-xl border border-[#d7c3b2]/30 dark:border-[#524438] shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-3">
            <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-[#3d1a1a] text-rose-600 dark:text-rose-300 flex items-center justify-center border border-rose-200/60 dark:border-rose-900/40">
              <TrendingDown className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-[#885000] bg-[#fff1e7] dark:bg-[#33261c] border border-[#d7c3b2]/40 px-2 py-0.5 rounded-full">
              -2.1% vs last mo
            </span>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#784a05] dark:text-[#ffb86d]">
              Total Costs
            </p>
            <p className="font-headline text-2xl sm:text-3xl font-bold text-[#211a15] dark:text-white mt-1">
              {totalCosts.toLocaleString()}{' '}
              <span className="text-sm font-medium text-[#524438] dark:text-[#d7c3b2]">
                {shopProfile.currency}
              </span>
            </p>
            <p className="text-[11px] text-[#5e4d3e] dark:text-[#d7c3b2] mt-1 truncate font-medium">
              Labor/Garment: {directGarmentCosts.toLocaleString()} | Suppliers: {supplierInvoiceCosts.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Net Profit */}
        <div className="bg-white dark:bg-[#241a13] p-5 sm:p-6 rounded-xl border-2 border-[#a6681c]/50 dark:border-[#885000] shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-3">
            <div className="w-10 h-10 rounded-full bg-[#fdbd72] dark:bg-[#845411] text-[#784a05] dark:text-white flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-[#15803d] bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/70 px-2 py-0.5 rounded-full">
              Margin: {totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0}%
            </span>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#784a05] dark:text-[#ffb86d]">
              Net Profit
            </p>
            <p className="font-headline text-2xl sm:text-3xl font-bold text-[#885000] dark:text-[#ffb86d] mt-1">
              {netProfit.toLocaleString()}{' '}
              <span className="text-sm font-medium text-[#885000]/70 dark:text-[#ffb86d]/70">
                {shopProfile.currency}
              </span>
            </p>
            <p className="text-[11px] text-[#15803d] dark:text-emerald-400 font-bold mt-1">
              Net Workshop Retained Earnings
            </p>
          </div>
        </div>

        {/* Inventory Asset Value */}
        <div className="bg-gradient-to-br from-[#fff8f4] to-[#fff1e7] dark:from-[#241a13] dark:to-[#1a120c] p-5 sm:p-6 rounded-xl border border-[#d7c3b2]/40 dark:border-[#524438] shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-3">
            <div className="w-10 h-10 rounded-full bg-[#885000] text-white flex items-center justify-center shadow-2xs">
              <Package className="w-5 h-5" />
            </div>
            {onNavigateToInventory && (
              <button
                onClick={onNavigateToInventory}
                className="text-[11px] font-bold text-[#885000] dark:text-[#ffb86d] hover:underline flex items-center gap-0.5"
              >
                <span>Manage</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#784a05] dark:text-[#ffb86d]">
              Inventory Asset Value
            </p>
            <p className="font-headline text-2xl sm:text-3xl font-bold text-[#885000] dark:text-[#ffb86d] mt-1">
              {totalInventoryValuation.toLocaleString()}{' '}
              <span className="text-sm font-medium text-[#524438] dark:text-[#d7c3b2]">
                {shopProfile.currency}
              </span>
            </p>
            <p className="text-[11px] text-[#5e4d3e] dark:text-[#d7c3b2] mt-1 font-medium">
              {inventory.length} SKUs ({totalInventoryItemsCount} units in stock)
            </p>
          </div>
        </div>
      </div>

      {/* Inventory & Material Financial Integration Explainer Card */}
      <div className="bg-white dark:bg-[#241a13] rounded-2xl border border-[#d7c3b2]/30 dark:border-[#524438] p-5 md:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#d7c3b2]/20 dark:border-[#524438] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#fff1e7] dark:bg-[#33261c] text-[#885000] dark:text-[#ffb86d] flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-headline font-bold text-base md:text-lg text-[#211a15] dark:text-white">
                How Inventory is Included in Atelier Finances
              </h3>
              <p className="text-xs text-[#524438] dark:text-[#d7c3b2]">
                Understanding the flow from material capital stock to garment cost of goods sold (COGS)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onNavigateToInventory && (
              <button
                onClick={onNavigateToInventory}
                className="px-3.5 py-1.5 bg-[#885000] hover:bg-[#a6681c] text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 shadow-2xs"
              >
                <Package className="w-3.5 h-3.5" />
                <span>Go to Inventory</span>
              </button>
            )}
          </div>
        </div>

        {/* 3 Pillars of Financial Integration */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-5">
          {/* Pillar 1 */}
          <div className="p-4 rounded-xl bg-[#fff8f4] dark:bg-[#1a120c] border border-[#d7c3b2]/25 dark:border-[#524438]/60 space-y-2">
            <div className="flex items-center gap-2 text-[#885000] dark:text-[#ffb86d] font-bold text-xs uppercase tracking-wider">
              <span className="w-5 h-5 rounded-full bg-[#885000] text-white flex items-center justify-center text-[10px] font-mono">
                1
              </span>
              <span>Stock Capital (Asset)</span>
            </div>
            <p className="text-xs text-[#524438] dark:text-[#d7c3b2] leading-relaxed">
              Materials stored in your workshop (fabrics, linings, buttons, trims) represent <strong>liquid physical assets</strong> worth{' '}
              <strong className="text-[#885000] dark:text-[#ffb86d]">
                {totalInventoryValuation.toLocaleString()} {shopProfile.currency}
              </strong>
              . This capital is tied in active inventory until consumed for client orders.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="p-4 rounded-xl bg-[#fff8f4] dark:bg-[#1a120c] border border-[#d7c3b2]/25 dark:border-[#524438]/60 space-y-2">
            <div className="flex items-center gap-2 text-[#885000] dark:text-[#ffb86d] font-bold text-xs uppercase tracking-wider">
              <span className="w-5 h-5 rounded-full bg-[#885000] text-white flex items-center justify-center text-[10px] font-mono">
                2
              </span>
              <span>Direct Garment Costs</span>
            </div>
            <p className="text-xs text-[#524438] dark:text-[#d7c3b2] leading-relaxed">
              When fabric is cut and assigned to a bespoke suit or Habesha dress, its unit cost is logged directly under that order's{' '}
              <strong>Garment Costs</strong> (Total: <strong className="text-rose-600 dark:text-rose-400">{directGarmentCosts.toLocaleString()} {shopProfile.currency}</strong>). This determines gross garment profit margin.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="p-4 rounded-xl bg-[#fff8f4] dark:bg-[#1a120c] border border-[#d7c3b2]/25 dark:border-[#524438]/60 space-y-2">
            <div className="flex items-center gap-2 text-[#885000] dark:text-[#ffb86d] font-bold text-xs uppercase tracking-wider">
              <span className="w-5 h-5 rounded-full bg-[#885000] text-white flex items-center justify-center text-[10px] font-mono">
                3
              </span>
              <span>Supplier Payables & P&L</span>
            </div>
            <p className="text-xs text-[#524438] dark:text-[#d7c3b2] leading-relaxed">
              Bulk fabric orders from mills (e.g. Merkato Silk, Ethio Textiles) are recorded as <strong>Supplier Invoices</strong>. These reduce net profit and are tracked as partner liabilities until settled in cash.
            </p>
          </div>
        </div>

        {/* Inventory Category Breakdown Pills */}
        <div className="mt-5 pt-4 border-t border-[#d7c3b2]/20 dark:border-[#524438] flex flex-wrap items-center gap-3">
          <span className="text-xs font-bold text-[#784a05] dark:text-[#ffb86d] uppercase tracking-wider">
            Material Valuation by Category:
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#fff1e7] dark:bg-[#2a2018] border border-[#d7c3b2]/40 dark:border-[#524438] text-xs font-semibold text-[#211a15] dark:text-white">
              🧵 Fabrics: <strong className="text-[#885000] dark:text-[#ffb86d]">{fabricsValue.toLocaleString()} {shopProfile.currency}</strong>
            </span>
            <span className="px-3 py-1 rounded-full bg-[#fff1e7] dark:bg-[#2a2018] border border-[#d7c3b2]/40 dark:border-[#524438] text-xs font-semibold text-[#211a15] dark:text-white">
              ✨ Linings: <strong className="text-[#885000] dark:text-[#ffb86d]">{liningsValue.toLocaleString()} {shopProfile.currency}</strong>
            </span>
            <span className="px-3 py-1 rounded-full bg-[#fff1e7] dark:bg-[#2a2018] border border-[#d7c3b2]/40 dark:border-[#524438] text-xs font-semibold text-[#211a15] dark:text-white">
              🔘 Trims & Buttons: <strong className="text-[#885000] dark:text-[#ffb86d]">{trimsValue.toLocaleString()} {shopProfile.currency}</strong>
            </span>
            {otherMaterialsValue > 0 && (
              <span className="px-3 py-1 rounded-full bg-[#fff1e7] dark:bg-[#2a2018] border border-[#d7c3b2]/40 dark:border-[#524438] text-xs font-semibold text-[#211a15] dark:text-white">
                📦 Other: <strong className="text-[#885000] dark:text-[#ffb86d]">{otherMaterialsValue.toLocaleString()} {shopProfile.currency}</strong>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Receivables & Payables Highlight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Receivables */}
        <div className="bg-[#fff8f4] dark:bg-[#2a2018] p-6 rounded-xl border border-[#d7c3b2]/40 dark:border-[#524438] flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#784a05] dark:text-[#ffb86d]">
              Total Customers Owe
            </span>
            <p className="font-headline text-2xl md:text-3xl font-bold text-rose-600 dark:text-rose-300 mt-1">
              {totalCustomersOwe.toLocaleString()} {shopProfile.currency}
            </p>
            <p className="text-xs text-[#524438] dark:text-[#d7c3b2] mt-0.5">
              Outstanding balances across uncompleted orders
            </p>
          </div>

          <button
            onClick={() => onNavigateToOrders('Unpaid')}
            className="px-4 py-2 bg-[#885000] hover:bg-[#a6681c] text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 active:scale-95 transition-all shrink-0"
          >
            <span>Send Reminders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Partner Payables */}
        <div className="bg-[#fff8f4] dark:bg-[#2a2018] p-6 rounded-xl border border-[#d7c3b2]/40 dark:border-[#524438] flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#784a05] dark:text-[#ffb86d]">
              Total Owed to Partners
            </span>
            <p className="font-headline text-2xl md:text-3xl font-bold text-[#885000] dark:text-[#ffb86d] mt-1">
              {totalOwedToPartners.toLocaleString()} {shopProfile.currency}
            </p>
            <p className="text-xs text-[#524438] dark:text-[#d7c3b2] mt-0.5">
              Due to fabric suppliers, Telafi craftsmen & rent
            </p>
          </div>

          <button
            onClick={onNavigateToPartners}
            className="px-4 py-2 bg-[#a6681c] hover:bg-[#885000] text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 active:scale-95 transition-all shrink-0"
          >
            <span>View Payables</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Financial Trends Interactive Chart */}
      <div className="bg-white dark:bg-[#241a13] p-6 rounded-xl border border-[#d7c3b2]/30 dark:border-[#524438] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-headline font-bold text-lg text-[#211a15] dark:text-white">
              Financial Trends (6-Month Trajectory)
            </h3>
            <p className="text-xs text-[#524438] dark:text-[#d7c3b2]">
              Comparison of atelier gross income against direct garment costs and supplier expenses
            </p>
          </div>

          <div className="flex items-center gap-2 bg-[#fff8f4] dark:bg-[#1a120c] p-1 rounded-lg border border-[#d7c3b2]/40 dark:border-[#524438]">
            <button
              onClick={() => setChartMode('both')}
              className={`px-3 py-1 text-xs font-bold rounded ${
                chartMode === 'both' ? 'bg-[#885000] text-white shadow-sm' : 'text-[#784a05] dark:text-[#d7c3b2]'
              }`}
            >
              Revenue & Costs
            </button>
            <button
              onClick={() => setChartMode('revenue')}
              className={`px-3 py-1 text-xs font-bold rounded ${
                chartMode === 'revenue' ? 'bg-[#885000] text-white shadow-sm' : 'text-[#784a05] dark:text-[#d7c3b2]'
              }`}
            >
              Revenue Only
            </button>
            <button
              onClick={() => setChartMode('costs')}
              className={`px-3 py-1 text-xs font-bold rounded ${
                chartMode === 'costs' ? 'bg-[#885000] text-white shadow-sm' : 'text-[#784a05] dark:text-[#d7c3b2]'
              }`}
            >
              Costs Only
            </button>
          </div>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#885000" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#885000" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="costsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#e11d48" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#e11d48" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8ded3" opacity={0.6} />
              <XAxis dataKey="month" stroke="#784a05" fontSize={12} tickLine={false} />
              <YAxis
                stroke="#784a05"
                fontSize={12}
                tickLine={false}
                tickFormatter={(val) => `${val / 1000}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff8f4',
                  borderColor: '#d7c3b2',
                  borderRadius: '10px',
                  fontSize: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                }}
                formatter={(value: any) => [`${Number(value).toLocaleString()} ${shopProfile.currency}`]}
              />
              {(chartMode === 'revenue' || chartMode === 'both') && (
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#885000"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#revenueGrad)"
                  name="Revenue"
                />
              )}
              {(chartMode === 'costs' || chartMode === 'both') && (
                <Area
                  type="monotone"
                  dataKey="costs"
                  stroke="#e11d48"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#costsGrad)"
                  name="Costs"
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two Column Section: Top Customers & Partner Balances */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Customers */}
        <div className="bg-white dark:bg-[#241a13] rounded-xl border border-[#d7c3b2]/30 dark:border-[#524438] overflow-hidden shadow-sm">
          <div className="p-4 border-b border-[#d7c3b2]/20 dark:border-[#524438] bg-[#fff8f4] dark:bg-[#1a120c] flex justify-between items-center">
            <h3 className="font-headline font-bold text-base text-[#211a15] dark:text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-[#885000] dark:text-[#ffb86d]" />
              Top Clients by Lifetime Value
            </h3>
          </div>

          <div className="divide-y divide-[#d7c3b2]/15 dark:divide-[#524438]/40">
            {customers.slice(0, 4).map((c, i) => (
              <div
                key={c.id}
                className="p-3.5 flex items-center justify-between hover:bg-[#fff1e7]/40 dark:hover:bg-[#33261c]/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="w-5 font-mono text-xs font-bold text-[#784a05] dark:text-[#ffb86d]">#{i + 1}</span>
                  <div>
                    <p className="font-headline text-sm font-bold text-[#211a15] dark:text-white">
                      {c.name}
                    </p>
                    <p className="text-xs text-[#524438] dark:text-[#d7c3b2]">{c.totalOrders} bespoke pieces</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-mono text-sm font-bold text-[#885000] dark:text-[#ffb86d]">
                    {(c.totalOrders * 5200 + 4000).toLocaleString()} {shopProfile.currency}
                  </p>
                  <p className="text-[11px] text-[#784a05] dark:text-[#d7c3b2]">LTV</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Partner Balances */}
        <div className="bg-white dark:bg-[#241a13] rounded-xl border border-[#d7c3b2]/30 dark:border-[#524438] overflow-hidden shadow-sm">
          <div className="p-4 border-b border-[#d7c3b2]/20 dark:border-[#524438] bg-[#fff8f4] dark:bg-[#1a120c] flex justify-between items-center">
            <h3 className="font-headline font-bold text-base text-[#211a15] dark:text-white flex items-center gap-2">
              <Handshake className="w-4 h-4 text-[#885000] dark:text-[#ffb86d]" />
              Partner & Supplier Balances
            </h3>
            <button
              onClick={onNavigateToPartners}
              className="text-xs font-bold text-[#885000] dark:text-[#ffb86d] hover:underline"
            >
              Manage
            </button>
          </div>

          <div className="divide-y divide-[#d7c3b2]/15 dark:divide-[#524438]/40">
            {partners.slice(0, 4).map((p) => (
              <div
                key={p.id}
                className="p-3.5 flex items-center justify-between hover:bg-[#fff1e7]/40 dark:hover:bg-[#33261c]/50 transition-colors"
              >
                <div>
                  <p className="font-headline text-sm font-bold text-[#211a15] dark:text-white">
                    {p.name}
                  </p>
                  <p className="text-xs text-[#524438] dark:text-[#d7c3b2]">{p.type}</p>
                </div>

                <div className="text-right">
                  <p className="font-mono text-sm font-bold text-rose-600 dark:text-rose-300">
                    {p.balanceOwed.toLocaleString()} {shopProfile.currency}
                  </p>
                  <p className="text-[11px] text-[#784a05] dark:text-[#d7c3b2]">
                    {p.balanceOwed > 0 ? 'Payable' : 'Settled ✓'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
