'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { requireSuperadmin } from '@/lib/auth/guards';
import { createAdminClient } from '@/lib/supabase/admin';

function adminsRedirect(params: Record<string, string>) {
  const query = new URLSearchParams(params);
  redirect(`/admins?${query.toString()}`);
}

export async function createAdmin(formData: FormData) {
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
