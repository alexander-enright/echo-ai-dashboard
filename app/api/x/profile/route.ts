import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getXAccount } from '@/lib/supabase-server'
import { fetchUserProfile } from '@/lib/twitter-oauth'

export async function GET(request: NextRequest) {
  try {
    // Create Supabase client
    const cookieStore = await cookies()
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get stored X account
    const xAccount = await getXAccount(user.id)
    
    if (!xAccount) {
      return NextResponse.json({ connected: false })
    }

    // Fetch fresh profile data from X API
    try {
      const profile = await fetchUserProfile(xAccount.access_token, xAccount.access_secret)
      
      return NextResponse.json({
        connected: true,
        account: {
          id: xAccount.id,
          x_user_id: profile.id,
          x_username: profile.username,
          x_display_name: profile.displayName,
          profile_image_url: profile.profileImageUrl,
          followers_count: profile.followersCount,
          verified: profile.verified
        }
      })
    } catch (error) {
      // If API call fails, return stored data
      return NextResponse.json({
        connected: true,
        account: {
          id: xAccount.id,
          x_user_id: xAccount.x_user_id,
          x_username: xAccount.x_username,
          x_display_name: xAccount.x_display_name,
          profile_image_url: xAccount.profile_image_url,
          followers_count: xAccount.followers_count,
          verified: false
        },
        stale: true
      })
    }
    
  } catch (error: any) {
    console.error('Error fetching X profile:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}