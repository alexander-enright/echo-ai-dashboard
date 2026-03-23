import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { getValidAccessToken } from '@/lib/user-x-accounts';

export const dynamic = 'force-dynamic';

/**
 * POST /api/x/post
 * Posts a tweet to X using the connected account
 * 
 * Body: { xUserId: string, text: string }
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    
    // Verify user is authenticated
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

    const { xUserId, text } = await request.json();

    if (!xUserId || !text) {
      return NextResponse.json(
        { error: 'Missing xUserId or text' },
        { status: 400 }
      );
    }

    // Get valid access token (auto-refreshes if expired)
    const { accessToken } = await getValidAccessToken(user.id, xUserId);

    // Post to X API
    console.log('[X API] Posting tweet...');
    
    const response = await fetch('https://api.twitter.com/2/tweets', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('[X API] Post tweet error:', error);
      return NextResponse.json(
        { error: error.detail || 'Failed to post tweet' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    console.log('[X API] Tweet posted:', data.data.id);

    return NextResponse.json({
      success: true,
      tweetId: data.data.id,
      text: data.data.text,
    });

  } catch (error: any) {
    console.error('[Post] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to post tweet' },
      { status: 500 }
    );
  }
}