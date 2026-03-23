import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { saveUserXAccount } from '@/lib/user-x-accounts';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    
    // Get user from session
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const accessToken = cookieStore.get('sb-access-token')?.value;
    
    if (!accessToken) {
      return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(accessToken);
    
    if (!user) {
      return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
    }

    // Get manual connection data
    const { xUserId, xUsername, accessToken: xAccessToken } = await request.json();

    if (!xUserId || !xUsername || !xAccessToken) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Save to database (no expiration for manual tokens)
    await saveUserXAccount({
      userId: user.id,
      xUserId,
      xUsername,
      accessToken: xAccessToken,
      // No refresh token for manual connection
      // No expiration (or set far future)
    });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('[Manual Connect] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to connect' },
      { status: 500 }
    );
  }
}
