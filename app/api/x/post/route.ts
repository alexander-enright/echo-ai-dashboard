import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { getValidAccessToken, updateLastUsed } from '@/lib/user-x-accounts';
import { postTweet } from '@/lib/twitter-oauth';

export const dynamic = 'force-dynamic';

/**
 * POST /api/x/post
 * Post a tweet using stored OAuth tokens
 * 
 * Security: User must be authenticated and own the X account
 * Automatically refreshes token if expired
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

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

    // Get request body
    const { text, xUserId } = await request.json();

    // Validate input
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Tweet text is required' },
        { status: 400 }
      );
    }

    if (text.length > 280) {
      return NextResponse.json(
        { error: 'Tweet exceeds 280 characters' },
        { status: 400 }
      );
    }

    if (!xUserId) {
      return NextResponse.json(
        { error: 'xUserId is required' },
        { status: 400 }
      );
    }

    console.log('[Post] User:', user.id.substring(0, 8), 'Posting to X account:', xUserId);

    // Get valid access token (auto-refreshes if expired)
    const { accessToken } = await getValidAccessToken(user.id, xUserId);

    // Post the tweet
    const result = await postTweet(accessToken, text);

    // Update last_used timestamp
    await updateLastUsed(user.id, xUserId);

    console.log('[Post] Tweet posted:', result.tweetId);

    return NextResponse.json({
      success: true,
      tweetId: result.tweetId,
      text: result.text,
    });

  } catch (error: any) {
    console.error('[Post] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to post tweet' },
      { status: 500 }
    );
  }
}