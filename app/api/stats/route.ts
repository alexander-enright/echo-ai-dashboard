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
      'user.fields': ['public_metrics', 'created_at'],
    })
    
    const userData = me.data
    const currentFollowers = userData.public_metrics?.followers_count || 0
    
    // Get daily posts generated (last 24 hours)
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    
    const { data: dailyPosts, error: postsError } = await supabase
      .from('scheduled_quotes')
      .select('*')
      .gte('created_at', yesterday.toISOString())
      .eq('posted_to_x', true)
    
    if (postsError) console.error('Posts error:', postsError)
    
    // Get engagement from retweet_history
    const { data: recentEngagements, error: engagementError } = await supabase
      .from('retweet_history')
      .select('*')
      .gte('retweeted_at', yesterday.toISOString())
    
    if (engagementError) console.error('Engagement error:', engagementError)
    
    // Get engagement logs
    const { data: engagementLogs, error: logsError } = await supabase
      .from('engagement_logs')
      .select('*')
      .gte('created_at', yesterday.toISOString())
    
    if (logsError) console.error('Logs error:', logsError)
    
    // Calculate stats
    const dailyPostsGenerated = dailyPosts?.length || 0
    const totalInteractions = (recentEngagements?.length || 0) + (engagementLogs?.length || 0)
    
    // Engagement rate (interactions / followers * 100)
    const engagementRate = currentFollowers > 0 
      ? ((totalInteractions / currentFollowers) * 100).toFixed(2)
      : '0.00'
    
    // Get last 7 days data for trend
    const lastWeek = new Date()
    lastWeek.setDate(lastWeek.getDate() - 7)
    
    const { data: weeklyPosts } = await supabase
      .from('scheduled_quotes')
      .select('created_at, posted_to_x')
      .gte('created_at', lastWeek.toISOString())
    
    const { data: weeklyEngagements } = await supabase
      .from('engagement_logs')
      .select('created_at, action')
      .gte('created_at', lastWeek.toISOString())
    
    // Calculate followers gained (requires storing historical data)
    // For now, we'll estimate based on recent activity
    const dailyEngagements = engagementLogs?.length || 0
    const estimatedFollowersGained = Math.floor(dailyEngagements * 0.5) // Estimate 0.5 followers per engagement
    
    return NextResponse.json({
      followers: {
        current: currentFollowers,
        gained: estimatedFollowersGained,
      },
      dailyPosts: dailyPostsGenerated,
      engagementRate: `${engagementRate}%`,
      totalInteractions: totalInteractions,
      weeklyActivity: {
        posts: weeklyPosts?.length || 0,
        engagements: weeklyEngagements?.length || 0,
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
