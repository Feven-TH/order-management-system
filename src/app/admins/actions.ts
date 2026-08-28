'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { requireSuperadmin } from '@/lib/auth/guards';
import { createAdminClient } from '@/lib/supabase/admin';
import { getAppUrl } from '@/lib/env';

function adminsRedirect(params: Record<string, string>) {
  const query = new URLSearchParams(params);
  redirect(`/admins?${query.toString()}`);
}

export async function inviteAdmin(formData: FormData) {
  await requireSuperadmin();

  const email = String(formData.get('email') || '').trim().toLowerCase();
  const fullName = String(formData.get('full_name') || '').trim();

  if (!email) {
    adminsRedirect({ error: 'Email is required' });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
    data: {
      full_name: fullName || null,
    },
    redirectTo: `${getAppUrl()}/auth/callback`,
  });

  if (error || !data.user) {
    adminsRedirect({ error: error?.message || 'Could not invite admin' });
  }

  const { error: profileError } = await supabase.from('admin_profiles').upsert({
    id: data.user.id,
    email,
    full_name: fullName || null,
    role: 'admin',
    active: true,
  });

  if (profileError) {
    adminsRedirect({ error: profileError.message });
  }

  revalidatePath('/admins');
  adminsRedirect({ message: `Invitation sent to ${email}` });
}

/** Creates a tenant owner without granting any platform-admin privileges. */
export async function inviteTenantOwner(formData: FormData) {
  await requireSuperadmin();

  const businessName = String(formData.get('business_name') || '').trim();
  const email = String(formData.get('email') || '').trim().toLowerCase();
  const fullName = String(formData.get('full_name') || '').trim();

  if (!businessName || !email) {
    adminsRedirect({ error: 'Business name and email are required' });
  }

  if (businessName.length > 120) {
    adminsRedirect({ error: 'Business name must be 120 characters or less' });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
    data: {
      business_name: businessName,
      full_name: fullName || null,
    },
    redirectTo: `${getAppUrl()}/auth/callback`,
  });

  if (error || !data.user) {
    adminsRedirect({ error: error?.message || 'Could not create tenant owner' });
  }

  // The auth.users insert trigger creates the business, owner membership, and
  // default theme. Deliberately do not insert admin_profiles here.
  revalidatePath('/admins');
  adminsRedirect({ message: `Tenant invitation sent to ${email}` });
}

export async function removeAdmin(formData: FormData) {
  const currentAdmin = await requireSuperadmin();
  const adminId = String(formData.get('admin_id') || '');

  if (!adminId) {
    adminsRedirect({ error: 'Missing admin id' });
  }

  if (adminId === currentAdmin.id) {
    adminsRedirect({ error: 'You cannot remove your own superadmin account' });
  }

  const supabase = createAdminClient();
  const { data: target, error: targetError } = await supabase
    .from('admin_profiles')
    .select('id, role')
    .eq('id', adminId)
    .single();

  if (targetError || !target) {
    adminsRedirect({ error: 'Admin not found' });
  }

  if (target.role === 'superadmin') {
    adminsRedirect({ error: 'Superadmin accounts must be changed manually in Supabase' });
  }

  const { error } = await supabase.auth.admin.deleteUser(adminId);

  if (error) {
    adminsRedirect({ error: error.message });
  }

  revalidatePath('/admins');
  adminsRedirect({ message: 'Admin removed' });
}
