import { NextRequest, NextResponse } from 'next/server'
import { retweetTweet, likeTweet, extractTweetId, getTweet, replyToTweet } from '@/lib/twitter'
import { generateEngagementComment } from '@/lib/ollama'
import { saveEngagementLog } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { tweetUrl, includeComment } = await request.json()

    const tweetId = extractTweetId(tweetUrl)
    if (!tweetId) {
      return NextResponse.json({ error: 'Invalid tweet URL' }, { status: 400 })
    }

    const results: string[] = []

    // Like the tweet
    try {
      await likeTweet(tweetId)
      await saveEngagementLog({
        tweet_id: tweetId,
        action: 'like',
        created_at: new Date().toISOString(),
      })
      results.push('liked')
    } catch (e) {
      console.log('Like failed or already liked')
    }

    // Retweet
    try {
      await retweetTweet(tweetId)
      await saveEngagementLog({
        tweet_id: tweetId,
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
        const tweet = await getTweet(tweetId)
        if (tweet) {
          const comment = await generateEngagementComment(tweet.text)
          await replyToTweet(tweetId, comment)
          await saveEngagementLog({
            tweet_id: tweetId,
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
