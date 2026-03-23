import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
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

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in first.' },
        { status: 401 }
      );
    }

    // Generate OAuth 2.0 URL with PKCE
    const authData = generateAuthURL();
    
    // Store PKCE code verifier and state in secure cookies
    // These are needed for the callback to verify the response
    const response = NextResponse.json({
      success: true,
      url: authData.url,
    });

    // Set cookies with proper security
    response.cookies.set('x_oauth_code_verifier', authData.codeVerifier, {
      httpOnly: true,
      secure: true, // HTTPS only
      sameSite: 'lax',
      path: '/',
      maxAge: 600, // 10 minutes
    });

    response.cookies.set('x_oauth_state', authData.state, {
      httpOnly: true,
      secure: true,
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