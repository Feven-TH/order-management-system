'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { requireSuperadmin } from '@/lib/auth/guards';
import { requireTenant } from '@/lib/auth/tenant';
import { createAdminClient } from '@/lib/supabase/admin';

function adminsRedirect(params: Record<string, string>) {
  const query = new URLSearchParams(params);
  redirect(`/admins?${query.toString()}`);
}

export type ToggleTenantStatusResult =
  | { ok: true; tenant: { id: string; name: string; isActive: boolean } }
  | { ok: false; error: string };

/** Changes a tenant's access state without exposing the service-role key. */
export async function toggleTenantStatus(businessId: string): Promise<ToggleTenantStatusResult> {
  const currentTenant = await requireTenant();
  await requireSuperadmin();

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(businessId)) {
    return { ok: false, error: 'Invalid workspace identifier.' };
  }

  // Losing this workspace would also lock the currently signed-in superadmin
  // out of the directory, leaving no way to restore it from the application.
  if (businessId === currentTenant.businessId) {
    return { ok: false, error: 'You cannot deactivate the workspace attached to your current superadmin session.' };
  }

  const supabase = createAdminClient();
  const { data: target, error: targetError } = await supabase
    .from('businesses')
    .select('id, name, is_active')
    .eq('id', businessId)
    .single();

  if (targetError || !target) {
    return { ok: false, error: 'Workspace not found.' };
  }

  const { data: updated, error: updateError } = await supabase
    .from('businesses')
    .update({ is_active: !target.is_active })
    .eq('id', target.id)
    .select('id, name, is_active')
    .single();

  if (updateError || !updated) {
    return { ok: false, error: updateError?.message || 'Could not update workspace status.' };
  }

  revalidatePath('/admins');
  return {
    ok: true,
    tenant: { id: updated.id, name: updated.name, isActive: updated.is_active },
  };
}

export async function createAdmin(formData: FormData) {
  await requireTenant();
  await requireSuperadmin();

  const email = String(formData.get('email') || '').trim().toLowerCase();
  const fullName = String(formData.get('full_name') || '').trim();
  const password = String(formData.get('password') || '');

  if (!email || !password) {
    adminsRedirect({ error: 'Email and password are required' });
  }

  if (password.length < 8) {
    adminsRedirect({ error: 'Password must be at least 8 characters' });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName || null,
    },
  });

  if (error || !data.user) {
    adminsRedirect({ error: error?.message || 'Could not create admin' });
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
  adminsRedirect({ message: `Admin account created for ${email}` });
}

/** Creates a tenant owner without granting any platform-admin privileges. */
export async function createTenantOwner(formData: FormData) {
  await requireTenant();
  await requireSuperadmin();

  const businessName = String(formData.get('business_name') || '').trim();
  const email = String(formData.get('email') || '').trim().toLowerCase();
  const fullName = String(formData.get('full_name') || '').trim();
  const password = String(formData.get('password') || '');

  if (!businessName || !email || !password) {
    adminsRedirect({ error: 'Business name, email, and password are required' });
  }

  if (businessName.length > 120) {
    adminsRedirect({ error: 'Business name must be 120 characters or less' });
  }

  if (password.length < 8) {
    adminsRedirect({ error: 'Password must be at least 8 characters' });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      business_name: businessName,
      full_name: fullName || null,
    },
  });

  if (error || !data.user) {
    adminsRedirect({ error: error?.message || 'Could not create tenant owner' });
  }

  // The auth.users insert trigger creates the business, owner membership, and
  // default theme. Deliberately do not insert admin_profiles here.
  revalidatePath('/admins');
  adminsRedirect({ message: `Tenant owner account created for ${email}` });
}

export async function removeAdmin(formData: FormData) {
  await requireTenant();
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
