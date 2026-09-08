'use client';

import { useState } from 'react';
import { Building2, LoaderCircle, Power, X } from 'lucide-react';
import { toggleTenantStatus } from './actions';

type Tenant = {
  id: string;
  name: string;
  email: string | null;
  primaryUser: string | null;
  isActive: boolean;
  createdAt: string;
};

export function TenantDirectory({ tenants: initialTenants }: { tenants: Tenant[] }) {
  const [tenants, setTenants] = useState(initialTenants);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const showNotice = (nextNotice: { type: 'success' | 'error'; message: string }) => {
    setNotice(nextNotice);
    window.setTimeout(() => setNotice(null), 4000);
  };

  const confirmStatusChange = async () => {
    if (!selectedTenant) return;
    setIsUpdating(true);
    const result = await toggleTenantStatus(selectedTenant.id);
    setIsUpdating(false);

    if ('error' in result) {
      showNotice({ type: 'error', message: result.error });
      return;
    }

    setTenants((current) => current.map((tenant) => (
      tenant.id === result.tenant.id ? { ...tenant, isActive: result.tenant.isActive } : tenant
    )));
    setSelectedTenant(null);
    showNotice({
      type: 'success',
      message: `${result.tenant.name} is now ${result.tenant.isActive ? 'active' : 'inactive'}.`,
    });
  };

  return (
    <section className="mb-8 rounded-lg border border-[#d7c3b2]/50 dark:border-[#524438] bg-white dark:bg-[#1c1510]">
      <div className="flex flex-col gap-2 border-b border-[#d7c3b2]/50 dark:border-[#524438] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-headline text-lg font-bold">Tenant workspaces</h2>
          <p className="mt-0.5 text-sm text-[#524438] dark:text-[#d7c3b2]">Deactivate a workspace to immediately block its data access.</p>
        </div>
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[#fff1e7] px-2.5 py-1 text-xs font-semibold text-[#784a05] dark:bg-[#33261c] dark:text-[#ffb86d]">
          <Building2 className="h-3.5 w-3.5" /> {tenants.length} total
        </span>
      </div>

      {notice && (
        <div role="status" className={`mx-5 mt-4 rounded-md border px-3 py-2 text-sm ${notice.type === 'error' ? 'border-[#ba1a1a]/30 bg-[#ba1a1a]/10 text-[#ba1a1a] dark:text-[#ffb4ab]' : 'border-green-700/20 bg-green-700/10 text-green-800 dark:text-green-200'}`}>
          {notice.message}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-[#d7c3b2]/50 dark:border-[#524438] text-xs font-bold uppercase text-[#524438] dark:text-[#d7c3b2]">
            <tr>
              <th className="px-5 py-3">Atelier name</th>
              <th className="px-5 py-3">Created date</th>
              <th className="px-5 py-3">Primary user / email</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#d7c3b2]/30 dark:divide-[#524438]">
            {tenants.map((tenant) => (
              <tr key={tenant.id} className="text-[#211a15] dark:text-[#f7ebe1]">
                <td className="px-5 py-4 font-semibold">{tenant.name}</td>
                <td className="px-5 py-4 text-[#524438] dark:text-[#d7c3b2]">{new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(tenant.createdAt))}</td>
                <td className="px-5 py-4">
                  <p>{tenant.primaryUser || 'Owner'}</p>
                  <p className="mt-0.5 text-xs text-[#524438] dark:text-[#d7c3b2]">{tenant.email || 'No email'}</p>
                </td>
                <td className="px-5 py-4">
                  <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${tenant.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200'}`}>
                    {tenant.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-5 py-4 text-right">
                  <button type="button" onClick={() => setSelectedTenant(tenant)} className={`inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold transition-colors ${tenant.isActive ? 'border border-red-200 bg-red-50 text-red-800 hover:bg-red-100 dark:border-red-900/60 dark:bg-red-900/20 dark:text-red-200' : 'bg-green-700 text-white hover:bg-green-800'}`}>
                    <Power className="h-3.5 w-3.5" /> {tenant.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
            {tenants.length === 0 && (
              <tr><td colSpan={5} className="px-5 py-8 text-center text-[#524438] dark:text-[#d7c3b2]">No tenant workspaces found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedTenant && (
        <div role="dialog" aria-modal="true" aria-labelledby="tenant-confirmation-title" className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-lg border border-[#d7c3b2]/50 bg-white p-6 shadow-xl dark:border-[#524438] dark:bg-[#1c1510]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 id="tenant-confirmation-title" className="font-headline text-lg font-bold">{selectedTenant.isActive ? 'Deactivate' : 'Activate'} {selectedTenant.name}?</h3>
                <p className="mt-2 text-sm text-[#524438] dark:text-[#d7c3b2]">
                  {selectedTenant.isActive
                    ? 'This will immediately lock the workspace out of all read and write access.'
                    : 'This will restore the workspace’s access to its data.'}
                </p>
              </div>
              <button type="button" onClick={() => !isUpdating && setSelectedTenant(null)} aria-label="Close confirmation" className="rounded p-1 text-[#524438] hover:bg-[#fff1e7] dark:text-[#d7c3b2] dark:hover:bg-[#33261c]"><X className="h-5 w-5" /></button>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setSelectedTenant(null)} disabled={isUpdating} className="rounded-md border border-[#d7c3b2] px-4 py-2 text-sm font-semibold disabled:opacity-60 dark:border-[#524438]">Cancel</button>
              <button type="button" onClick={confirmStatusChange} disabled={isUpdating} className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 ${selectedTenant.isActive ? 'bg-[#ba1a1a] hover:bg-red-800' : 'bg-green-700 hover:bg-green-800'}`}>
                {isUpdating && <LoaderCircle className="h-4 w-4 animate-spin" />}
                {selectedTenant.isActive ? 'Deactivate workspace' : 'Activate workspace'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
