export type OrderStatus =
  | 'Confirmed'
  | 'In Progress'
  | 'In Cutting'
  | 'First Fitting'
  | 'Ready for Fitting'
  | 'Ready'
  | 'Completed'
  | 'Measurements Taken';

export type PaymentStatus = 'Fully Paid' | 'Partially Paid' | 'Unpaid';

export type PaymentMethod = 'Cash' | 'Telebirr' | 'CBE' | 'Other Bank' | 'Card' | 'Bank Transfer';

export interface OrderMeasurement {
  shoulder?: number;
  bust?: number;
  waist?: number;
  hips?: number;
  length?: number;
  neck?: number;
  chest?: number;
  sleeve?: number;
  inseam?: number;
  thigh?: number;
  [key: string]: number | undefined;
}

export interface OrderCost {
  id: string;
  item: string;
  costType: 'Telafi' | 'Sefi' | 'Tailoring' | 'Material' | 'Delivery' | 'Manufacturing' | 'Other';
  amount: number;
  partnerId?: string;
  partnerName?: string;
  status: 'Paid' | 'Partially Paid' | 'Unpaid';
  dueDate?: string;
  notes?: string;
}

export interface PaymentLog {
  id: string;
  amount: number;
  method: PaymentMethod;
  date: string;
  note?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  itemType: string;
  price: number;
  deposit: number;
  paid: number;
  status: OrderStatus;
  dueDate: string;
  createdAt: string;
  description: string;
  notes?: string;
  measurements: OrderMeasurement;
  referencePhotos: string[];
  costs: OrderCost[];
  paymentLogs: PaymentLog[];
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  altPhone?: string;
  email?: string;
  address?: string;
  notes?: string;
  initials: string;
  avatarColor?: string;
  totalOrders: number;
  balance: number;
  createdAt: string;
}

export interface Partner {
  id: string;
  name: string;
  type: 'Fabric Supplier' | 'Telafi / Tailor' | 'Assembly / Manufacturing' | 'Delivery' | 'Embroidery' | 'Workshop Rent' | 'Other';
  phone?: string;
  email?: string;
  balanceOwed: number;
  totalPaid: number;
  notes?: string;
}

export interface PartnerInvoice {
  id: string;
  partnerId: string;
  partnerName: string;
  invoiceNumber: string;
  title: string;
  amount: number;
  dueDate: string;
  status: 'Due Tomorrow' | 'Due Soon' | 'Overdue' | 'Paid';
  category: string;
}

export interface ReminderItem {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  type: 'fitting' | 'payment_due' | 'partner_payable' | 'delivery' | 'measurement';
  completed: boolean;
  recipientName?: string;
  recipientPhone?: string;
  orderId?: string;
  amount?: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'Fabric' | 'Trims & Buttons' | 'Lining' | 'Thread' | 'Zipper' | 'Accessories';
  stock: number;
  unit: string;
  costPerUnit: number;
  minStockLevel: number;
  supplier?: string;
}

export interface BusinessTheme {
  logoUrl: string;
  primaryColor: string; // e.g. #7A4E2D
  primaryHover: string;
  primaryLight: string;
  secondaryColor: string; // e.g. #F3E6D8
  accentColor: string; // e.g. #C49A6C
  backgroundColor: string; // e.g. #fff8f4 (light tint)
  surfaceColor: string; // e.g. #ffffff (card/surface)
  surfaceContainer: string; // e.g. #f9ebe2
  surfaceContainerHigh: string; // e.g. #f3e6dc
  textColor: string; // e.g. #211a15 (dark neutral)
  textMuted: string; // e.g. #524438
  borderColor: string; // e.g. #d7c3b2
  contrastRatio: number; // e.g. 11.4:1
  wcagRating: 'AAA' | 'AA' | 'Pass';
  harmonyName: string; // e.g. 'Warm Tailor Palette'
  extractedPalette: string[]; // array of raw hex colors from logo
  analyzedAt?: string;
}

export interface ShopProfile {
  name: string;
  email: string;
  phone: string;
  logoUrl: string;
  currency: string;
  version: string;
  theme: 'light' | 'dark' | 'auto';
  brandAccent: string;
  businessTheme?: BusinessTheme;
  statuses: string[];
  activeMetrics: string[];
}

export type ActiveView =
  | 'landing'
  | 'dashboard'
  | 'orders'
  | 'order_details'
  | 'customers'
  | 'finances'
  | 'partners'
  | 'reminders'
  | 'inventory'
  | 'settings';
