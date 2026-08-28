import { redirect } from 'next/navigation';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { Building2, Lock, Mail, Scissors, User } from 'lucide-react';
import { getCurrentTenant } from '@/lib/auth/tenant';
import { signUp } from '../login/actions';

export const dynamic = 'force-dynamic';

interface SignupPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const tenant = await getCurrentTenant();
  const params = await searchParams;

  if (tenant) {
    redirect('/');
  }

  return (
    <main className="min-h-screen bg-[#fff8f4] dark:bg-[#150f0b] text-[#211a15] dark:text-[#f7ebe1] flex items-center justify-center px-4 py-10">
      <section className="w-full max-w-md border border-[#d7c3b2]/50 dark:border-[#524438] bg-white dark:bg-[#1c1510] rounded-lg shadow-sm p-6 sm:p-8">
        <div className="mb-8">
          <div className="w-11 h-11 rounded-lg bg-[#a6681c] text-white flex items-center justify-center mb-4">
            <Scissors className="w-6 h-6" />
          </div>
          <h1 className="font-headline text-2xl font-bold tracking-tight">Create your business</h1>
          <p className="mt-2 text-sm text-[#524438] dark:text-[#d7c3b2]">
            Your account becomes the owner of a new, isolated workspace.
          </p>
        </div>

        {params.error && (
          <div className="mb-5 rounded-md border border-[#ba1a1a]/30 bg-[#ba1a1a]/10 px-3 py-2 text-sm text-[#ba1a1a] dark:text-[#ffb4ab]">
            {params.error}
          </div>
        )}

        <form action={signUp} className="space-y-4">
          <Field icon={<Building2 className="w-4 h-4 text-[#847466]" />} label="Business name" name="business_name" autoComplete="organization" required />
          <Field icon={<User className="w-4 h-4 text-[#847466]" />} label="Your name (optional)" name="full_name" autoComplete="name" />
          <Field icon={<Mail className="w-4 h-4 text-[#847466]" />} label="Email" name="email" type="email" autoComplete="email" required />
          <Field icon={<Lock className="w-4 h-4 text-[#847466]" />} label="Password" name="password" type="password" autoComplete="new-password" required />
          <button type="submit" className="w-full rounded-md bg-[#a6681c] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#885000]">
            Create business
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-[#524438] dark:text-[#d7c3b2]">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-[#885000] dark:text-[#ffb86d] hover:underline">Sign in</Link>
        </p>
      </section>
    </main>
  );
}

function Field({
  icon,
  label,
  name,
  type = 'text',
  autoComplete,
  required = false,
}: {
  icon: ReactNode;
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase text-[#524438] dark:text-[#d7c3b2]">{label}</span>
      <span className="mt-1.5 flex items-center gap-2 rounded-md border border-[#d7c3b2] dark:border-[#524438] bg-[#fff8f4] dark:bg-[#241a13] px-3">
        {icon}
        <input name={name} type={type} autoComplete={autoComplete} required={required} className="w-full bg-transparent py-2.5 text-sm outline-none" />
      </span>
    </label>
  );
}
