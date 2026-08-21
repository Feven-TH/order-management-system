import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Phone,
  Mail,
  MapPin,
  Scissors,
  MessageCircle,
  Edit2,
  Trash2,
} from 'lucide-react';
import { Customer, ShopProfile } from '../types';

interface CustomersViewProps {
  customers: Customer[];
  shopProfile: ShopProfile;
  onOpenNewCustomer: () => void;
  onSelectCustomerOrders: (customerId: string) => void;
  onEditCustomer: (customer: Customer) => void;
  onDeleteCustomer: (customerId: string) => void;
  onOpenMessageSender: (name: string, phone: string, text: string) => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  customers,
  shopProfile,
  onOpenNewCustomer,
  onSelectCustomerOrders,
  onEditCustomer,
  onDeleteCustomer,
  onOpenMessageSender,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCustomers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        (c.address && c.address.toLowerCase().includes(q))
    );
  }, [customers, searchQuery]);

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-10 py-6 md:py-8 space-y-6 animate-fadeIn pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline text-2xl md:text-3xl font-bold text-[#211a15] dark:text-white">
            Clientele & CRM
          </h1>
          <p className="text-sm text-[#524438] dark:text-[#d7c3b2] mt-0.5">
            Manage your bespoke clientele, contact records, and measurement logs.
          </p>
        </div>

        <button
          onClick={onOpenNewCustomer}
          className="bg-[#a6681c] hover:bg-[#885000] text-white font-headline text-xs sm:text-sm font-semibold px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-lg shadow-sm flex items-center justify-center gap-1.5 sm:gap-2 active:scale-95 transition-all self-start sm:self-auto shrink-0 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Add Customer</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative w-full max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#847466]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search clients by name, phone, or address..."
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#241a13] border border-[#d7c3b2]/30 dark:border-[#524438] rounded-lg focus:border-[#a6681c] focus:ring-1 focus:ring-[#a6681c] outline-none text-sm text-[#211a15] dark:text-white shadow-sm"
        />
      </div>

      {/* Customers Cards Grid */}
      {filteredCustomers.length === 0 ? (
        <div className="bg-white dark:bg-[#241a13] border border-dashed border-[#d7c3b2]/40 rounded-xl p-12 text-center">
          <p className="text-sm text-[#524438] dark:text-[#d7c3b2]">
            No customers found matching your search.
          </p>
          <button
            onClick={onOpenNewCustomer}
            className="mt-3 bg-[#a6681c] text-white text-xs font-semibold px-4 py-2 rounded-lg"
          >
            Create Customer
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCustomers.map((customer) => (
            <div
              key={customer.id}
              className="bg-white dark:bg-[#241a13] border border-[#d7c3b2]/25 dark:border-[#524438] rounded-xl p-5 flex flex-col justify-between hover:shadow-md transition-all hover:border-[#a6681c]/50 group"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm border ${
                        customer.avatarColor || 'bg-[#fdbd72] text-[#784a05] border-[#a6681c]/30'
                      }`}
                    >
                      {customer.initials || customer.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-headline font-bold text-base text-[#211a15] dark:text-white group-hover:text-[#885000] transition-colors">
                        {customer.name}
                      </h3>
                      <p className="text-xs text-[#524438] dark:text-[#d7c3b2] flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-[#885000]" /> {customer.phone}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditCustomer(customer)}
                      className="p-1.5 rounded text-[#847466] hover:text-[#885000] hover:bg-[#fff1e7] transition-colors"
                      title="Edit Customer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Remove ${customer.name} from clientele?`)) {
                          onDeleteCustomer(customer.id);
                        }
                      }}
                      className="p-1.5 rounded text-[#847466] hover:text-[#ba1a1a] hover:bg-red-50 transition-colors"
                      title="Delete Customer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {customer.address && (
                  <p className="text-xs text-[#847466] dark:text-[#a08e80] flex items-center gap-1 mb-2">
                    <MapPin className="w-3 h-3 shrink-0" /> {customer.address}
                  </p>
                )}

                {customer.notes && (
                  <p className="text-xs text-[#524438] dark:text-[#d7c3b2] bg-[#fff8f4] dark:bg-[#1a120c] p-2.5 rounded-lg border border-[#d7c3b2]/20 mb-3 italic">
                    "{customer.notes}"
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-[#d7c3b2]/20 dark:border-[#524438]/40 flex items-center justify-between">
                <div className="text-xs">
                  <span className="text-[#847466]">Orders: </span>
                  <button
                    onClick={() => onSelectCustomerOrders(customer.id)}
                    className="font-bold text-[#211a15] dark:text-white hover:text-[#885000] hover:underline"
                  >
                    {customer.totalOrders} total
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-mono font-bold ${
                      customer.balance > 0
                        ? 'text-[#ba1a1a]'
                        : 'text-green-700 dark:text-green-400'
                    }`}
                  >
                    {customer.balance > 0
                      ? `${customer.balance.toLocaleString()} ${shopProfile.currency} Owed`
                      : '0.00 Balance'}
                  </span>

                  <button
                    onClick={() =>
                      onOpenMessageSender(
                        customer.name,
                        customer.phone,
                        `Hello ${customer.name}, greetings from ${shopProfile.name}.`
                      )
                    }
                    className="p-1.5 rounded-lg bg-green-50 text-green-800 hover:bg-green-100 transition-colors"
                    title="Send WhatsApp / SMS"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-green-700" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
