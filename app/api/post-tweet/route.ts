import { NextRequest, NextResponse } from 'next/server'
import { postTweet } from '@/lib/twitter'
import { savePost } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { content, type } = await request.json()

    if (!content || content.length > 280) {
      return NextResponse.json({ error: 'Invalid tweet content' }, { status: 400 })
    }

    // Post to X
    const tweetId = await postTweet(content)
    
    // Save to database
    await savePost({
      content,
      type,
      posted_at: new Date().toISOString(),
      tweet_id: tweetId,
    })

    return NextResponse.json({ success: true, tweetId })
  } catch (error) {
    console.error('Error posting tweet:', error)
    return NextResponse.json({ error: 'Failed to post tweet' }, { status: 500 })
  }
}
