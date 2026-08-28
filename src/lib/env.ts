export function getSupabaseUrl() {
  const value = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!value) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
  }

  return value;
}

export function getSupabasePublishableKey() {
  const value =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!value) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY');
  }

  return value;
}

export function getSupabaseServiceRoleKey() {
  const value = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!value) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
  }

  return value;
}

export function getAppUrl() {
  const value = process.env.APP_URL;

  if (!value) {
    throw new Error('Missing APP_URL');
  }

  try {
    return new URL(value).toString().replace(/\/$/, '');
  } catch {
    throw new Error('APP_URL must be an absolute URL, for example https://app.example.com');
  }
}
