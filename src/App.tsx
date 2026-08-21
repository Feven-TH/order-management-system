/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  ActiveView,
  Customer,
  InventoryItem,
  Order,
  OrderCost,
  Partner,
  PartnerInvoice,
  PaymentLog,
  ReminderItem,
  ShopProfile,
} from './types';
import {
  INITIAL_CUSTOMERS,
  INITIAL_INVENTORY,
  INITIAL_INVOICES,
  INITIAL_ORDERS,
  INITIAL_PARTNERS,
  INITIAL_REMINDERS,
  INITIAL_SHOP_PROFILE,
} from './data/initialData';
import { Navigation } from './components/Navigation';
import { LandingPage } from './components/LandingPage';
import { AuthModal } from './components/AuthModal';
import { OnboardingFlow } from './components/OnboardingFlow';
import { DashboardView } from './components/DashboardView';
import { OrdersView } from './components/OrdersView';
import { OrderDetailsView } from './components/OrderDetailsView';
import { NewOrderModal } from './components/NewOrderModal';
import { AddPaymentModal } from './components/AddPaymentModal';
import { AddCostModal } from './components/AddCostModal';
import { CustomersView } from './components/CustomersView';
import { NewCustomerModal } from './components/NewCustomerModal';
import { FinancesView } from './components/FinancesView';
import { PartnersView } from './components/PartnersView';
import { RemindersView } from './components/RemindersView';
import { InventoryView } from './components/InventoryView';
import { SettingsView } from './components/SettingsView';
import { PhotoPreviewModal } from './components/PhotoPreviewModal';
import { MessageSenderModal } from './components/MessageSenderModal';
import { exportAllDataToExcel } from './utils/exportToExcel';
import {
  applyThemeToDocument,
  generateAccessibleTheme,
  SAMPLE_ATELIER_LOGOS,
} from './utils/themeGenerator';

export default function App() {
  // Navigation & View State
  const [currentView, setCurrentView] = useState<ActiveView>('dashboard');
  const [previousView, setPreviousView] = useState<ActiveView>('dashboard');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [ordersFilter, setOrdersFilter] = useState<string>('All Orders');

  // Authentication & Onboarding Modal State
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  // Workspace Data State with LocalStorage Caching
  const [shopProfile, setShopProfile] = useState<ShopProfile>(() => {
    const saved = localStorage.getItem('atelieros_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...INITIAL_SHOP_PROFILE,
          ...parsed,
          theme: parsed.theme || 'dark',
        };
      } catch {
        return INITIAL_SHOP_PROFILE;
      }
    }
    return INITIAL_SHOP_PROFILE;
  });

  const handleToggleTheme = () => {
    const nextTheme: 'dark' | 'light' = shopProfile.theme === 'dark' ? 'light' : 'dark';
    const updated: ShopProfile = {
      ...shopProfile,
      theme: nextTheme,
    };
    setShopProfile(updated);
    let themeToApply = updated.businessTheme;
    if (!themeToApply) {
      themeToApply = generateAccessibleTheme(
        updated.logoUrl || SAMPLE_ATELIER_LOGOS[1].url,
        [updated.brandAccent || '#885000', '#a6681c', '#fdbd72']
      );
    }
    applyThemeToDocument(themeToApply, nextTheme === 'dark');
  };

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('atelieros_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('atelieros_customers');
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  const [partners, setPartners] = useState<Partner[]>(() => {
    const saved = localStorage.getItem('atelieros_partners');
    return saved ? JSON.parse(saved) : INITIAL_PARTNERS;
  });

  const [invoices, setInvoices] = useState<PartnerInvoice[]>(() => {
    const saved = localStorage.getItem('atelieros_invoices');
    return saved ? JSON.parse(saved) : INITIAL_INVOICES;
  });

  const [reminders, setReminders] = useState<ReminderItem[]>(() => {
    const saved = localStorage.getItem('atelieros_reminders');
    return saved ? JSON.parse(saved) : INITIAL_REMINDERS;
  });

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('atelieros_inventory');
    return saved ? JSON.parse(saved) : INITIAL_INVENTORY;
  });

  // Modals & Dialogs State
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const [newOrderPreselectedCustomerId, setNewOrderPreselectedCustomerId] = useState<string | null>(null);
  const [createdFromOrderFlow, setCreatedFromOrderFlow] = useState(false);
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  const [isAddCostOpen, setIsAddCostOpen] = useState(false);
  const [isNewCustomerOpen, setIsNewCustomerOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null);
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState<string | null>(null);

  // Message Sender Modal State
  const [messageModalState, setMessageModalState] = useState<{
    isOpen: boolean;
    name: string;
    phone: string;
    message: string;
  }>({
    isOpen: false,
    name: '',
    phone: '',
    message: '',
  });

  // Sync document CSS variables with stored theme on load and change
  useEffect(() => {
    let themeToApply = shopProfile.businessTheme;
    if (!themeToApply) {
      themeToApply = generateAccessibleTheme(
        shopProfile.logoUrl || SAMPLE_ATELIER_LOGOS[1].url,
        [shopProfile.brandAccent || '#885000', '#a6681c', '#fdbd72']
      );
    }
    applyThemeToDocument(themeToApply, shopProfile.theme === 'dark');
  }, [shopProfile.businessTheme, shopProfile.theme, shopProfile.logoUrl, shopProfile.brandAccent]);

  // LocalStorage sync effects
  useEffect(() => {
    localStorage.setItem('atelieros_profile', JSON.stringify(shopProfile));
  }, [shopProfile]);

  useEffect(() => {
    localStorage.setItem('atelieros_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('atelieros_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('atelieros_partners', JSON.stringify(partners));
  }, [partners]);

  useEffect(() => {
    localStorage.setItem('atelieros_invoices', JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem('atelieros_reminders', JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => {
    localStorage.setItem('atelieros_inventory', JSON.stringify(inventory));
  }, [inventory]);

  // Keep selectedOrder in sync with orders list
  useEffect(() => {
    if (selectedOrder) {
      const fresh = orders.find((o) => o.id === selectedOrder.id);
      if (fresh) setSelectedOrder(fresh);
    }
  }, [orders]);

  // Handler functions
  const handleExportExcel = () => {
    exportAllDataToExcel({ orders, customers, partners, invoices, inventory, shopProfile });
  };

  const handleSelectOrder = (order: Order) => {
    setPreviousView(currentView !== 'order_details' ? currentView : 'dashboard');
    setSelectedOrder(order);
    setCurrentView('order_details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateOrder = (updatedOrder: Order) => {
    setOrders((prev) => prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o)));
    setSelectedOrder(updatedOrder);

    // Update customer total balance if payment changed
    updateCustomerBalance(updatedOrder.customerId);
  };

  const handleDeleteOrder = (orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    if (selectedOrder?.id === orderId) {
      setSelectedOrder(null);
      setCurrentView(previousView || 'dashboard');
    }
  };

  const handleCreateOrder = (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);

    // Update customer total order count and balance
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === newOrder.customerId) {
          const remaining = Math.max(0, newOrder.price - newOrder.paid);
          return {
            ...c,
            totalOrders: c.totalOrders + 1,
            balance: c.balance + remaining,
          };
        }
        return c;
      })
    );

    // Add fitting reminder
    const newRem: ReminderItem = {
      id: `rem-${Date.now()}`,
      title: `${newOrder.customerName} - ${newOrder.itemType} Fitting`,
      description: `First fitting session for order ${newOrder.orderNumber}`,
      dueDate: newOrder.dueDate,
      type: 'fitting',
      completed: false,
      recipientName: newOrder.customerName,
      recipientPhone: newOrder.customerPhone,
      orderId: newOrder.id,
    };
    setReminders((prev) => [newRem, ...prev]);

    // Automatically navigate to the newly created order details
    handleSelectOrder(newOrder);
  };

  const handleAddPayment = (orderId: string, log: PaymentLog) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          const newPaid = o.paid + log.amount;
          return {
            ...o,
            paid: newPaid,
            status: newPaid >= o.price ? 'Ready' : o.status,
            paymentLogs: [...o.paymentLogs, log],
          };
        }
        return o;
      })
    );
  };

  const handleAddCost = (orderId: string, cost: OrderCost) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          return {
            ...o,
            costs: [...o.costs, cost],
          };
        }
        return o;
      })
    );

    // If partner is assigned, update partner's balance owed
    if (cost.partnerId && cost.status === 'Unpaid') {
      setPartners((prev) =>
        prev.map((p) =>
          p.id === cost.partnerId
            ? { ...p, balanceOwed: p.balanceOwed + cost.amount }
            : p
        )
      );
    }
  };

  const updateCustomerBalance = (customerId: string) => {
    const custOrders = orders.filter((o) => o.customerId === customerId);
    const balance = custOrders.reduce((acc, o) => acc + Math.max(0, o.price - o.paid), 0);
    setCustomers((prev) =>
      prev.map((c) => (c.id === customerId ? { ...c, balance } : c))
    );
  };

  const handleSaveCustomer = (customer: Customer) => {
    setCustomers((prev) => {
      const exists = prev.some((c) => c.id === customer.id);
      if (exists) {
        return prev.map((c) => (c.id === customer.id ? customer : c));
      }
      return [customer, ...prev];
    });
    setCustomerToEdit(null);
    setIsNewCustomerOpen(false);

    // If customer was created from the "Create New Order" workflow, proceed directly to order & measurements
    if (createdFromOrderFlow) {
      setCreatedFromOrderFlow(false);
      setNewOrderPreselectedCustomerId(customer.id);
      setIsNewOrderOpen(true);
    }
  };

  const handleDeleteCustomer = (customerId: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== customerId));
  };

  const handleSettleInvoice = (invoiceId: string) => {
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === invoiceId ? { ...inv, status: 'Paid' } : inv))
    );
  };

  const handleSettlePartnerBalance = (partnerId: string, amount: number) => {
    setPartners((prev) =>
      prev.map((p) =>
        p.id === partnerId
          ? {
              ...p,
              balanceOwed: Math.max(0, p.balanceOwed - amount),
              totalPaid: p.totalPaid + amount,
            }
          : p
      )
    );
  };

  const handleAddReminder = (item: ReminderItem) => {
    setReminders((prev) => [item, ...prev]);
  };

  const handleToggleReminder = (reminderId: string) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === reminderId ? { ...r, completed: !r.completed } : r))
    );
  };

  const handleDeleteReminder = (reminderId: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== reminderId));
  };

  const handleOpenMessageSender = (name: string, phone: string, text: string) => {
    setMessageModalState({
      isOpen: true,
      name,
      phone,
      message: text,
    });
  };

  const unreadRemindersCount = reminders.filter((r) => !r.completed).length;

  // Render Public Showcase Landing if currentView === 'landing'
  if (currentView === 'landing') {
    return (
      <>
        <LandingPage
          onEnterApp={() => setCurrentView('dashboard')}
          onOpenAuth={(mode) => {
            if (mode === 'signup') {
              setIsOnboardingOpen(true);
            } else {
              setAuthMode('signin');
              setIsAuthOpen(true);
            }
          }}
        />
        <AuthModal
          isOpen={isAuthOpen}
          initialMode={authMode}
          onClose={() => setIsAuthOpen(false)}
          onSuccess={(profileUpdate) => {
            if (profileUpdate) {
              setShopProfile((prev) => ({ ...prev, ...profileUpdate }));
            }
            setCurrentView('dashboard');
          }}
        />
        <OnboardingFlow
          isOpen={isOnboardingOpen}
          initialShopProfile={shopProfile}
          onClose={() => setIsOnboardingOpen(false)}
          onComplete={(updated) => {
            setShopProfile(updated);
            setIsOnboardingOpen(false);
            setCurrentView('dashboard');
          }}
        />
      </>
    );
  }

  const activeOrdersCount = orders.filter(
    (o) => o.status !== 'Completed' && o.status !== 'Ready'
  ).length;

  return (
    <div className="min-h-screen bg-[#fff8f4] dark:bg-[#150f0b] text-[#211a15] dark:text-[#f7ebe1] flex flex-col font-sans selection:bg-[#a6681c] selection:text-white">
      {/* Navigation Shell (Sidebar Drawer + Header + Mobile Bottom Nav) */}
      <Navigation
        currentView={currentView}
        onNavigate={(view) => {
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenNewOrder={() => setIsNewOrderOpen(true)}
        shopProfile={shopProfile}
        unreadRemindersCount={unreadRemindersCount}
        activeOrdersCount={activeOrdersCount}
        onOpenLanding={() => setCurrentView('landing')}
        onSignOut={() => setCurrentView('landing')}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Content Area */}
      <main className="flex-1 md:pl-64 transition-all duration-200">
        {currentView === 'dashboard' && (
          <DashboardView
            orders={orders}
            invoices={invoices}
            shopProfile={shopProfile}
            onOpenNewOrder={() => setIsNewOrderOpen(true)}
            onSelectOrder={handleSelectOrder}
            onNavigateToOrders={(filter) => {
              if (filter) setOrdersFilter(filter);
              setCurrentView('orders');
            }}
            onNavigateToFinances={() => setCurrentView('finances')}
            onNavigateToPartners={() => setCurrentView('partners')}
            onExportExcel={handleExportExcel}
          />
        )}

        {currentView === 'orders' && (
          <OrdersView
            orders={orders}
            shopProfile={shopProfile}
            onOpenNewOrder={() => setIsNewOrderOpen(true)}
            onSelectOrder={handleSelectOrder}
            onUpdateOrderStatus={(orderId, newStatus) => {
              const target = orders.find((o) => o.id === orderId);
              if (target) {
                handleUpdateOrder({ ...target, status: newStatus });
              }
            }}
            onOpenMessageSender={handleOpenMessageSender}
            initialFilter={ordersFilter}
          />
        )}

        {currentView === 'order_details' && selectedOrder && (
          <OrderDetailsView
            order={selectedOrder}
            shopProfile={shopProfile}
            onBack={() => setCurrentView(previousView || 'dashboard')}
            onUpdateOrder={handleUpdateOrder}
            onDeleteOrder={handleDeleteOrder}
            onOpenAddPayment={() => setIsAddPaymentOpen(true)}
            onOpenAddCost={() => setIsAddCostOpen(true)}
            onOpenPhotoPreview={(url) => setPreviewPhotoUrl(url)}
            onOpenMessageSender={handleOpenMessageSender}
          />
        )}

        {currentView === 'customers' && (
          <CustomersView
            customers={customers}
            shopProfile={shopProfile}
            onOpenNewCustomer={() => {
              setCustomerToEdit(null);
              setIsNewCustomerOpen(true);
            }}
            onSelectCustomerOrders={(customerId) => {
              const custOrder = orders.find((o) => o.customerId === customerId);
              if (custOrder) {
                handleSelectOrder(custOrder);
              } else {
                setCurrentView('orders');
              }
            }}
            onEditCustomer={(customer) => {
              setCustomerToEdit(customer);
              setIsNewCustomerOpen(true);
            }}
            onDeleteCustomer={handleDeleteCustomer}
            onOpenMessageSender={handleOpenMessageSender}
          />
        )}

        {currentView === 'finances' && (
          <FinancesView
            orders={orders}
            customers={customers}
            partners={partners}
            invoices={invoices}
            inventory={inventory}
            shopProfile={shopProfile}
            onNavigateToPartners={() => setCurrentView('partners')}
            onNavigateToOrders={() => setCurrentView('orders')}
            onNavigateToInventory={() => setCurrentView('inventory')}
            onOpenMessageSender={handleOpenMessageSender}
          />
        )}

        {currentView === 'partners' && (
          <PartnersView
            partners={partners}
            invoices={invoices}
            shopProfile={shopProfile}
            onAddPartner={(p) => setPartners((prev) => [p, ...prev])}
            onSettleInvoice={handleSettleInvoice}
            onSettlePartnerBalance={handleSettlePartnerBalance}
          />
        )}

        {currentView === 'reminders' && (
          <RemindersView
            reminders={reminders}
            shopProfile={shopProfile}
            onAddReminder={handleAddReminder}
            onToggleReminder={handleToggleReminder}
            onDeleteReminder={handleDeleteReminder}
            onOpenMessageSender={handleOpenMessageSender}
          />
        )}

        {currentView === 'inventory' && (
          <InventoryView
            inventory={inventory}
            shopProfile={shopProfile}
            onAddInventory={(item) => setInventory((prev) => [item, ...prev])}
            onUpdateInventory={(item) =>
              setInventory((prev) => prev.map((i) => (i.id === item.id ? item : i)))
            }
          />
        )}

        {currentView === 'settings' && (
          <SettingsView
            shopProfile={shopProfile}
            onUpdateProfile={(updated) => setShopProfile(updated)}
            onSignOut={() => setCurrentView('landing')}
            onExportExcel={handleExportExcel}
          />
        )}
      </main>

      {/* Global Modals */}
      <NewOrderModal
        isOpen={isNewOrderOpen}
        customers={customers}
        shopProfile={shopProfile}
        preselectedCustomerId={newOrderPreselectedCustomerId}
        onClose={() => {
          setIsNewOrderOpen(false);
          setNewOrderPreselectedCustomerId(null);
          setCreatedFromOrderFlow(false);
        }}
        onCreateOrder={handleCreateOrder}
        onOpenNewCustomer={() => {
          setIsNewOrderOpen(false);
          setCreatedFromOrderFlow(true);
          setIsNewCustomerOpen(true);
        }}
      />

      <AddPaymentModal
        isOpen={isAddPaymentOpen}
        order={selectedOrder}
        shopProfile={shopProfile}
        onClose={() => setIsAddPaymentOpen(false)}
        onAddPayment={handleAddPayment}
      />

      <AddCostModal
        isOpen={isAddCostOpen}
        order={selectedOrder}
        partners={partners}
        shopProfile={shopProfile}
        onClose={() => setIsAddCostOpen(false)}
        onAddCost={handleAddCost}
      />

      <NewCustomerModal
        isOpen={isNewCustomerOpen}
        customerToEdit={customerToEdit}
        onClose={() => {
          setIsNewCustomerOpen(false);
          setCustomerToEdit(null);
          if (createdFromOrderFlow) {
            // If the user cancelled adding a customer during the order flow, return them back to New Order modal
            setIsNewOrderOpen(true);
            setCreatedFromOrderFlow(false);
          }
        }}
        onSaveCustomer={handleSaveCustomer}
      />

      <PhotoPreviewModal
        photoUrl={previewPhotoUrl}
        onClose={() => setPreviewPhotoUrl(null)}
      />

      <MessageSenderModal
        isOpen={messageModalState.isOpen}
        recipientName={messageModalState.name}
        recipientPhone={messageModalState.phone}
        defaultMessage={messageModalState.message}
        onClose={() => setMessageModalState((prev) => ({ ...prev, isOpen: false }))}
      />

      <AuthModal
        isOpen={isAuthOpen}
        initialMode={authMode}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={(profileUpdate) => {
          if (profileUpdate) {
            setShopProfile((prev) => ({ ...prev, ...profileUpdate }));
          }
          setCurrentView('dashboard');
        }}
      />

      <OnboardingFlow
        isOpen={isOnboardingOpen}
        initialShopProfile={shopProfile}
        onClose={() => setIsOnboardingOpen(false)}
        onComplete={(updated) => {
          setShopProfile(updated);
          setIsOnboardingOpen(false);
          setCurrentView('dashboard');
        }}
      />
    </div>
  );
}
