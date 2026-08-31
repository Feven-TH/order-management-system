/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  ActiveView,
  Customer,
  InventoryItem,
  Order,
  OrderCost,
  OrderMaterial,
  Partner,
  PartnerInvoice,
  PaymentLog,
  ReminderItem,
  ShopProfile,
} from './types';
import {
  INITIAL_SHOP_PROFILE,
} from './data/initialData';
import { Navigation } from './components/Navigation';
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
} from './utils/themeGenerator';

type AppProps = {
  businessName: string;
  userEmail: string;
  canManageAdmins: boolean;
};

export default function App({ businessName, userEmail, canManageAdmins }: AppProps) {
  // Navigation & View State
  const [currentView, setCurrentView] = useState<ActiveView>('dashboard');
  const [previousView, setPreviousView] = useState<ActiveView>('dashboard');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [ordersFilter, setOrdersFilter] = useState<string>('All Orders');

  // Workspace state is intentionally not kept in browser localStorage. Browser
  // storage is shared by accounts on the same device and is not a tenant-safe
  // persistence layer. Persisted records belong in the RLS-protected database.
  const [shopProfile, setShopProfile] = useState<ShopProfile>(() => {
    return {
      ...INITIAL_SHOP_PROFILE,
      name: businessName,
      email: userEmail || INITIAL_SHOP_PROFILE.email,
      theme: 'dark',
    };
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
        updated.logoUrl,
        [updated.brandAccent || '#885000', '#a6681c', '#fdbd72']
      );
    }
    applyThemeToDocument(themeToApply, nextTheme === 'dark');
  };

  const [orders, setOrders] = useState<Order[]>([]);

  const [customers, setCustomers] = useState<Customer[]>([]);

  const [partners, setPartners] = useState<Partner[]>([]);

  const [invoices, setInvoices] = useState<PartnerInvoice[]>([]);

  const [reminders, setReminders] = useState<ReminderItem[]>([]);

  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [workspaceLoaded, setWorkspaceLoaded] = useState(false);
  const [workspaceNotice, setWorkspaceNotice] = useState<string | null>(null);
  const workspaceMutationQueue = useRef<Promise<void>>(Promise.resolve());

  const persistWorkspaceChange = <T = { ok: true }>(action: string, payload: unknown): Promise<T | null> => {
    const request = async (): Promise<T | null> => {
      try {
        const response = await fetch('/api/workspace', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action, payload }),
        });

        // Supabase mutations may correctly return no rows. The route's HTTP
        // status is the acknowledgement here, not a response data payload.
        if (response.ok) {
          return (await response.json().catch(() => ({ ok: true }))) as T;
        }

        const body = await response.json().catch(() => null);
        throw new Error(body?.error || `The database did not accept this change (HTTP ${response.status})`);
      } catch (error) {
        console.error('Workspace save failed', { action, error });
        setWorkspaceNotice('Could not sync this change. Please try again.');
        return null;
      }
    };

    // Several saves have database dependencies (for example, a reminder
    // references a newly-created order). Queue requests in UI order so a
    // dependent mutation cannot reach Supabase before its parent row exists.
    const queuedRequest = workspaceMutationQueue.current.then(request, request);
    workspaceMutationQueue.current = queuedRequest.then(
      () => undefined,
      () => undefined
    );
    return queuedRequest;
  };

  useEffect(() => {
    let cancelled = false;

    async function loadWorkspace() {
      try {
        const response = await fetch('/api/workspace', { cache: 'no-store' });
        if (!response.ok) throw new Error('Could not load workspace');
        const data = await response.json();
        if (cancelled) return;
        setShopProfile(data.shopProfile);
        setOrders(data.orders || []);
        setCustomers(data.customers || []);
        setPartners(data.partners || []);
        setInvoices(data.invoices || []);
        setReminders(data.reminders || []);
        setInventory(data.inventory || []);
      } catch (error) {
        console.error('Workspace load failed', error);
        if (!cancelled) {
          setWorkspaceNotice('Could not load the latest workspace data. Please refresh and try again.');
        }
      } finally {
        if (!cancelled) setWorkspaceLoaded(true);
      }
    }

    void loadWorkspace();
    return () => { cancelled = true; };
  }, []);

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
        shopProfile.logoUrl,
        [shopProfile.brandAccent || '#885000', '#a6681c', '#fdbd72']
      );
    }
    applyThemeToDocument(themeToApply, shopProfile.theme === 'dark');
  }, [shopProfile.businessTheme, shopProfile.theme, shopProfile.logoUrl, shopProfile.brandAccent]);

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
    void persistWorkspaceChange('save_order', updatedOrder);

    // Update customer total balance if payment changed
    updateCustomerBalance(updatedOrder.customerId);
  };

  const handleDeleteOrder = (orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    if (selectedOrder?.id === orderId) {
      setSelectedOrder(null);
      setCurrentView(previousView || 'dashboard');
    }
    void (async () => {
      const result = await persistWorkspaceChange<{
        ok: true;
        restoredMaterials: { materialId: string; quantityUsed: number }[];
      }>('delete_order', { id: orderId });

      if (!result?.restoredMaterials) return;
      const restoredByMaterial = result.restoredMaterials.reduce<Record<string, number>>(
        (totals, material) => ({
          ...totals,
          [material.materialId]: (totals[material.materialId] || 0) + Number(material.quantityUsed),
        }),
        {}
      );
      setInventory((prev) =>
        prev.map((item) => {
          const restored = restoredByMaterial[item.id];
          return restored ? { ...item, stock: item.stock + restored } : item;
        })
      );
    })();
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
      id: crypto.randomUUID(),
      title: `${newOrder.customerName} - ${newOrder.itemType} Fitting`,
      description: `First fitting session for order ${newOrder.orderNumber}`,
      dueDate: newOrder.dueDate,
      type: 'fitting',
      completed: false,
      recipientName: newOrder.customerName,
      recipientPhone: newOrder.customerPhone,
      orderId: newOrder.id,
    };
    void (async () => {
      const orderSaved = await persistWorkspaceChange('save_order', newOrder);
      if (!orderSaved) return;

      setReminders((prev) => [newRem, ...prev]);
      await persistWorkspaceChange('save_reminder', newRem);
    })();

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
    void persistWorkspaceChange('add_payment', { orderId, payment: log });
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
    void persistWorkspaceChange('add_cost', { orderId, cost });

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

  const handleAddOrderMaterial = async (orderId: string, materialId: string, quantityUsed: number) => {
    const inventoryItem = inventory.find((item) => item.id === materialId);
    if (!inventoryItem || quantityUsed <= 0 || quantityUsed > inventoryItem.stock) {
      setWorkspaceNotice('Choose an in-stock material and a quantity within the available inventory.');
      return false;
    }

    const result = await persistWorkspaceChange<{
      ok: true;
      material: OrderMaterial & { availableStock: number };
    }>('add_order_material', { orderId, materialId, quantityUsed });

    if (!result?.material) return false;
    const material = {
      ...result.material,
      quantityUsed: Number(result.material.quantityUsed),
      unitCost: Number(result.material.unitCost),
      totalCost: Number(result.material.totalCost),
    };
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, materials: [...order.materials, material] } : order
      )
    );
    setInventory((prev) =>
      prev.map((item) =>
        item.id === material.materialId ? { ...item, stock: Number(result.material.availableStock) } : item
      )
    );
    return true;
  };

  const handleRemoveOrderMaterial = async (orderId: string, orderMaterialId: string) => {
    const result = await persistWorkspaceChange<{
      ok: true;
      restoredMaterial: { materialId: string; availableStock: number };
    }>('remove_order_material', { orderMaterialId });

    if (!result?.restoredMaterial) return false;
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? { ...order, materials: order.materials.filter((material) => material.id !== orderMaterialId) }
          : order
      )
    );
    setInventory((prev) =>
      prev.map((item) =>
        item.id === result.restoredMaterial.materialId
          ? { ...item, stock: Number(result.restoredMaterial.availableStock) }
          : item
      )
    );
    return true;
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
    void persistWorkspaceChange('save_customer', customer);

    // If customer was created from the "Create New Order" workflow, proceed directly to order & measurements
    if (createdFromOrderFlow) {
      setCreatedFromOrderFlow(false);
      setNewOrderPreselectedCustomerId(customer.id);
      setIsNewOrderOpen(true);
    }
  };

  const handleDeleteCustomer = (customerId: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== customerId));
    void persistWorkspaceChange('delete_customer', { id: customerId });
  };

  const handleSettleInvoice = (invoiceId: string) => {
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === invoiceId ? { ...inv, status: 'Paid' } : inv))
    );
    void persistWorkspaceChange('settle_invoice', { id: invoiceId });
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
    void persistWorkspaceChange('settle_partner_balance', { id: partnerId, amount });
  };

  const handleAddReminder = (item: ReminderItem) => {
    setReminders((prev) => [item, ...prev]);
    void persistWorkspaceChange('save_reminder', item);
  };

  const handleToggleReminder = (reminderId: string) => {
    const reminder = reminders.find((item) => item.id === reminderId);
    if (!reminder) return;
    const completed = !reminder.completed;
    setReminders((prev) => prev.map((r) => (r.id === reminderId ? { ...r, completed } : r)));
    void persistWorkspaceChange('toggle_reminder', { id: reminderId, completed });
  };

  const handleDeleteReminder = (reminderId: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== reminderId));
    void persistWorkspaceChange('delete_reminder', { id: reminderId });
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

  const activeOrdersCount = orders.filter(
    (o) => o.status !== 'Completed' && o.status !== 'Ready'
  ).length;

  if (!workspaceLoaded) {
    return (
      <main className="min-h-screen grid place-items-center bg-[#fff8f4] dark:bg-[#150f0b] text-[#524438] dark:text-[#d7c3b2]">
        Loading your business workspace…
      </main>
    );
  }

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
        canManageAdmins={canManageAdmins}
        onOpenAdmins={() => {
          window.location.href = '/admins';
        }}
        onSignOut={() => {
          window.location.href = '/logout';
        }}
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
            onOpenMessageSender={(recipient) =>
              handleOpenMessageSender(
                recipient.name,
                recipient.phone,
                recipient.context || `Hello ${recipient.name}, this is a quick update about your order.`
              )
            }
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
            inventory={inventory}
            onAddMaterial={handleAddOrderMaterial}
            onRemoveMaterial={handleRemoveOrderMaterial}
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
            onAddPartner={(partner) => {
              setPartners((prev) => [partner, ...prev]);
              void persistWorkspaceChange('save_partner', partner);
            }}
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
            orders={orders}
            shopProfile={shopProfile}
            onAddInventory={(item) => {
              setInventory((prev) => [item, ...prev]);
              void persistWorkspaceChange('save_inventory', item);
            }}
            onUpdateInventory={(item) => {
              setInventory((prev) => prev.map((i) => (i.id === item.id ? item : i)));
              void persistWorkspaceChange('save_inventory', item);
            }}
          />
        )}

        {currentView === 'settings' && (
          <SettingsView
            shopProfile={shopProfile}
            onUpdateProfile={(updated) => {
              setShopProfile(updated);
              void persistWorkspaceChange('save_profile', updated);
            }}
            onSignOut={() => {
              window.location.href = '/logout';
            }}
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

      {workspaceNotice && (
        <div
          role="alert"
          className="fixed right-4 bottom-4 z-[100] flex max-w-sm items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950 shadow-lg dark:border-amber-800 dark:bg-[#33261c] dark:text-amber-100"
        >
          <p>{workspaceNotice}</p>
          <button
            type="button"
            onClick={() => setWorkspaceNotice(null)}
            className="-mr-1 -mt-1 p-1 text-amber-800 hover:text-amber-950 dark:text-amber-200 dark:hover:text-white"
            aria-label="Dismiss notification"
          >
            ×
          </button>
        </div>
      )}

    </div>
  );
}
