import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export type BusinessRole = 'owner' | 'member';

export interface TenantContext {
  userId: string;
  businessId: string;
  businessName: string;
  email: string;
  role: BusinessRole;
}

/**
 * The sole tenant-resolution boundary for server-rendered pages, route
 * handlers, and server actions. The business is derived from auth.uid() via
 * business_members; request input is never considered authoritative.
 */
export async function getCurrentTenant(): Promise<TenantContext | null> {
  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const claims = claimsData?.claims;

  if (claimsError || !claims?.sub) {
    return null;
  }

  const { data: membership, error: membershipError } = await supabase
    .from('business_members')
    .select('business_id, role')
    .eq('user_id', claims.sub)
    .single();

  if (membershipError || !membership) {
    return null;
  }

  const { data: business, error: businessError } = await supabase
    .from('businesses')
    .select('id, name, email')
    .eq('id', membership.business_id)
    .single();

  if (businessError || !business) {
    return null;
  }

  return {
    userId: claims.sub,
    businessId: business.id,
    businessName: business.name,
    email: business.email || String(claims.email || ''),
    role: membership.role as BusinessRole,
  };
}

export async function requireTenant(): Promise<TenantContext> {
  const tenant = await getCurrentTenant();

  if (!tenant) {
    redirect('/login');
  }

  return tenant;
}

