import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Lock, Mail, Scissors } from 'lucide-react';
import { getCurrentTenant } from '@/lib/auth/tenant';
import { signIn } from './actions';

export const dynamic = 'force-dynamic';

interface LoginPageProps {
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
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
          <h1 className="font-headline text-2xl font-bold tracking-tight">
            Sign in to your business
          </h1>
          <p className="mt-2 text-sm text-[#524438] dark:text-[#d7c3b2]">
            Your workspace is isolated to your business.
          </p>
        </div>

        {params.error && (
          <div className="mb-5 rounded-md border border-[#ba1a1a]/30 bg-[#ba1a1a]/10 px-3 py-2 text-sm text-[#ba1a1a] dark:text-[#ffb4ab]">
            {params.error}
          </div>
        )}

        {params.message && (
          <div className="mb-5 rounded-md border border-green-700/20 bg-green-700/10 px-3 py-2 text-sm text-green-800 dark:text-green-200">
            {params.message}
          </div>
        )}

        <form action={signIn} className="space-y-4">
          <label className="block">
            <span className="text-xs font-bold uppercase text-[#524438] dark:text-[#d7c3b2]">
              Email
            </span>
            <span className="mt-1.5 flex items-center gap-2 rounded-md border border-[#d7c3b2] dark:border-[#524438] bg-[#fff8f4] dark:bg-[#241a13] px-3">
              <Mail className="w-4 h-4 text-[#847466]" />
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full bg-transparent py-2.5 text-sm outline-none"
              />
            </span>
          </label>

          <label className="block">
            <span className="text-xs font-bold uppercase text-[#524438] dark:text-[#d7c3b2]">
              Password
            </span>
            <span className="mt-1.5 flex items-center gap-2 rounded-md border border-[#d7c3b2] dark:border-[#524438] bg-[#fff8f4] dark:bg-[#241a13] px-3">
              <Lock className="w-4 h-4 text-[#847466]" />
              <input
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="w-full bg-transparent py-2.5 text-sm outline-none"
              />
            </span>
          </label>

          <button
            type="submit"
            className="w-full rounded-md bg-[#a6681c] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#885000]"
          >
            Sign in
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-[#524438] dark:text-[#d7c3b2]">
          New to AtelierOS?{' '}
          <Link href="/signup" className="font-semibold text-[#885000] dark:text-[#ffb86d] hover:underline">
            Create your business
          </Link>
        </p>
      </section>
    </main>
  );
}
