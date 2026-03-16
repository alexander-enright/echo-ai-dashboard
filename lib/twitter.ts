import { TwitterApi } from 'twitter-api-v2'

const client = new TwitterApi({
  appKey: process.env.X_API_KEY!,
  appSecret: process.env.X_API_SECRET!,
  accessToken: process.env.X_ACCESS_TOKEN!,
  accessSecret: process.env.X_ACCESS_SECRET!,
})

export async function postTweet(text: string): Promise<string> {
  const tweet = await client.v2.tweet(text)
  return tweet.data.id
}

export async function replyToTweet(tweetId: string, text: string): Promise<string> {
  const tweet = await client.v2.reply(text, tweetId)
  return tweet.data.id
}

export async function likeTweet(tweetId: string): Promise<void> {
  await client.v2.like(process.env.X_ACCESS_TOKEN!, tweetId)
}

export async function retweetTweet(tweetId: string): Promise<string> {
  const retweet = await client.v2.retweet(process.env.X_ACCESS_TOKEN!, tweetId)
  return retweet.data?.retweeted ? tweetId : ''
}

export async function getTweet(tweetId: string) {
  const tweet = await client.v2.singleTweet(tweetId, {
    expansions: ['author_id'],
    'tweet.fields': ['created_at', 'public_metrics', 'text'],
  })
  return tweet.data
}

export function extractTweetId(url: string): string | null {
  const match = url.match(/status\/(\d+)/)
  return match ? match[1] : null
}
