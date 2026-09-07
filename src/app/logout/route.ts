import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import { getSupabasePublishableKey, getSupabaseUrl } from '@/lib/env';

async function signOutAndRedirect(request: Request) {
  const response = NextResponse.redirect(new URL('/login', request.url));
  const supabase = createServerClient(getSupabaseUrl(), getSupabasePublishableKey(), {
    cookies: {
      getAll: () => {
        const cookieHeader = request.headers.get('cookie') || '';
        return cookieHeader.split('; ').filter(Boolean).map((cookie) => {
          const separator = cookie.indexOf('=');
          return { name: cookie.slice(0, separator), value: cookie.slice(separator + 1) };
        });
      },
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  await supabase.auth.signOut();
  return response;
}

export async function GET(request: Request) {
  return signOutAndRedirect(request);
}

export async function POST(request: Request) {
  return signOutAndRedirect(request);
}
