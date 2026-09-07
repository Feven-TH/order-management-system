'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { KeyRound, Scissors } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function UpdatePasswordForm({ businessName }: { businessName: string }) {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (newPassword.length < 8) {
      setError('Use at least 8 characters for your new password.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('The passwords do not match.');
      return;
    }

    setIsSaving(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });

    if (updateError) {
      setError(updateError.message);
      setIsSaving(false);
      return;
    }

    // A database trigger clears must_change_password only when Auth has
    // successfully persisted a new password. Verify that mutation before
    // opening the workspace.
    const { data: membership, error: membershipError } = await supabase
      .from('business_members')
      .select('business_id')
      .single();

    if (membershipError || !membership) {
      setError('Your password was updated, but we could not verify your workspace. Please sign in again.');
      setIsSaving(false);
      return;
    }

    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('must_change_password')
      .eq('id', membership.business_id)
      .single();

    if (businessError || business?.must_change_password) {
      setError('Your password was updated, but the workspace is still locked. Please contact an administrator.');
      setIsSaving(false);
      return;
    }

    router.replace('/');
    router.refresh();
  };

  return (
    <main className="min-h-screen bg-[#fff8f4] dark:bg-[#150f0b] text-[#211a15] dark:text-[#f7ebe1] flex items-center justify-center px-4 py-10">
      <section className="w-full max-w-md border border-[#d7c3b2]/50 dark:border-[#524438] bg-white dark:bg-[#1c1510] rounded-lg shadow-sm p-6 sm:p-8">
        <div className="mb-8">
          <div className="w-11 h-11 rounded-lg bg-[#a6681c] text-white flex items-center justify-center mb-4">
            <Scissors className="w-6 h-6" />
          </div>
          <h1 className="font-headline text-2xl font-bold tracking-tight">Update your password</h1>
          <p className="mt-2 text-sm text-[#524438] dark:text-[#d7c3b2]">
            {businessName} requires a new password before you can access the workspace.
          </p>
        </div>

        {error && (
          <div role="alert" className="mb-5 rounded-md border border-[#ba1a1a]/30 bg-[#ba1a1a]/10 px-3 py-2 text-sm text-[#ba1a1a] dark:text-[#ffb4ab]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-xs font-bold uppercase text-[#524438] dark:text-[#d7c3b2]">New Password</span>
            <span className="mt-1.5 flex items-center gap-2 rounded-md border border-[#d7c3b2] dark:border-[#524438] bg-[#fff8f4] dark:bg-[#241a13] px-3">
              <KeyRound className="w-4 h-4 text-[#847466]" />
              <input value={newPassword} onChange={(event) => setNewPassword(event.target.value)} type="password" autoComplete="new-password" minLength={8} required className="w-full bg-transparent py-2.5 text-sm outline-none" />
            </span>
          </label>
          <label className="block">
            <span className="text-xs font-bold uppercase text-[#524438] dark:text-[#d7c3b2]">Confirm Password</span>
            <span className="mt-1.5 flex items-center gap-2 rounded-md border border-[#d7c3b2] dark:border-[#524438] bg-[#fff8f4] dark:bg-[#241a13] px-3">
              <KeyRound className="w-4 h-4 text-[#847466]" />
              <input value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} type="password" autoComplete="new-password" minLength={8} required className="w-full bg-transparent py-2.5 text-sm outline-none" />
            </span>
          </label>
          <button type="submit" disabled={isSaving} className="w-full rounded-md bg-[#a6681c] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#885000] disabled:cursor-not-allowed disabled:opacity-60">
            {isSaving ? 'Updating password…' : 'Update Password'}
          </button>
        </form>
      </section>
    </main>
  );
}
