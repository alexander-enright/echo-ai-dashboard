import { NextRequest, NextResponse } from 'next/server'
import { replyToTweet, extractTweetId } from '@/lib/twitter'
import { saveComment } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { tweetUrl, comment } = await request.json()

    const tweetId = extractTweetId(tweetUrl)
    if (!tweetId) {
      return NextResponse.json({ error: 'Invalid tweet URL' }, { status: 400 })
    }

    if (!comment || comment.length > 280) {
      return NextResponse.json({ error: 'Invalid comment' }, { status: 400 })
    }

    // Post comment
    const replyId = await replyToTweet(tweetId, comment)
    
    // Save to database
    await saveComment({
      tweet_id: tweetId,
      comment_text: comment,
      created_at: new Date().toISOString(),
    })

    return NextResponse.json({ success: true, replyId })
  } catch (error) {
    console.error('Error commenting on tweet:', error)
    return NextResponse.json({ error: 'Failed to comment' }, { status: 500 })
  }
}
