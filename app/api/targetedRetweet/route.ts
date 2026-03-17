import { NextRequest, NextResponse } from 'next/server'
import { TwitterApi } from 'twitter-api-v2'
import { 
  getRetweetHistory, 
  saveRetweetHistory, 
  getAutomationSetting 
} from '@/lib/supabase'
import { getRandomAccounts, Category } from '@/lib/target-accounts'

export const dynamic = 'force-dynamic'

const client = new TwitterApi(process.env.X_BEARER_TOKEN || '')

// Filter rules
const MIN_LIKES = 50  // Higher for major accounts
const MIN_RETWEETS = 20

export async function POST(request: NextRequest) {
  try {
    const { categories, scheduled_run_time } = await request.json()
    
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
    
    // Get random accounts from selected categories
    const targetAccounts = getRandomAccounts(5, categories as Category[])
    
    const retweeted: any[] = []
    const skipped: any[] = []
    
    // Get already retweeted tweet IDs
    const history = await getRetweetHistory(100)
    const alreadyRetweetedIds = new Set(history.map((h: any) => h.tweet_id))
    
    for (const account of targetAccounts) {
      try {
        // Get user by handle
        const user = await client.v2.userByUsername(account.handle)
        if (!user.data) {
          skipped.push({ account: account.handle, reason: 'user not found' })
          continue
        }
        
        // Get recent tweets from this user
        const tweets = await client.v2.userTimeline(user.data.id, {
          max_results: 10,
          'tweet.fields': ['public_metrics', 'referenced_tweets', 'created_at'],
        })
        
        const userTweets = tweets.data.data || []
        
        for (const tweet of userTweets) {
          // Skip if already retweeted
          if (alreadyRetweetedIds.has(tweet.id)) {
            skipped.push({ tweet_id: tweet.id, account: account.handle, reason: 'already_retweeted' })
            continue
          }
          
          // Skip if already a retweet
          if (tweet.referenced_tweets?.some((ref: any) => ref.type === 'retweeted')) {
            skipped.push({ tweet_id: tweet.id, account: account.handle, reason: 'is_retweet' })
            continue
          }
          
          // Check metrics
          const metrics = tweet.public_metrics
          if (!metrics) {
            skipped.push({ tweet_id: tweet.id, account: account.handle, reason: 'no_metrics' })
            continue
          }
          
          if (metrics.like_count < MIN_LIKES) {
            skipped.push({ tweet_id: tweet.id, account: account.handle, reason: `only ${metrics.like_count} likes` })
            continue
          }
          
          if (metrics.retweet_count < MIN_RETWEETS) {
            skipped.push({ tweet_id: tweet.id, account: account.handle, reason: `only ${metrics.retweet_count} retweets` })
            continue
          }
          
          // Retweet if enabled
          let retweetSuccess = false
          if (autoRetweetEnabled) {
            try {
              await userClient.v2.retweet(userId, tweet.id)
              retweetSuccess = true
            } catch (e: any) {
              console.error('Retweet failed:', e.message)
            }
          }
          
          // Save to history
          await saveRetweetHistory({
            tweet_id: tweet.id,
            tweet_text: tweet.text,
            author_username: account.handle,
            author_id: user.data.id,
            likes_count: metrics.like_count,
            retweets_count: metrics.retweet_count,
            scheduled_run_time: scheduled_run_time || 'manual',
            retweeted_at: retweetSuccess ? new Date().toISOString() : null,
          })
          
          retweeted.push({
            tweet_id: tweet.id,
            text: tweet.text.substring(0, 100) + '...',
            author: account.handle,
            category: account.category,
            likes: metrics.like_count,
            retweets: metrics.retweet_count,
            actually_retweeted: retweetSuccess,
          })
          
          // Stop after 3 retweets total
          if (retweeted.length >= 3) break
        }
        
        if (retweeted.length >= 3) break
      } catch (error: any) {
        console.error(`Error processing account ${account.handle}:`, error.message)
        skipped.push({ account: account.handle, reason: error.message })
      }
    }
    
    return NextResponse.json({
      success: true,
      accounts_checked: targetAccounts.length,
      retweeted: retweeted.length,
      retweeted_tweets: retweeted,
      skipped: skipped.length,
      auto_retweet_enabled: autoRetweetEnabled,
      categories: categories,
    })
  } catch (error: any) {
    console.error('Error in targeted retweet:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to run targeted retweet' },
      { status: 500 }
    )
  }
}
