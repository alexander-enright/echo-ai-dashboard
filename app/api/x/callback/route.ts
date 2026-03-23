import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { exchangeCodeForToken, fetchUserProfile } from '@/lib/twitter-oauth'
import { saveXAccount, logActivity } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  console.log('=== X OAuth Callback ===')
  console.log('URL:', request.url)
  
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  // Check for OAuth errors from X
  if (error) {
    console.error('X OAuth error:', error, errorDescription)
    return NextResponse.redirect(
      new URL(`/settings?error=x_oauth_error&detail=${encodeURIComponent(errorDescription || error)}`, 'https://echo-ai-dashboard.vercel.app')
    )
  }

  if (!code || !state) {
    console.error('Missing code or state')
    return NextResponse.redirect(
      new URL('/settings?error=missing_params', 'https://echo-ai-dashboard.vercel.app')
    )
  }

  // Get stored PKCE verifier from cookies
  const cookieStore = await cookies()
  const storedCodeVerifier = cookieStore.get('x_oauth_code_verifier')?.value
  const storedState = cookieStore.get('x_oauth_state')?.value

  console.log('Cookies present:', { 
    hasVerifier: !!storedCodeVerifier, 
    hasState: !!storedState 
  })

  if (!storedCodeVerifier || !storedState) {
    console.error('Session expired - no cookies')
    return NextResponse.redirect(
      new URL('/settings?error=session_expired', 'https://echo-ai-dashboard.vercel.app')
    )
  }

  // Verify state matches
  if (state !== storedState) {
    console.error('State mismatch')
    return NextResponse.redirect(
      new URL('/settings?error=state_mismatch', 'https://echo-ai-dashboard.vercel.app')
    )
  }

  try {
    // Exchange code for token
    console.log('Exchanging code for token...')
    const tokenData = await exchangeCodeForToken(code, storedCodeVerifier)
    console.log('Got token:', !!tokenData.accessToken)
    
    // Fetch user profile
    console.log('Fetching profile...')
    const profile = await fetchUserProfile(tokenData.accessToken)
    console.log('Profile:', profile.username)

    // Get current user from Supabase
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      console.error('No user logged in')
      return NextResponse.redirect(
        new URL('/login?error=not_logged_in', 'https://echo-ai-dashboard.vercel.app')
      )
    }

    console.log('User:', user.id)

    // Save to database
    console.log('Saving to database...')
    await saveXAccount({
      user_id: user.id,
      x_user_id: profile.id,
      x_username: profile.username,
      x_display_name: profile.displayName,
      access_token: tokenData.accessToken,
      access_secret: tokenData.refreshToken || '',
      profile_image_url: profile.profileImageUrl || null,
      followers_count: profile.followersCount,
    })
    console.log('Saved to database')

    // Log activity
    await logActivity(user.id, 'connect_x', {
      x_username: profile.username
    })

    // Clean up cookies and redirect to dashboard
    const response = NextResponse.redirect(
      new URL('/dashboard?connected=true', 'https://echo-ai-dashboard.vercel.app')
    )
    response.cookies.delete('x_oauth_code_verifier')
    response.cookies.delete('x_oauth_state')

    console.log('Success! Redirecting to dashboard')
    return response
    
  } catch (err: any) {
    console.error('Callback error:', err.message)
    return NextResponse.redirect(
      new URL(`/settings?error=callback_failed&detail=${encodeURIComponent(err.message)}`, 'https://echo-ai-dashboard.vercel.app')
    )
  }
}