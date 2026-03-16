import { NextRequest, NextResponse } from 'next/server'
import { retweetTweet, likeTweet, getTweet, replyToTweet } from '@/lib/twitter'
import { generateEngagementComment } from '@/lib/ollama'
import { saveEngagementLog } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { tweetId, tweetUrl, includeComment } = await request.json()

    // Support both tweetId and tweetUrl for backwards compatibility
    const id = tweetId || (tweetUrl ? tweetUrl.match(/status\/(\d+)/)?.[1] : null)
    
    if (!id) {
      return NextResponse.json({ error: 'Invalid tweet ID or URL' }, { status: 400 })
    }

    const results: string[] = []

    // Like the tweet
    try {
      await likeTweet(id)
      await saveEngagementLog({
        tweet_id: id,
        action: 'like',
        created_at: new Date().toISOString(),
      })
      results.push('liked')
    } catch (e) {
      console.log('Like failed or already liked')
    }

    // Retweet
    try {
      await retweetTweet(id)
      await saveEngagementLog({
        tweet_id: id,
        action: 'retweet',
        created_at: new Date().toISOString(),
      })
      results.push('retweeted')
    } catch (e) {
      console.log('Retweet failed or already retweeted')
    }

    // Optional comment
    if (includeComment) {
      try {
        const tweet = await getTweet(id)
        if (tweet) {
          const comment = await generateEngagementComment(tweet.text)
          await replyToTweet(id, comment)
          await saveEngagementLog({
            tweet_id: id,
            action: 'comment',
            created_at: new Date().toISOString(),
          })
          results.push('commented')
        }
      } catch (e) {
        console.log('Comment failed')
      }
    }

    return NextResponse.json({ success: true, actions: results })
  } catch (error) {
    console.error('Error in retweet action:', error)
    return NextResponse.json({ error: 'Failed to complete actions' }, { status: 500 })
  }
}
