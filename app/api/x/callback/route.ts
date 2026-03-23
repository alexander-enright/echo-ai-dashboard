import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { exchangeCodeForToken, fetchUserProfile } from '@/lib/twitter-oauth';
import { saveUserXAccount } from '@/lib/user-x-accounts';

export const dynamic = 'force-dynamic';

/**
 * GET /api/x/callback
 * Handles OAuth 2.0 callback from X (Twitter)
 * 
 * Flow:
 * 1. Receives authorization code from X
 * 2. Validates state parameter (CSRF protection)
 * 3. Exchanges code for access_token + refresh_token
 * 4. Fetches user profile to get x_user_id
 * 5. Saves tokens to user_x_accounts table
 * 6. Redirects to dashboard with success message
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const url = new URL(request.url);
    
    // Get OAuth parameters from URL
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');
    const errorDescription = url.searchParams.get('error_description');

    console.log('[Callback] Received callback:', { 
      hasCode: !!code, 
      hasState: !!state,
      error 
    });

    // Check for OAuth errors from X
    if (error) {
      console.error('[Callback] OAuth error:', error, errorDescription);
      return NextResponse.redirect(
        new URL(`/settings?error=x_oauth&detail=${encodeURIComponent(errorDescription || error)}`, 
        process.env.NEXT_PUBLIC_APP_URL!)
      );
    }

    // Validate required parameters
    if (!code || !state) {
      console.error('[Callback] Missing code or state');
      return NextResponse.redirect(
        new URL('/settings?error=missing_params', process.env.NEXT_PUBLIC_APP_URL!)
      );
    }

    // Get stored PKCE values from cookies
    const storedCodeVerifier = cookieStore.get('x_oauth_code_verifier')?.value;
    const storedState = cookieStore.get('x_oauth_state')?.value;

    console.log('[Callback] Cookie check:', { 
      hasVerifier: !!storedCodeVerifier, 
      hasState: !!storedState 
    });

    // Validate session exists
    if (!storedCodeVerifier || !storedState) {
      console.error('[Callback] Session expired');
      return NextResponse.redirect(
        new URL('/settings?error=session_expired', process.env.NEXT_PUBLIC_APP_URL!)
      );
    }

    // Validate state matches (CSRF protection)
    if (state !== storedState) {
      console.error('[Callback] State mismatch');
      return NextResponse.redirect(
        new URL('/settings?error=state_mismatch', process.env.NEXT_PUBLIC_APP_URL!)
      );
    }

    // Get current user
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
      console.error('[Callback] User not logged in');
      return NextResponse.redirect(
        new URL('/login?error=not_logged_in', process.env.NEXT_PUBLIC_APP_URL!)
      );
    }

    console.log('[Callback] User authenticated:', user.id.substring(0, 8));

    // Exchange code for tokens
    console.log('[Callback] Exchanging code for tokens...');
    const tokenData = await exchangeCodeForToken(code, storedCodeVerifier);

    // Fetch X user profile
    console.log('[Callback] Fetching X profile...');
    const profile = await fetchUserProfile(tokenData.accessToken);

    // Save to database
    console.log('[Callback] Saving to database...');
    await saveUserXAccount({
      userId: user.id,
      xUserId: profile.id,
      xUsername: profile.username,
      xDisplayName: profile.displayName,
      profileImageUrl: profile.profileImageUrl,
      accessToken: tokenData.accessToken,
      refreshToken: tokenData.refreshToken,
      expiresIn: tokenData.expiresIn,
      scope: tokenData.scope,
    });

    console.log('[Callback] Successfully connected:', profile.username);

    // Clean up OAuth cookies and redirect
    const response = NextResponse.redirect(
      new URL('/settings?connected=true', process.env.NEXT_PUBLIC_APP_URL!)
    );
    
    response.cookies.delete('x_oauth_code_verifier');
    response.cookies.delete('x_oauth_state');

    return response;

  } catch (error: any) {
    console.error('[Callback] Error:', error);
    return NextResponse.redirect(
      new URL(`/settings?error=callback_failed&detail=${encodeURIComponent(error.message)}`, 
      process.env.NEXT_PUBLIC_APP_URL!)
    );
  }
}