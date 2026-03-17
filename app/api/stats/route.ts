import { NextRequest, NextResponse } from 'next/server'
import { TwitterApi } from 'twitter-api-v2'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Get user's X profile
    const userClient = new TwitterApi({
      appKey: process.env.X_API_KEY!,
      appSecret: process.env.X_API_SECRET!,
      accessToken: process.env.X_ACCESS_TOKEN!,
      accessSecret: process.env.X_ACCESS_SECRET!,
    })
    
    const me = await userClient.v2.me({
      'user.fields': ['public_metrics'],
    })
    
    const userData = me.data
    const currentFollowers = userData.public_metrics?.followers_count || 0
    
    // Calculate time ranges
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    
    const lastWeek = new Date()
    lastWeek.setDate(lastWeek.getDate() - 7)
    
    // Get posts actually posted to X - last 24 hours
    const { data: dailyPosts, error: postsError } = await supabase
      .from('scheduled_quotes')
      .select('*')
      .gte('posted_at', yesterday.toISOString())
      .eq('posted_to_x', true)
    
    if (postsError) console.error('Posts error:', postsError)
    
    // Get retweets made - last 24 hours
    const { data: dailyRetweets, error: retweetsError } = await supabase
      .from('retweet_history')
      .select('*')
      .gte('retweeted_at', yesterday.toISOString())
    
    if (retweetsError) console.error('Retweets error:', retweetsError)
    
    // Get engagement logs (likes, comments) - last 24 hours
    const { data: dailyEngagements, error: engagementsError } = await supabase
      .from('engagement_logs')
      .select('*')
      .gte('created_at', yesterday.toISOString())
    
    if (engagementsError) console.error('Engagements error:', engagementsError)
    
    // Calculate accurate stats
    const totalPosts = dailyPosts?.length || 0
    const totalRetweets = dailyRetweets?.length || 0
    const totalEngagements = dailyEngagements?.length || 0
    
    // Total interactions = retweets + likes + comments
    const totalInteractions = totalRetweets + totalEngagements
    
    // Engagement rate = (interactions / followers) * 100
    const engagementRate = currentFollowers > 0 
      ? ((totalInteractions / currentFollowers) * 100).toFixed(2)
      : '0.00'
    
    // Get weekly totals
    const { data: weeklyPosts } = await supabase
      .from('scheduled_quotes')
      .select('posted_at')
      .gte('posted_at', lastWeek.toISOString())
      .eq('posted_to_x', true)
    
    const { data: weeklyRetweets } = await supabase
      .from('retweet_history')
      .select('retweeted_at')
      .gte('retweeted_at', lastWeek.toISOString())
    
    return NextResponse.json({
      followers: {
        current: currentFollowers,
      },
      dailyActivity: {
        posts: totalPosts,
        retweets: totalRetweets,
        interactions: totalInteractions,
      },
      engagementRate: `${engagementRate}%`,
      weeklyActivity: {
        posts: weeklyPosts?.length || 0,
        retweets: weeklyRetweets?.length || 0,
      },
      username: userData.username,
    })
  } catch (error: any) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
