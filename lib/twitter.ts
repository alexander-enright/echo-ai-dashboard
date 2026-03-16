import { TwitterApi } from 'twitter-api-v2'

// Bearer Token authentication (simpler, but limited)
const bearerToken = process.env.X_BEARER_TOKEN

// OAuth 1.0a User Context (required for posting)
const apiKey = process.env.X_API_KEY
const apiSecret = process.env.X_API_SECRET
const accessToken = process.env.X_ACCESS_TOKEN
const accessSecret = process.env.X_ACCESS_SECRET

// Debug logging - show first 10 chars of each token to verify
console.log('X API Config:', {
  hasBearerToken: !!bearerToken,
  hasApiKey: !!apiKey,
  hasApiSecret: !!apiSecret,
  hasAccessToken: !!accessToken,
  hasAccessSecret: !!accessSecret,
  apiKeyPreview: apiKey ? apiKey.substring(0, 10) + '...' : 'missing',
  accessTokenPreview: accessToken ? accessToken.substring(0, 10) + '...' : 'missing',
})

// Create OAuth 1.0a client for user context (posting tweets)
let userClient: TwitterApi | null = null
if (apiKey && apiSecret && accessToken && accessSecret) {
  try {
    userClient = new TwitterApi({
      appKey: apiKey,
      appSecret: apiSecret,
      accessToken: accessToken,
      accessSecret: accessSecret,
    })
    console.log('X API: OAuth 1.0a client created successfully')
  } catch (error) {
    console.error('X API: Failed to create OAuth 1.0a client:', error)
  }
}

// Create Bearer token client for read-only operations
let appClient: TwitterApi | null = null
if (bearerToken) {
  try {
    appClient = new TwitterApi(bearerToken)
    console.log('X API: Bearer token client created successfully')
  } catch (error) {
    console.error('X API: Failed to create Bearer token client:', error)
  }
}

export async function postTweet(text: string): Promise<string> {
  if (!userClient) {
    throw new Error('X API user credentials not configured')
  }
  try {
    console.log('Attempting to post tweet with text:', text.substring(0, 50) + '...')
    const tweet = await userClient.v2.tweet(text)
    console.log('Tweet posted successfully:', tweet.data.id)
    return tweet.data.id
  } catch (error: any) {
    console.error('X API Error posting tweet:', error.code, JSON.stringify(error.data, null, 2))
    throw error
  }
}

export async function replyToTweet(tweetId: string, text: string): Promise<string> {
  if (!userClient) {
    throw new Error('X API user credentials not configured')
  }
  try {
    const tweet = await userClient.v2.reply(text, tweetId)
    return tweet.data.id
  } catch (error: any) {
    console.error('X API Error replying:', error.code, JSON.stringify(error.data, null, 2))
    throw error
  }
}

export async function likeTweet(tweetId: string): Promise<void> {
  if (!userClient) {
    throw new Error('X API user credentials not configured')
  }
  try {
    await userClient.v2.like(accessToken!, tweetId)
  } catch (error: any) {
    console.error('X API Error liking:', error.code, JSON.stringify(error.data, null, 2))
    throw error
  }
}

export async function retweetTweet(tweetId: string): Promise<string> {
  if (!userClient) {
    throw new Error('X API user credentials not configured')
  }
  try {
    const retweet = await userClient.v2.retweet(accessToken!, tweetId)
    return retweet.data?.retweeted ? tweetId : ''
  } catch (error: any) {
    console.error('X API Error retweeting:', error.code, JSON.stringify(error.data, null, 2))
    throw error
  }
}

export async function getTweet(tweetId: string) {
  const client = userClient || appClient
  if (!client) {
    throw new Error('X API not configured')
  }
  try {
    const tweet = await client.v2.singleTweet(tweetId, {
      expansions: ['author_id'],
      'tweet.fields': ['created_at', 'public_metrics', 'text'],
    })
    return tweet.data
  } catch (error: any) {
    console.error('X API Error getting tweet:', error.code, JSON.stringify(error.data, null, 2))
    return null
  }
}

export function extractTweetId(url: string): string | null {
  const match = url.match(/status\/(\d+)/)
  return match ? match[1] : null
}
// Force rebuild
