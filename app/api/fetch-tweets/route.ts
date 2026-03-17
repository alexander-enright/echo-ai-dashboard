import { NextRequest, NextResponse } from 'next/server'
import { TwitterApi } from 'twitter-api-v2'

export const dynamic = 'force-dynamic'

const client = new TwitterApi(process.env.X_BEARER_TOKEN || '')

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const handle = searchParams.get('handle')

    if (!handle) {
      return NextResponse.json({ error: 'Handle required' }, { status: 400 })
    }

    // Get user by handle
    const user = await client.v2.userByUsername(handle)
    if (!user.data) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get recent tweets
    const tweets = await client.v2.userTimeline(user.data.id, {
      max_results: 5,
      'tweet.fields': ['created_at', 'public_metrics'],
    })

    const formattedTweets = tweets.data.data?.map((tweet: any) => ({
      id: tweet.id,
      text: tweet.text,
      author: handle,
      createdAt: tweet.created_at,
    })) || []

    return NextResponse.json({ tweets: formattedTweets })
  } catch (error: any) {
    console.error('Error fetching tweets:', error)
    return NextResponse.json({ error: 'Failed to fetch tweets' }, { status: 500 })
  }
}
