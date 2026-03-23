import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Create Supabase client for API routes
 * Uses standard client without SSR package
 */
export function createApiSupabaseClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase URL and key must be set');
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Get user from request cookies
 * Looks for sb-access-token in cookies
 */
export async function getUserFromRequest(request: Request): Promise<{ user: any | null; error: any | null }> {
  const supabase = createApiSupabaseClient();
  
  // Extract token from Authorization header or Cookie
  const authHeader = request.headers.get('authorization');
  const cookieHeader = request.headers.get('cookie');
  
  let token: string | null = null;
  
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (cookieHeader) {
    // Parse cookies
    const cookies = cookieHeader.split(';').reduce((acc: any, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {});
    token = cookies['sb-access-token'] || null;
  }
  
  if (!token) {
    return { user: null, error: 'No token found' };
  }
  
  const { data, error } = await supabase.auth.getUser(token);
  return { user: data?.user || null, error };
}
