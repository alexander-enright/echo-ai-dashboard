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
    const errors: string[] = []

    // Like the tweet
    try {
      await likeTweet(id)
      await saveEngagementLog({
        tweet_id: id,
        action: 'like',
        created_at: new Date().toISOString(),
      })
      results.push('liked')
    } catch (e: any) {
      console.error('Like error:', e.message || e)
      errors.push(`like failed: ${e.message || 'unknown error'}`)
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
    } catch (e: any) {
      console.error('Retweet error:', e.message || e)
      errors.push(`retweet failed: ${e.message || 'unknown error'}`)
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
      } catch (e: any) {
        console.error('Comment error:', e.message || e)
        errors.push(`comment failed: ${e.message || 'unknown error'}`)
      }
    }

    if (errors.length > 0 && results.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: errors.join(', '),
        actions: results 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      actions: results,
      warnings: errors.length > 0 ? errors : undefined
    })
  } catch (error: any) {
    console.error('Error in retweet action:', error)
    return NextResponse.json({ 
      success: false,
      error: error.message || 'Failed to complete actions' 
    }, { status: 500 })
  }
}
