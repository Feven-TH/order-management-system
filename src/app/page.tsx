import App from '../App';
import { getCurrentAdmin } from '@/lib/auth/guards';
import { requireTenant } from '@/lib/auth/tenant';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const tenant = await requireTenant();
  const platformAdmin = await getCurrentAdmin();

  return (
    <App
      businessName={tenant.businessName}
      userEmail={tenant.email}
      canManageAdmins={platformAdmin?.role === 'superadmin'}
    />
  );
}
