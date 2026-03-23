import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { getUserXAccounts, UserXAccount } from '@/lib/user-x-accounts';

export const dynamic = 'force-dynamic';

/**
 * GET /api/x/profile
 * Get connected X accounts for current user
 * 
 * Returns sanitized account info (no access tokens!)
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    
    // Verify user is authenticated using session
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options });
          },
        },
      }
    );

    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const user = session.user;
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all connected X accounts for this user
    const accounts = await getUserXAccounts(user.id);

    // Sanitize response - NEVER return access tokens!
    const sanitizedAccounts = accounts.map((account: UserXAccount) => ({
      id: account.id,
      x_user_id: account.x_user_id,
      x_username: account.x_username,
      x_display_name: account.x_display_name,
      profile_image_url: account.profile_image_url,
      followers_count: account.followers_count || 0,
      is_active: account.is_active,
      connected_at: account.created_at,
    }));

    return NextResponse.json({
      connected: accounts.length > 0,
      accounts: sanitizedAccounts,
      count: accounts.length,
    });

  } catch (error: any) {
    console.error('[Profile] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch X accounts' },
      { status: 500 }
    );
  }
}