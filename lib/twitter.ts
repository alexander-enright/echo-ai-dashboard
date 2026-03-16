import { TwitterApi } from 'twitter-api-v2'

// Check if env vars are loaded
const apiKey = process.env.X_API_KEY
const apiSecret = process.env.X_API_SECRET
const accessToken = process.env.X_ACCESS_TOKEN
const accessSecret = process.env.X_ACCESS_SECRET

if (!apiKey || !apiSecret || !accessToken || !accessSecret) {
  console.error('Missing X API credentials:', {
    hasApiKey: !!apiKey,
    hasApiSecret: !!apiSecret,
    hasAccessToken: !!accessToken,
    hasAccessSecret: !!accessSecret,
  })
  throw new Error('X API credentials not configured')
}

// Create client with OAuth 1.0a User Context (required for posting)
const client = new TwitterApi({
  appKey: apiKey,
  appSecret: apiSecret,
  accessToken: accessToken,
  accessSecret: accessSecret,
})

export async function postTweet(text: string): Promise<string> {
  try {
    const tweet = await client.v2.tweet(text)
    return tweet.data.id
  } catch (error: any) {
    console.error('X API Error:', error.code, error.data)
    throw error
  }
}

export async function replyToTweet(tweetId: string, text: string): Promise<string> {
  try {
    const tweet = await client.v2.reply(text, tweetId)
    return tweet.data.id
  } catch (error: any) {
    console.error('X API Error:', error.code, error.data)
    throw error
  }
}

export async function likeTweet(tweetId: string): Promise<void> {
  try {
    await client.v2.like(accessToken!, tweetId)
  } catch (error: any) {
    console.error('X API Error:', error.code, error.data)
    throw error
  }
}

export async function retweetTweet(tweetId: string): Promise<string> {
  try {
    const retweet = await client.v2.retweet(accessToken!, tweetId)
    return retweet.data?.retweeted ? tweetId : ''
  } catch (error: any) {
    console.error('X API Error:', error.code, error.data)
    throw error
  }
}

export async function getTweet(tweetId: string) {
  try {
    const tweet = await client.v2.singleTweet(tweetId, {
      expansions: ['author_id'],
      'tweet.fields': ['created_at', 'public_metrics', 'text'],
    })
    return tweet.data
  } catch (error: any) {
    console.error('X API Error:', error.code, error.data)
    return null
  }
}

export function extractTweetId(url: string): string | null {
  const match = url.match(/status\/(\d+)/)
  return match ? match[1] : null
}
