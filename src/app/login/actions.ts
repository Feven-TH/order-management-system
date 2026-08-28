'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getAppUrl } from '@/lib/env';

export async function signIn(formData: FormData) {
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');

  if (!email || !password) {
    redirect('/login?error=Email%20and%20password%20are%20required');
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect('/');
}

export async function signUp(formData: FormData) {
  const businessName = String(formData.get('business_name') || '').trim();
  const fullName = String(formData.get('full_name') || '').trim();
  const email = String(formData.get('email') || '').trim().toLowerCase();
  const password = String(formData.get('password') || '');

  if (!businessName || !email || !password) {
    redirect('/signup?error=Business%20name%2C%20email%2C%20and%20password%20are%20required');
  }

  if (businessName.length > 120) {
    redirect('/signup?error=Business%20name%20must%20be%20120%20characters%20or%20less');
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        business_name: businessName,
        full_name: fullName || null,
      },
      emailRedirectTo: `${getAppUrl()}/auth/callback`,
    },
  });

  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  }

  if (!data.session) {
    redirect('/login?message=Check%20your%20email%20to%20confirm%20your%20account');
  }

  redirect('/');
}
