import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getXAccount, logActivity } from '@/lib/supabase-server'
import { retweetAsUser } from '@/lib/twitter-oauth'

export async function POST(request: NextRequest) {
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

    // Get request body
    const { tweetId, tweetUrl } = await request.json()

    // Extract tweet ID from URL if provided
    let targetTweetId = tweetId
    if (!targetTweetId && tweetUrl) {
      const match = tweetUrl.match(/status\/(\d+)/)
      if (match) {
        targetTweetId = match[1]
      }
    }

    if (!targetTweetId) {
      return NextResponse.json({ error: 'Tweet ID or URL required' }, { status: 400 })
    }

    // Get user's X account
    const xAccount = await getXAccount(user.id)
    
    if (!xAccount) {
      return NextResponse.json({ error: 'X account not connected' }, { status: 400 })
    }

    // Retweet using user's credentials
    await retweetAsUser(
      xAccount.access_token,
      xAccount.access_secret,
      targetTweetId
    )

    // Log activity
    await logActivity(user.id, 'retweet', {
      tweetId: targetTweetId
    })

    return NextResponse.json({ 
      success: true, 
      tweetId: targetTweetId 
    })
    
  } catch (error: any) {
    console.error('Error retweeting:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to retweet' },
      { status: 500 }
    )
  }
}