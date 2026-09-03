import React, { useState } from 'react';
import { ActiveView, ShopProfile } from '../types';
import {
  LayoutDashboard,
  Users,
  Handshake,
  DollarSign,
  Bell,
  Package,
  Settings,
  Plus,
  LogOut,
  Globe,
  UserCog,
  Menu,
  X,
  Shirt,
  Sparkles,
  Moon,
  Sun,
} from 'lucide-react';

interface NavigationProps {
  currentView: ActiveView;
  onNavigate: (view: ActiveView) => void;
  onOpenNewOrder: () => void;
  shopProfile: ShopProfile;
  unreadRemindersCount: number;
  activeOrdersCount?: number;
  onOpenLanding?: () => void;
  canManageAdmins?: boolean;
  onOpenAdmins?: () => void;
  onSignOut: () => void;
  onToggleTheme?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentView,
  onNavigate,
  onOpenNewOrder,
  shopProfile,
  unreadRemindersCount,
  activeOrdersCount,
  onOpenLanding,
  canManageAdmins,
  onOpenAdmins,
  onSignOut,
  onToggleTheme,
}) => {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const navItems: { id: ActiveView; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    {
      id: 'orders',
      label: 'Orders',
      icon: <Shirt className="w-5 h-5" />,
      badge: activeOrdersCount && activeOrdersCount > 0 ? activeOrdersCount : undefined,
    },
    { id: 'customers', label: 'Customers', icon: <Users className="w-5 h-5" /> },
    {
      id: 'reminders',
      label: 'Reminders',
      icon: <Bell className="w-5 h-5" />,
      badge: unreadRemindersCount > 0 ? unreadRemindersCount : undefined,
    },
    { id: 'inventory', label: 'Inventory', icon: <Package className="w-5 h-5" /> },
    { id: 'finances', label: 'Finances', icon: <DollarSign className="w-5 h-5" /> },
    { id: 'partners', label: 'Partners', icon: <Handshake className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  const handleMobileNavigate = (view: ActiveView) => {
    onNavigate(view);
    setMobileDrawerOpen(false);
  };

  return (
    <>
      {/* Desktop Sidebar Navigation Drawer */}
      <aside className="hidden md:flex flex-col h-screen py-6 bg-[#fff1e7] dark:bg-[#1a120c] text-[#211a15] dark:text-[#f7ebe1] w-64 fixed left-0 top-0 border-r border-[#d7c3b2]/30 transition-all duration-200 ease-in-out z-40">
        {/* Brand Header */}
        <div className="px-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#a6681c] text-white flex items-center justify-center font-bold text-sm overflow-hidden shadow-sm shrink-0 border border-[#a6681c]/30">
              {shopProfile.logoUrl ? (
                <img
                  src={shopProfile.logoUrl}
                  alt={shopProfile.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                'BM'
              )}
            </div>
            <div className="overflow-hidden">
              <h2 className="font-headline font-bold text-sm text-[#211a15] dark:text-white truncate">
                {shopProfile.name}
              </h2>
              <p className="text-xs text-[#524438] dark:text-[#d7c3b2]">Lead Tailor Atelier</p>
            </div>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#d7c3b2]/20">
            <span className="text-[11px] font-mono text-[#847466] dark:text-[#a08e80]">{shopProfile.version}</span>
            {onOpenLanding && (
              <button
                onClick={onOpenLanding}
                className="text-[11px] text-[#a6681c] hover:underline flex items-center gap-1"
                title="Visit Public Showcase Landing"
              >
                <Globe className="w-3 h-3" /> Showcase
              </button>
            )}
          </div>
        </div>

        {/* Quick Action */}
        <div className="px-4 mb-4">
          <button
            onClick={onOpenNewOrder}
            className="w-full bg-[#a6681c] hover:bg-[#885000] text-white font-headline text-sm font-semibold py-2.5 px-4 rounded-lg shadow-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Order</span>
          </button>
        </div>

        {/* Navigation Items */}
        <ul className="flex-1 flex flex-col gap-1 px-3 overflow-y-auto hide-scrollbar">
          {navItems.map((item) => {
            const isActive = currentView === item.id || (item.id === 'orders' && currentView === 'order_details');
            return (
              <li key={item.id}>
                <button
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 text-left ${
                    isActive
                      ? 'bg-[#fdbd72] dark:bg-[#845411] text-[#784a05] dark:text-white font-bold shadow-sm'
                      : 'text-[#524438] dark:text-[#d7c3b2] hover:bg-[#ede0d6]/60 dark:hover:bg-[#33261c]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive ? 'text-[#784a05] dark:text-white' : 'text-[#847466] dark:text-[#a08e80]'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className="bg-rose-400 text-white text-[11px] font-bold px-1.5 py-0.5 rounded-full shadow-2xs">
                      {item.badge}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        {/* Public Showcase & Sign Out Footer */}
        <div className="px-4 mt-auto pt-3 border-t border-[#d7c3b2]/20 space-y-2">
          {canManageAdmins && onOpenAdmins && (
            <button
              onClick={onOpenAdmins}
              className="w-full flex items-center justify-center gap-2 py-1.5 px-2.5 rounded-lg text-xs font-semibold text-[#885000] dark:text-[#ffb86d] bg-[#fff8f4] dark:bg-[#241a13] border border-[#d7c3b2]/30 hover:bg-[#ede0d6]/60 transition-colors"
            >
              <UserCog className="w-3.5 h-3.5" />
              <span>Manage platform</span>
            </button>
          )}

          {onOpenLanding && (
            <button
              onClick={onOpenLanding}
              className="w-full flex items-center justify-center gap-2 py-1.5 px-2.5 rounded-lg text-xs font-semibold text-[#885000] dark:text-[#ffb86d] bg-[#fff8f4] dark:bg-[#241a13] border border-[#d7c3b2]/30 hover:bg-[#ede0d6]/60 transition-colors"
              title="View Public Showcase Landing Page"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Public Landing Page</span>
            </button>
          )}

          <div className="flex items-center justify-between pt-1">
            <button
              onClick={() => onNavigate('settings')}
              className="flex items-center gap-2 text-xs text-[#524438] dark:text-[#d7c3b2] hover:text-[#a6681c] transition-colors truncate"
            >
              <span className="w-2 h-2 rounded-full bg-green-600 inline-block shrink-0"></span>
              <span className="truncate">{shopProfile.email}</span>
            </button>
            <div className="flex items-center gap-1">
              {onToggleTheme && (
                <button
                  onClick={onToggleTheme}
                  title={shopProfile.theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                  className="p-1.5 rounded text-[#847466] dark:text-[#d7c3b2] hover:text-[#885000] dark:hover:text-[#ffb86d] hover:bg-[#ede0d6] dark:hover:bg-[#33261c] transition-colors"
                >
                  {shopProfile.theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
              )}
              <button
                onClick={onSignOut}
                title="Sign Out to Landing"
                className="p-1.5 rounded text-[#847466] hover:text-[#ba1a1a] hover:bg-[#ede0d6] dark:hover:bg-[#33261c] transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Top App Bar for Desktop & Mobile */}
      <header className="bg-[#fff8f4] dark:bg-[#150f0b] border-b border-[#d7c3b2]/25 sticky top-0 z-30 md:pl-64 w-full">
        <div className="flex justify-between items-center w-full px-4 md:px-8 max-w-[1440px] mx-auto h-16 md:h-20">
          <div className="flex items-center gap-2.5">
            {/* Mobile Drawer Hamburger Button */}
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="md:hidden p-2 -ml-1.5 rounded-lg text-[#524438] dark:text-[#d7c3b2] hover:bg-[#ede0d6] dark:hover:bg-[#33261c] transition-colors relative"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
              {unreadRemindersCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-400 ring-2 ring-white dark:ring-[#150f0b]"></span>
              )}
            </button>

            <button
              onClick={() => onNavigate('dashboard')}
              className="flex items-center gap-2 group"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#a6681c] text-white flex items-center justify-center font-bold text-xs overflow-hidden border border-[#a6681c]/40 md:hidden">
                {shopProfile.logoUrl ? (
                  <img
                    src={shopProfile.logoUrl}
                    alt={shopProfile.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  'BM'
                )}
              </div>
              <span className="font-headline text-lg sm:text-xl md:text-2xl font-bold text-[#885000] dark:text-[#ffb86d] tracking-tight">
                AtelierOS
              </span>
            </button>
          </div>

          
          <div className="flex items-center gap-2 md:gap-3">
            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                title={shopProfile.theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                className="p-1.5 sm:p-2 rounded-full text-[#885000] dark:text-[#ffb86d] hover:bg-[#fff1e7] dark:hover:bg-[#2a2018] transition-colors"
                aria-label="Toggle dark/light theme"
              >
                {shopProfile.theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            )}
            <button
              onClick={onOpenNewOrder}
              title="Create New Order"
              aria-label="Create New Order"
              className="bg-[#a6681c] hover:bg-[#885000] text-white w-8 h-8 sm:w-10 sm:h-10 rounded-full shadow-sm flex items-center justify-center active:scale-95 duration-150 transition-all shrink-0"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
              <button
                onClick={() => onNavigate('settings')}
                className="p-1.5 sm:p-2 rounded-full text-[#885000] dark:text-[#ffb86d] hover:bg-[#fff1e7] dark:hover:bg-[#2a2018] transition-colors"
                title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Slide-Over Menu Drawer */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fadeIn"
            onClick={() => setMobileDrawerOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative w-4/5 max-w-xs bg-[#fff8f4] dark:bg-[#1a120c] text-[#211a15] dark:text-[#f7ebe1] h-full shadow-2xl flex flex-col z-10 border-r border-[#d7c3b2]/30 animate-slideRight">
            {/* Header */}
            <div className="p-5 border-b border-[#d7c3b2]/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#a6681c] text-white flex items-center justify-center font-bold text-sm overflow-hidden border border-[#a6681c]/30 shadow-xs">
                  {shopProfile.logoUrl ? (
                    <img
                      src={shopProfile.logoUrl}
                      alt={shopProfile.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    'BM'
                  )}
                </div>
                <div>
                  <h3 className="font-headline font-bold text-sm text-[#211a15] dark:text-white truncate">
                    {shopProfile.name}
                  </h3>
                  <p className="text-[11px] text-[#524438] dark:text-[#d7c3b2]">Atelier Management</p>
                </div>
              </div>

              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="p-1.5 rounded-full text-[#847466] dark:text-[#a08e80] hover:text-[#885000] dark:hover:text-[#ffb86d] hover:bg-[#ede0d6] dark:hover:bg-[#33261c] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Action in Mobile Drawer */}
            <div className="p-4">
              <button
                onClick={() => {
                  setMobileDrawerOpen(false);
                  onOpenNewOrder();
                }}
                className="w-full bg-[#a6681c] hover:bg-[#885000] text-white font-headline text-sm font-semibold py-2.5 px-4 rounded-lg shadow-sm flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Order</span>
              </button>
            </div>

            {/* Navigation List */}
            <ul className="flex-1 px-3 py-1 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const isActive = currentView === item.id;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => handleMobileNavigate(item.id)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-[#fdbd72] dark:bg-[#845411] text-[#784a05] dark:text-white font-bold shadow-xs'
                          : 'text-[#524438] dark:text-[#d7c3b2] hover:bg-[#ede0d6]/60 dark:hover:bg-[#33261c]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={isActive ? 'text-[#784a05] dark:text-white' : 'text-[#847466] dark:text-[#a08e80]'}>
                          {item.icon}
                        </span>
                        <span>{item.label}</span>
                      </div>
                      {item.badge !== undefined && (
                        <span className="bg-rose-400 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-2xs">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-[#d7c3b2]/20 space-y-2">
              {canManageAdmins && onOpenAdmins && (
                <button
                  onClick={() => {
                    setMobileDrawerOpen(false);
                    onOpenAdmins();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold text-[#885000] dark:text-[#ffb86d] bg-white dark:bg-[#241a13] border border-[#d7c3b2]/40 hover:bg-[#ede0d6] transition-colors shadow-2xs"
                >
                  <UserCog className="w-3.5 h-3.5" />
                  <span>Manage platform</span>
                </button>
              )}

              {onOpenLanding && (
                <button
                  onClick={() => {
                    setMobileDrawerOpen(false);
                    onOpenLanding();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold text-[#885000] dark:text-[#ffb86d] bg-white dark:bg-[#241a13] border border-[#d7c3b2]/40 hover:bg-[#ede0d6] transition-colors shadow-2xs"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Showcase Landing Page</span>
                </button>
              )}

              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => handleMobileNavigate('settings')}
                  className="flex items-center gap-2 text-xs text-[#524438] dark:text-[#d7c3b2] hover:text-[#a6681c] truncate"
                >
                  <span className="w-2 h-2 rounded-full bg-green-600 inline-block shrink-0"></span>
                  <span className="truncate">{shopProfile.email}</span>
                </button>
                <button
                  onClick={() => {
                    setMobileDrawerOpen(false);
                    onSignOut();
                  }}
                  title="Sign Out"
                  className="p-1.5 rounded text-[#847466] hover:text-[#ba1a1a] hover:bg-[#ede0d6] dark:hover:bg-[#33261c] transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar - 4 Primary Requested Sections */}
      <nav className="fixed bottom-0 left-0 w-full z-40 grid grid-cols-4 px-2 py-2 md:hidden bg-white dark:bg-[#150f0b] border-t border-[#d7c3b2]/30 dark:border-[#524438] shadow-lg pb-safe">
        <button
          onClick={() => onNavigate('dashboard')}
          className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all ${
            currentView === 'dashboard'
              ? 'bg-[#a6681c] text-white shadow-2xs'
              : 'text-[#524438] dark:text-[#d7c3b2] hover:bg-[#ede0d6]/40'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[11px] font-semibold mt-1">Dashboard</span>
        </button>

        <button
          onClick={() => onNavigate('orders')}
          className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all relative ${
            currentView === 'orders' || currentView === 'order_details'
              ? 'bg-[#a6681c] text-white shadow-2xs'
              : 'text-[#524438] dark:text-[#d7c3b2] hover:bg-[#ede0d6]/40'
          }`}
        >
          <Shirt className="w-5 h-5" />
          <span className="text-[11px] font-semibold mt-1">Orders</span>
          {activeOrdersCount !== undefined && activeOrdersCount > 0 && (
            <span className="absolute top-1 right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-[#885000] text-white text-[9px] font-bold flex items-center justify-center border border-white dark:border-[#150f0b]">
              {activeOrdersCount}
            </span>
          )}
        </button>

        <button
          onClick={() => onNavigate('customers')}
          className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all ${
            currentView === 'customers'
              ? 'bg-[#a6681c] text-white shadow-2xs'
              : 'text-[#524438] dark:text-[#d7c3b2] hover:bg-[#ede0d6]/40'
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[11px] font-semibold mt-1">Customers</span>
        </button>

        <button
          onClick={() => onNavigate('reminders')}
          className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all relative ${
            currentView === 'reminders'
              ? 'bg-[#a6681c] text-white shadow-2xs'
              : 'text-[#524438] dark:text-[#d7c3b2] hover:bg-[#ede0d6]/40'
          }`}
        >
          <Bell className="w-5 h-5" />
          <span className="text-[11px] font-semibold mt-1">Reminders</span>
          {unreadRemindersCount > 0 && (
            <span className="absolute top-1 right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-rose-400 text-white text-[9px] font-bold flex items-center justify-center border border-white dark:border-[#150f0b]">
              {unreadRemindersCount}
            </span>
          )}
        </button>
      </nav>
    </>
  );
};
