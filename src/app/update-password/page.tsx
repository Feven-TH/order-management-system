import { redirect } from 'next/navigation';
import { getCurrentTenant } from '@/lib/auth/tenant';
import UpdatePasswordForm from './update-password-form';

export const dynamic = 'force-dynamic';

export default async function UpdatePasswordPage() {
  const tenant = await getCurrentTenant();

  if (!tenant) {
    redirect('/login');
  }

  if (!tenant.mustChangePassword) {
    redirect('/');
  }

  return <UpdatePasswordForm businessName={tenant.businessName} />;
}
