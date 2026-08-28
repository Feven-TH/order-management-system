import App from '../App';
import { requireTenant } from '@/lib/auth/tenant';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const tenant = await requireTenant();

  return (
    <App
      businessName={tenant.businessName}
      userEmail={tenant.email}
    />
  );
}
