import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { generateAuthURL } from '@/lib/twitter-oauth';

export const dynamic = 'force-dynamic';

/**
 * POST /api/x/connect
 * Initiates OAuth 2.0 flow for connecting X account
 * 
 * Security: Requires authenticated user
 * Stores PKCE verifier and state in secure cookies
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    
    // Create SSR-compatible Supabase client
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: '', ...options });
          },
        },
      }
    );

    // Get session using Supabase SSR (handles cookie names automatically)
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in first.' },
        { status: 401 }
      );
    }
    
    const user = session.user;

    // Generate OAuth 2.0 URL with PKCE
    const authData = generateAuthURL();
    
    // Store PKCE code verifier and state in secure cookies
    // These are needed for the callback to verify the response
    const response = NextResponse.json({
      success: true,
      url: authData.url,
    });

    // Set cookies with proper security
    // Use secure: false for localhost development
    const isLocalhost = process.env.NEXT_PUBLIC_APP_URL?.includes('localhost');
    
    response.cookies.set('x_oauth_code_verifier', authData.codeVerifier, {
      httpOnly: true,
      secure: !isLocalhost, // false for localhost, true for production
      sameSite: 'lax',
      path: '/',
      maxAge: 600, // 10 minutes
    });

    response.cookies.set('x_oauth_state', authData.state, {
      httpOnly: true,
      secure: !isLocalhost,
      sameSite: 'lax',
      path: '/',
      maxAge: 600,
    });

    console.log('[Connect] OAuth initiated for user:', user.id.substring(0, 8));
    
    return response;
    
  } catch (error: any) {
    console.error('[Connect] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to initiate OAuth flow' },
      { status: 500 }
    );
  }
}