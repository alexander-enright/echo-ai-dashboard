import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { exchangeCodeForToken, fetchUserProfile } from '@/lib/twitter-oauth'
import { saveXAccount, logActivity } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  console.log('=== X OAuth Callback Debug ===')
  console.log('Full URL:', request.url)
  console.log('Search params:', Object.fromEntries(request.nextUrl.searchParams.entries()))
  
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')
    const errorDescription = searchParams.get('error_description')

    console.log('Parsed values:', { code: code?.substring(0, 10), state, error, errorDescription })

    // Check for OAuth errors
    if (error) {
      console.error('OAuth error from X:', error, errorDescription)
      return NextResponse.redirect(
        new URL(`/settings?error=${encodeURIComponent(errorDescription || error)}`, 'https://echo-ai-dashboard.vercel.app')
      )
    }

    if (!code || !state) {
      console.error('Missing code or state')
      return NextResponse.redirect(
        new URL('/settings?error=invalid_callback', 'https://echo-ai-dashboard.vercel.app')
      )
    }

    // Get stored PKCE verifier and state from cookies
    const cookieStore = await cookies()
    const storedCodeVerifier = cookieStore.get('x_oauth_code_verifier')?.value
    const storedState = cookieStore.get('x_oauth_state')?.value

    console.log('Cookies:', { 
      hasCodeVerifier: !!storedCodeVerifier, 
      hasState: !!storedState,
      storedStatePreview: storedState?.substring(0, 10)
    })

    if (!storedCodeVerifier || !storedState) {
      console.error('Session expired - cookies not found')
      return NextResponse.redirect(
        new URL('/settings?error=session_expired', 'https://echo-ai-dashboard.vercel.app')
      )
    }

    // Verify state matches (CSRF protection)
    if (state !== storedState) {
      console.error('State mismatch:', { received: state, stored: storedState })
      return NextResponse.redirect(
        new URL('/settings?error=invalid_state', 'https://echo-ai-dashboard.vercel.app')
      )
    }

    console.log('State verified, exchanging code for token...')

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
    
    console.log('Auth check:', { hasUser: !!user, userError })
    
    if (userError || !user) {
      console.error('User not authenticated')
      return NextResponse.redirect(new URL('/login', 'https://echo-ai-dashboard.vercel.app'))
    }

    console.log('User:', user.id)

    // Exchange authorization code for access token
    const tokenData = await exchangeCodeForToken(code, storedCodeVerifier)
    console.log('Token exchange successful:', { hasAccessToken: !!tokenData.accessToken })
    
    // Fetch user profile from X
    const profile = await fetchUserProfile(tokenData.accessToken)
    console.log('Profile fetched:', { username: profile.username, id: profile.id })

    // Save X account to database
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
    console.log('X account saved to database')

    // Log activity
    await logActivity(user.id, 'connect_x', {
      x_username: profile.username,
      x_user_id: profile.id
    })
    console.log('Activity logged')

    // Clean up OAuth cookies and redirect
    const response = NextResponse.redirect(new URL('/dashboard?connected=true', 'https://echo-ai-dashboard.vercel.app'))
    response.cookies.delete('x_oauth_code_verifier')
    response.cookies.delete('x_oauth_state')

    console.log('Redirecting to dashboard...')
    return response
    
  } catch (error: any) {
    console.error('=== Callback Error ===', error)
    return NextResponse.redirect(
      new URL(`/settings?error=${encodeURIComponent(error.message || 'callback_failed')}`, 'https://echo-ai-dashboard.vercel.app')
    )
  }
}