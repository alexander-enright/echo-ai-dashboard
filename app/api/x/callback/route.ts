import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { exchangeCodeForToken, fetchUserProfile } from '@/lib/twitter-oauth';
import { saveUserXAccount } from '@/lib/user-x-accounts';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const url = new URL(request.url);
    
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');
    const errorDescription = url.searchParams.get('error_description');

    console.log('[Callback] Received:', { hasCode: !!code, hasState: !!state, error });

    if (error) {
      return NextResponse.redirect(
        new URL(`/settings?error=x_oauth&detail=${encodeURIComponent(errorDescription || error)}`, 
        process.env.NEXT_PUBLIC_APP_URL!)
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/settings?error=missing_params', process.env.NEXT_PUBLIC_APP_URL!)
      );
    }

    const storedCodeVerifier = cookieStore.get('x_oauth_code_verifier')?.value;
    const storedState = cookieStore.get('x_oauth_state')?.value;

    console.log('[Callback] Cookies:', { hasVerifier: !!storedCodeVerifier, hasState: !!storedState });

    if (!storedCodeVerifier || !storedState) {
      return NextResponse.redirect(
        new URL('/settings?error=session_expired', process.env.NEXT_PUBLIC_APP_URL!)
      );
    }

    if (state !== storedState) {
      return NextResponse.redirect(
        new URL('/settings?error=state_mismatch', process.env.NEXT_PUBLIC_APP_URL!)
      );
    }

    // Get user from session
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const accessToken = cookieStore.get('sb-access-token')?.value;
    
    if (!accessToken) {
      return NextResponse.redirect(
        new URL('/login?error=not_logged_in', process.env.NEXT_PUBLIC_APP_URL!)
      );
    }

    const { data: { user } } = await supabase.auth.getUser(accessToken);
    
    if (!user) {
      return NextResponse.redirect(
        new URL('/login?error=not_logged_in', process.env.NEXT_PUBLIC_APP_URL!)
      );
    }

    console.log('[Callback] User:', user.id.substring(0, 8));

    // Exchange code for tokens
    const tokenData = await exchangeCodeForToken(code, storedCodeVerifier);
    const profile = await fetchUserProfile(tokenData.accessToken);

    // Save to database
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

    console.log('[Callback] Success:', profile.username);

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
