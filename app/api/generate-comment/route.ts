import { NextRequest, NextResponse } from 'next/server'
import { generateComment } from '@/lib/ollama'
import { getTweet } from '@/lib/twitter'

export async function POST(request: NextRequest) {
  try {
    const { tweetId, tweetUrl } = await request.json()
    
    // Support both tweetId and tweetUrl for backwards compatibility
    const id = tweetId || (tweetUrl ? tweetUrl.match(/status\/(\d+)/)?.[1] : null)
    
    if (!id) {
      return NextResponse.json({ error: 'Invalid tweet ID or URL' }, { status: 400 })
    }

    const tweet = await getTweet(id)
    if (!tweet) {
      return NextResponse.json({ error: 'Tweet not found' }, { status: 404 })
    }

    const comment = await generateComment(tweet.text)
    
    return NextResponse.json({ comment, tweetId: id, tweetText: tweet.text })
  } catch (error) {
    console.error('Error generating comment:', error)
    return NextResponse.json({ error: 'Failed to generate comment' }, { status: 500 })
  }
}
