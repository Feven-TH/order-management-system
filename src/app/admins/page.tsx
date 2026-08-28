import Link from 'next/link';
import { ShieldCheck, Trash2, UserPlus } from 'lucide-react';
import { requireSuperadmin } from '@/lib/auth/guards';
import { createClient } from '@/lib/supabase/server';
import { inviteAdmin, inviteTenantOwner, removeAdmin } from './actions';

export const dynamic = 'force-dynamic';

interface AdminsPageProps {
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
}

export default async function AdminsPage({ searchParams }: AdminsPageProps) {
  const currentAdmin = await requireSuperadmin();
  const params = await searchParams;
  const supabase = await createClient();
  const { data: admins = [] } = await supabase
    .from('admin_profiles')
    .select('id, email, full_name, role, active, created_at')
    .order('created_at', { ascending: false });

  return (
    <main className="min-h-screen bg-[#fff8f4] dark:bg-[#150f0b] text-[#211a15] dark:text-[#f7ebe1]">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/"
              className="text-sm font-semibold text-[#885000] dark:text-[#ffb86d] hover:underline"
            >
              Back to workspace
            </Link>
            <h1 className="mt-3 font-headline text-3xl font-bold tracking-tight">
              Admins
            </h1>
            <p className="mt-1 text-sm text-[#524438] dark:text-[#d7c3b2]">
              Only superadmins can invite or remove admins.
            </p>
          </div>
          <div className="inline-flex w-fit items-center gap-2 rounded-md border border-[#d7c3b2] dark:border-[#524438] bg-white dark:bg-[#1c1510] px-3 py-2 text-sm">
            <ShieldCheck className="h-4 w-4 text-[#885000] dark:text-[#ffb86d]" />
            {currentAdmin.email}
          </div>
        </div>

        {params.message && (
          <div className="mb-5 rounded-md border border-green-700/20 bg-green-700/10 px-3 py-2 text-sm text-green-800 dark:text-green-200">
            {params.message}
          </div>
        )}

        {params.error && (
          <div className="mb-5 rounded-md border border-[#ba1a1a]/30 bg-[#ba1a1a]/10 px-3 py-2 text-sm text-[#ba1a1a] dark:text-[#ffb4ab]">
            {params.error}
          </div>
        )}

        <section className="mb-8 rounded-lg border border-[#d7c3b2]/50 dark:border-[#524438] bg-white dark:bg-[#1c1510] p-5">
          <h2 className="font-headline text-lg font-bold">Create tenant owner</h2>
          <p className="mt-1 text-sm text-[#524438] dark:text-[#d7c3b2]">
            Sends an invite and creates a separate business workspace. This person is not a platform admin.
          </p>
          <form action={inviteTenantOwner} className="mt-4 grid gap-3 sm:grid-cols-2">
            <input
              name="business_name"
              type="text"
              required
              placeholder="Business name"
              className="rounded-md border border-[#d7c3b2] dark:border-[#524438] bg-[#fff8f4] dark:bg-[#241a13] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#a6681c]"
            />
            <input
              name="email"
              type="email"
              required
              placeholder="owner@example.com"
              className="rounded-md border border-[#d7c3b2] dark:border-[#524438] bg-[#fff8f4] dark:bg-[#241a13] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#a6681c]"
            />
            <input
              name="full_name"
              type="text"
              placeholder="Owner name (optional)"
              className="rounded-md border border-[#d7c3b2] dark:border-[#524438] bg-[#fff8f4] dark:bg-[#241a13] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#a6681c]"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-[#885000] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#6d3e00]"
            >
              <UserPlus className="h-4 w-4" />
              Create tenant
            </button>
          </form>
        </section>

        <section className="mb-8 rounded-lg border border-[#d7c3b2]/50 dark:border-[#524438] bg-white dark:bg-[#1c1510] p-5">
          <h2 className="font-headline text-lg font-bold">Invite admin</h2>
          <p className="mt-1 text-sm text-[#524438] dark:text-[#d7c3b2]">
            Platform admins can manage this screen. Do not use this for shop owners.
          </p>
          <form action={inviteAdmin} className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
            <input
              name="email"
              type="email"
              required
              placeholder="admin@example.com"
              className="rounded-md border border-[#d7c3b2] dark:border-[#524438] bg-[#fff8f4] dark:bg-[#241a13] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#a6681c]"
            />
            <input
              name="full_name"
              type="text"
              placeholder="Full name"
              className="rounded-md border border-[#d7c3b2] dark:border-[#524438] bg-[#fff8f4] dark:bg-[#241a13] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#a6681c]"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-[#a6681c] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#885000]"
            >
              <UserPlus className="h-4 w-4" />
              Invite
            </button>
          </form>
        </section>

        <section className="overflow-hidden rounded-lg border border-[#d7c3b2]/50 dark:border-[#524438] bg-white dark:bg-[#1c1510]">
          <div className="grid grid-cols-[1fr_auto_auto] gap-3 border-b border-[#d7c3b2]/50 dark:border-[#524438] px-4 py-3 text-xs font-bold uppercase text-[#524438] dark:text-[#d7c3b2]">
            <span>Admin</span>
            <span>Role</span>
            <span>Action</span>
          </div>
          <div className="divide-y divide-[#d7c3b2]/50 dark:divide-[#524438]">
            {admins.map((admin) => (
              <div
                key={admin.id}
                className="grid grid-cols-[1fr_auto_auto] items-center gap-3 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{admin.email}</p>
                  <p className="truncate text-xs text-[#524438] dark:text-[#d7c3b2]">
                    {admin.full_name || 'No name'} {admin.active ? '' : '- inactive'}
                  </p>
                </div>
                <span className="rounded-md bg-[#fff1e7] dark:bg-[#33261c] px-2 py-1 text-xs font-semibold capitalize text-[#784a05] dark:text-[#ffb86d]">
                  {admin.role}
                </span>
                {admin.role === 'admin' ? (
                  <form action={removeAdmin}>
                    <input type="hidden" name="admin_id" value={admin.id} />
                    <button
                      type="submit"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[#ba1a1a] hover:bg-[#ba1a1a]/10"
                      title="Remove admin"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </form>
                ) : (
                  <span className="h-8 w-8" />
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
