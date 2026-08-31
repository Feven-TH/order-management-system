import {
  Customer,
  InventoryItem,
  Order,
  Partner,
  PartnerInvoice,
  ReminderItem,
  ShopProfile,
} from '../types';

export const INITIAL_SHOP_PROFILE: ShopProfile = {
  name: 'AtelierOS',
  email: '',
  phone: '',
  logoUrl: '',
  currency: 'ETB',
  version: 'v1.2.0',
  theme: 'dark',
  brandAccent: '#885000',
  statuses: [
    'Confirmed',
    'In Progress',
    'Ready for Fitting',
    'Ready',
    'Completed',
  ],
  measurementFields: ['shoulder', 'bust', 'waist', 'hips', 'length', 'sleeve', 'neck', 'inseam'],
  activeMetrics: [
    'Total Revenue (MTD)',
    'Active Orders',
    'Pending Fittings',
    'Customer Retention',
  ],
};

export const INITIAL_CUSTOMERS: Customer[] = [];

export const INITIAL_ORDERS: Order[] = [];

export const INITIAL_PARTNERS: Partner[] = [];

export const INITIAL_INVOICES: PartnerInvoice[] = [];

export const INITIAL_REMINDERS: ReminderItem[] = [];

export const INITIAL_INVENTORY: InventoryItem[] = [];
