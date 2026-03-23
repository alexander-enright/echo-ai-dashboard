import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { exchangeCodeForToken, fetchUserProfile } from '@/lib/twitter-oauth'
import { saveXAccount, logActivity } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')
    const errorDescription = searchParams.get('error_description')

    // Check for OAuth errors
    if (error) {
      console.error('OAuth error:', error, errorDescription)
      return NextResponse.redirect(
        new URL(`/settings?error=${encodeURIComponent(errorDescription || error)}`, request.url)
      )
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/settings?error=invalid_callback', request.url)
      )
    }

    // Get stored PKCE verifier and state from cookies
    const cookieStore = await cookies()
    const storedCodeVerifier = cookieStore.get('x_oauth_code_verifier')?.value
    const storedState = cookieStore.get('x_oauth_state')?.value

    if (!storedCodeVerifier || !storedState) {
      return NextResponse.redirect(
        new URL('/settings?error=session_expired', request.url)
      )
    }

    // Verify state matches (CSRF protection)
    if (state !== storedState) {
      return NextResponse.redirect(
        new URL('/settings?error=invalid_state', request.url)
      )
    }

    // Create Supabase client
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

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Exchange authorization code for access token
    const tokenData = await exchangeCodeForToken(code, storedCodeVerifier)
    
    // Fetch user profile from X
    const profile = await fetchUserProfile(tokenData.accessToken)

    // Save X account to database
    await saveXAccount({
      user_id: user.id,
      x_user_id: profile.id,
      x_username: profile.username,
      x_display_name: profile.displayName,
      access_token: tokenData.accessToken,
      access_secret: tokenData.refreshToken || '', // Store refresh token as secret
      profile_image_url: profile.profileImageUrl || null,
      followers_count: profile.followersCount,
    })

    // Log activity
    await logActivity(user.id, 'connect_x', {
      x_username: profile.username,
      x_user_id: profile.id
    })

    // Clean up OAuth cookies
    const response = NextResponse.redirect(new URL('/dashboard?connected=true', request.url))
    response.cookies.delete('x_oauth_code_verifier')
    response.cookies.delete('x_oauth_state')

    return response
    
  } catch (error: any) {
    console.error('Error in X OAuth callback:', error)
    return NextResponse.redirect(
      new URL(`/settings?error=${encodeURIComponent(error.message || 'callback_failed')}`, request.url)
    )
  }
}