import * as XLSX from 'xlsx';
import { Customer, InventoryItem, Order, Partner, PartnerInvoice, ShopProfile } from '../types';

export const exportAllDataToExcel = (data: {
  orders: Order[];
  customers: Customer[];
  partners: Partner[];
  invoices: PartnerInvoice[];
  inventory: InventoryItem[];
  shopProfile: ShopProfile;
}) => {
  const wb = XLSX.utils.book_new();

  // 1. Orders Sheet
  const ordersData = data.orders.map((o) => {
    const totalCosts = o.costs?.reduce((sum, c) => sum + c.amount, 0) || 0;
    const netProfit = o.price - totalCosts;
    return {
      'Order ID': o.orderNumber,
      'Client Name': o.customerName,
      'Phone': o.customerPhone,
      'Garment Item': o.itemType,
      'Price (ETB)': o.price,
      'Paid (ETB)': o.paid,
      'Remaining Balance (ETB)': Math.max(0, o.price - o.paid),
      'Status': o.status,
      'Due Date': o.dueDate,
      'Date Created': o.createdAt,
      'Total Direct Costs (ETB)': totalCosts,
      'Gross Profit (ETB)': netProfit,
      'Chest': o.measurements?.chest || '',
      'Waist': o.measurements?.waist || '',
      'Hip': o.measurements?.hip || '',
      'Shoulder': o.measurements?.shoulder || '',
      'Sleeve Length': o.measurements?.sleeveLength || '',
      'Trouser Length': o.measurements?.trouserLength || '',
      'Notes': o.description || '',
    };
  });
  const wsOrders = XLSX.utils.json_to_sheet(ordersData);
  XLSX.utils.book_append_sheet(wb, wsOrders, 'Bespoke Orders');

  // 2. Customers Sheet
  const customersData = data.customers.map((c) => ({
    'Customer ID': c.id,
    'Full Name': c.name,
    'Primary Phone': c.phone,
    'Alt Phone': c.altPhone || '',
    'Email': c.email || '',
    'Delivery Address': c.address || '',
    'Total Orders Count': c.totalOrders,
    'Outstanding Balance (ETB)': c.balance,
    'Client Since': c.createdAt,
    'Fit & Style Notes': c.notes || '',
  }));
  const wsCustomers = XLSX.utils.json_to_sheet(customersData);
  XLSX.utils.book_append_sheet(wb, wsCustomers, 'Clientele');

  // 3. Finances & P&L Summary
  const totalRevenue = data.orders.reduce((acc, o) => acc + o.price, 0);
  const totalCollected = data.orders.reduce((acc, o) => acc + o.paid, 0);
  const totalUnpaid = Math.max(0, totalRevenue - totalCollected);
  const totalDirectCosts = data.orders.reduce(
    (acc, o) => acc + (o.costs?.reduce((sum, c) => sum + c.amount, 0) || 0),
    0
  );
  const totalInvoices = data.invoices.reduce((acc, inv) => acc + inv.amount, 0);
  const totalCosts = totalDirectCosts + totalInvoices;
  const netProfit = totalRevenue - totalCosts;

  const financesSummary = [
    { 'Metric': 'Workshop Name', 'Value': data.shopProfile.name },
    { 'Metric': 'Currency', 'Value': data.shopProfile.currency },
    { 'Metric': 'Total Gross Revenue (ETB)', 'Value': totalRevenue },
    { 'Metric': 'Total Cash Collected (ETB)', 'Value': totalCollected },
    { 'Metric': 'Customer Receivables Owed (ETB)', 'Value': totalUnpaid },
    { 'Metric': 'Garment Direct Labor & Material Costs (ETB)', 'Value': totalDirectCosts },
    { 'Metric': 'Partner & Supplier Invoices (ETB)', 'Value': totalInvoices },
    { 'Metric': 'Total Workshop Expenses (ETB)', 'Value': totalCosts },
    { 'Metric': 'Net Atelier Profit (ETB)', 'Value': netProfit },
    { 'Metric': 'Net Profit Margin', 'Value': `${totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0}%` },
    { 'Metric': 'Export Date', 'Value': new Date().toLocaleString() },
  ];
  const wsFinances = XLSX.utils.json_to_sheet(financesSummary);
  XLSX.utils.book_append_sheet(wb, wsFinances, 'Financial Summary');

  // 4. Inventory Sheet
  const inventoryData = data.inventory.map((item) => ({
    'SKU ID': item.id,
    'Material / Fabric Name': item.name,
    'Category': item.category,
    'Current Stock': item.stock,
    'Unit of Measure': item.unit,
    'Cost per Unit (ETB)': item.costPerUnit,
    'Total Valuation (ETB)': item.stock * item.costPerUnit,
    'Min Stock Threshold': item.minStockLevel,
    'Stock Status': item.stock <= item.minStockLevel ? 'LOW STOCK - REORDER' : 'HEALTHY',
    'Preferred Supplier': item.supplier || '',
  }));
  const wsInventory = XLSX.utils.json_to_sheet(inventoryData);
  XLSX.utils.book_append_sheet(wb, wsInventory, 'Material Inventory');

  // 5. Partners & Payables Sheet
  const partnersData = data.partners.map((p) => ({
    'Partner ID': p.id,
    'Business / Craftsman Name': p.name,
    'Service Category': p.type,
    'Contact Phone': p.phone || '',
    'Outstanding Balance Owed (ETB)': p.balanceOwed,
    'Total Lifetime Paid (ETB)': p.totalPaid,
    'Specialty Notes': p.notes || '',
  }));
  const wsPartners = XLSX.utils.json_to_sheet(partnersData);
  XLSX.utils.book_append_sheet(wb, wsPartners, 'Trade Partners');

  // Generate and download XLSX
  const filename = `${data.shopProfile.name.replace(/\s+/g, '_')}_Master_Export_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, filename);
};

export const exportFinancesToExcel = (
  orders: Order[],
  invoices: PartnerInvoice[],
  shopProfile: ShopProfile
) => {
  const wb = XLSX.utils.book_new();

  const totalRevenue = orders.reduce((acc, o) => acc + o.price, 0);
  const totalCollected = orders.reduce((acc, o) => acc + o.paid, 0);
  const totalDirectCosts = orders.reduce(
    (acc, o) => acc + (o.costs?.reduce((sum, c) => sum + c.amount, 0) || 0),
    0
  );
  const totalInvoices = invoices.reduce((acc, inv) => acc + inv.amount, 0);
  const totalCosts = totalDirectCosts + totalInvoices;
  const netProfit = totalRevenue - totalCosts;

  const summary = [
    { 'Financial Report': `${shopProfile.name} - Statement of Earnings` },
    { 'Financial Report': `Generated: ${new Date().toLocaleDateString()}` },
    { 'Financial Report': '' },
    { 'Financial Report': 'Gross Revenue', 'Amount (ETB)': totalRevenue },
    { 'Financial Report': 'Collected Cash', 'Amount (ETB)': totalCollected },
    { 'Financial Report': 'Receivables from Clients', 'Amount (ETB)': Math.max(0, totalRevenue - totalCollected) },
    { 'Financial Report': 'Direct Labor & Material Costs', 'Amount (ETB)': totalDirectCosts },
    { 'Financial Report': 'Supplier & Rent Invoices', 'Amount (ETB)': totalInvoices },
    { 'Financial Report': 'Total Operating Expenses', 'Amount (ETB)': totalCosts },
    { 'Financial Report': 'Net Profit', 'Amount (ETB)': netProfit },
    { 'Financial Report': 'Profit Margin', 'Amount (ETB)': `${totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0}%` },
  ];

  const ws = XLSX.utils.json_to_sheet(summary);
  XLSX.utils.book_append_sheet(wb, ws, 'P&L Statement');
  XLSX.writeFile(wb, `${shopProfile.name.replace(/\s+/g, '_')}_Finances_${new Date().toISOString().split('T')[0]}.xlsx`);
};
