import { NextRequest, NextResponse } from 'next/server'
import { replyToTweet } from '@/lib/twitter'
import { saveComment } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { tweetId, tweetUrl, comment } = await request.json()

    // Support both tweetId and tweetUrl for backwards compatibility
    const id = tweetId || (tweetUrl ? tweetUrl.match(/status\/(\d+)/)?.[1] : null)
    
    if (!id) {
      return NextResponse.json({ error: 'Invalid tweet ID or URL' }, { status: 400 })
    }

    if (!comment || comment.length > 280) {
      return NextResponse.json({ error: 'Invalid comment' }, { status: 400 })
    }

    // Post comment
    const replyId = await replyToTweet(id, comment)
    
    // Save to database
    await saveComment({
      tweet_id: id,
      comment_text: comment,
      created_at: new Date().toISOString(),
    })

    return NextResponse.json({ success: true, replyId })
  } catch (error) {
    console.error('Error commenting on tweet:', error)
    return NextResponse.json({ error: 'Failed to comment' }, { status: 500 })
  }
}
