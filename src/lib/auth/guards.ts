import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export type AdminRole = 'superadmin' | 'admin';

export interface AdminProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: AdminRole;
  active: boolean;
}

export async function getCurrentAdmin(): Promise<AdminProfile | null> {
  const supabase = await createClient();
  const {
    data: { claims },
    error: claimsError,
  } = await supabase.auth.getClaims();

  if (claimsError || !claims?.sub) {
    return null;
  }

  const { data, error } = await supabase
    .from('admin_profiles')
    .select('id, email, full_name, role, active')
    .eq('id', claims.sub)
    .eq('active', true)
    .single();

  if (error || !data) {
    return null;
  }

  return data as AdminProfile;
}

export async function requireAdmin() {
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect('/login');
  }

  return admin;
}

export async function requireSuperadmin() {
  const admin = await requireAdmin();

  if (admin.role !== 'superadmin') {
    redirect('/');
  }

  return admin;
}
