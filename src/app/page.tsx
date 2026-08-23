import App from '../App';
import { requireAdmin } from '@/lib/auth/guards';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const admin = await requireAdmin();

  return <App adminEmail={admin.email} adminRole={admin.role} />;
}
