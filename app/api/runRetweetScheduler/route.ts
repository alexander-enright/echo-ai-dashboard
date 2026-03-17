import { NextRequest, NextResponse } from 'next/server'
import { TwitterApi } from 'twitter-api-v2'
import { 
  getRetweetHistory, 
  saveRetweetHistory, 
  getAutomationSetting 
} from '@/lib/supabase'

export const dynamic = 'force-dynamic'

const client = new TwitterApi(process.env.X_BEARER_TOKEN || '')

// Filter rules - LOWERED for testing
const MIN_LIKES = 3  // Was 10
const MIN_RETWEETS = 1  // Was 5

export async function POST(request: NextRequest) {
  try {
    const { scheduled_run_time } = await request.json()
    
    // Check if auto-retweets are enabled
    const autoRetweetEnabled = await getAutomationSetting('enable_auto_retweets')
    
    // Get current user
    const userClient = new TwitterApi({
      appKey: process.env.X_API_KEY!,
      appSecret: process.env.X_API_SECRET!,
      accessToken: process.env.X_ACCESS_TOKEN!,
      accessSecret: process.env.X_ACCESS_SECRET!,
    })
    
    const me = await userClient.v2.me()
    const userId = me.data.id
    
    // Fetch timeline
    const timeline = await userClient.v2.homeTimeline({
      max_results: 50,
      'tweet.fields': ['public_metrics', 'author_id', 'referenced_tweets'],
    })
    
    const tweets = timeline.data.data || []
    const retweeted: any[] = []
    const skipped: any[] = []
    
    // Get already retweeted tweet IDs
    const history = await getRetweetHistory(100)
    const alreadyRetweetedIds = new Set(history.map((h: any) => h.tweet_id))
    
    console.log(`Processing ${tweets.length} tweets. Auto-retweet enabled: ${autoRetweetEnabled}`)
    
    for (const tweet of tweets) {
      // Skip if already retweeted
      if (alreadyRetweetedIds.has(tweet.id)) {
        skipped.push({ tweet_id: tweet.id, reason: 'already_retweeted' })
        continue
      }
      
      // Skip own tweets
      if (tweet.author_id === userId) {
        skipped.push({ tweet_id: tweet.id, reason: 'own_tweet' })
        continue
      }
      
      // Skip if already a retweet
      if (tweet.referenced_tweets?.some((ref: any) => ref.type === 'retweeted')) {
        skipped.push({ tweet_id: tweet.id, reason: 'is_retweet' })
        continue
      }
      
      // Check metrics
      const metrics = tweet.public_metrics
      if (!metrics) {
        skipped.push({ tweet_id: tweet.id, reason: 'no_metrics' })
        continue
      }
      
      if (metrics.like_count < MIN_LIKES) {
        skipped.push({ tweet_id: tweet.id, reason: `only ${metrics.like_count} likes (need ${MIN_LIKES})` })
        continue
      }
      
      if (metrics.retweet_count < MIN_RETWEETS) {
        skipped.push({ tweet_id: tweet.id, reason: `only ${metrics.retweet_count} retweets (need ${MIN_RETWEETS})` })
        continue
      }
      
      // Check for links
      if (tweet.text.includes('http')) {
        skipped.push({ tweet_id: tweet.id, reason: 'contains_link' })
        continue
      }
      
      // Get author info
      let authorUsername = 'unknown'
      try {
        const author = await client.v2.user(tweet.author_id!)
        authorUsername = author.data.username
      } catch (e) {
        console.log('Could not fetch author')
      }
      
      console.log(`Found valid tweet: ${tweet.id} by @${authorUsername} with ${metrics.like_count} likes, ${metrics.retweet_count} retweets`)
      
      // Retweet if enabled
      let retweetSuccess = false
      let errorMsg = ''
      if (autoRetweetEnabled) {
        try {
          await userClient.v2.retweet(userId, tweet.id)
          retweetSuccess = true
          console.log(`Successfully retweeted: ${tweet.id}`)
        } catch (e: any) {
          errorMsg = e.message
          console.error('Retweet failed:', e.message)
        }
      } else {
        console.log('Auto-retweet disabled, skipping actual retweet')
      }
      
      // Save to history
      await saveRetweetHistory({
        tweet_id: tweet.id,
        tweet_text: tweet.text,
        author_username: authorUsername,
        author_id: tweet.author_id,
        likes_count: metrics.like_count,
        retweets_count: metrics.retweet_count,
        scheduled_run_time: scheduled_run_time || 'manual',
        retweeted_at: retweetSuccess ? new Date().toISOString() : null,
      })
      
      retweeted.push({
        tweet_id: tweet.id,
        text: tweet.text.substring(0, 100) + '...',
        author: authorUsername,
        likes: metrics.like_count,
        retweets: metrics.retweet_count,
        actually_retweeted: retweetSuccess,
        error: errorMsg || undefined,
      })
      
      // Stop after 3 retweets
      if (retweeted.length >= 3) break
    }
    
    return NextResponse.json({
      success: true,
      processed: tweets.length,
      retweeted: retweeted.length,
      retweeted_tweets: retweeted,
      skipped: skipped.length,
      skipped_reasons: skipped.slice(0, 10), // Show first 10 skip reasons
      auto_retweet_enabled: autoRetweetEnabled,
      filters: { min_likes: MIN_LIKES, min_retweets: MIN_RETWEETS },
    })
  } catch (error: any) {
    console.error('Error in retweet scheduler:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to run retweet scheduler' },
      { status: 500 }
    )
  }
}
