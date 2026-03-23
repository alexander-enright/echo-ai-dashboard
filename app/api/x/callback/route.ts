import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { TwitterApi } from 'twitter-api-v2'
import { saveXAccount, logActivity } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Get OAuth verifier and token from query params
    const searchParams = request.nextUrl.searchParams
    const oauthToken = searchParams.get('oauth_token')
    const oauthVerifier = searchParams.get('oauth_verifier')
    const denied = searchParams.get('denied')

    // Check if user denied access
    if (denied) {
      return NextResponse.redirect(new URL('/settings?error=access_denied', request.url))
    }

    if (!oauthToken || !oauthVerifier) {
      return NextResponse.redirect(new URL('/settings?error=invalid_callback', request.url))
    }

    // Get stored OAuth secret from cookie
    const cookieStore = await cookies()
    const oauthTokenSecret = cookieStore.get('x_oauth_secret')?.value

    if (!oauthTokenSecret) {
      return NextResponse.redirect(new URL('/settings?error=session_expired', request.url))
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

    // Exchange OAuth tokens for access tokens
    const client = new TwitterApi({
      appKey: process.env.X_API_KEY!,
      appSecret: process.env.X_API_SECRET!,
      accessToken: oauthToken,
      accessSecret: oauthTokenSecret,
    })

    const loginResult = await client.login(oauthVerifier)
    
    // Get user profile
    const userClient = new TwitterApi({
      appKey: process.env.X_API_KEY!,
      appSecret: process.env.X_API_SECRET!,
      accessToken: loginResult.accessToken,
      accessSecret: loginResult.accessSecret,
    })

    const profile = await userClient.v2.me({
      'user.fields': ['profile_image_url', 'public_metrics']
    })

    // Save X account to database
    await saveXAccount({
      user_id: user.id,
      x_user_id: profile.data.id,
      x_username: profile.data.username,
      x_display_name: profile.data.name,
      access_token: loginResult.accessToken,
      access_secret: loginResult.accessSecret,
      profile_image_url: profile.data.profile_image_url || null,
      followers_count: profile.data.public_metrics?.followers_count || 0,
    })

    // Log activity
    await logActivity(user.id, 'connect_x', {
      x_username: profile.data.username,
      x_user_id: profile.data.id
    })

    // Clean up OAuth cookies
    const response = NextResponse.redirect(new URL('/dashboard?connected=true', request.url))
    response.cookies.delete('x_oauth_token')
    response.cookies.delete('x_oauth_secret')

    return response
    
  } catch (error: any) {
    console.error('Error in X OAuth callback:', error)
    return NextResponse.redirect(
      new URL(`/settings?error=${encodeURIComponent(error.message || 'callback_failed')}`, request.url)
    )
  }
}