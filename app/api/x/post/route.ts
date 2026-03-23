import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getXAccount, updatePostStatus, logActivity } from '@/lib/supabase-server'
import { postTweet } from '@/lib/twitter-oauth'

export const dynamic = 'force-dynamic'

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
    const { content, postId } = await request.json()

    if (!content || content.length > 280) {
      return NextResponse.json({ error: 'Invalid tweet content' }, { status: 400 })
    }

    // Get user's X account
    const xAccount = await getXAccount(user.id)
    
    if (!xAccount) {
      return NextResponse.json({ error: 'X account not connected' }, { status: 400 })
    }

    // Post to X using OAuth 2.0 access token
    const tweetId = await postTweet(
      xAccount.access_token,
      content
    )

    // Update post status if this was a generated post
    if (postId) {
      await updatePostStatus(user.id, postId, 'posted', tweetId)
    }

    // Log activity
    await logActivity(user.id, 'post_to_x', {
      tweetId,
      content: content.substring(0, 100)
    })

    return NextResponse.json({ 
      success: true, 
      tweetId 
    })
    
  } catch (error: any) {
    console.error('Error posting tweet:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to post tweet' },
      { status: 500 }
    )
  }
}