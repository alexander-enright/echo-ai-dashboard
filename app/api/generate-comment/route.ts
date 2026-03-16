import { NextRequest, NextResponse } from 'next/server'
import { generateComment } from '@/lib/ollama'
import { extractTweetId, getTweet } from '@/lib/twitter'

export async function POST(request: NextRequest) {
  try {
    const { tweetUrl } = await request.json()
    
    const tweetId = extractTweetId(tweetUrl)
    if (!tweetId) {
      return NextResponse.json({ error: 'Invalid tweet URL' }, { status: 400 })
    }

    const tweet = await getTweet(tweetId)
    if (!tweet) {
      return NextResponse.json({ error: 'Tweet not found' }, { status: 404 })
    }

    const comment = await generateComment(tweet.text)
    
    return NextResponse.json({ comment, tweetId, tweetText: tweet.text })
  } catch (error) {
    console.error('Error generating comment:', error)
    return NextResponse.json({ error: 'Failed to generate comment' }, { status: 500 })
  }
}
