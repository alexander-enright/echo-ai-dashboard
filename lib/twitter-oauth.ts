import { TwitterApi } from 'twitter-api-v2'
import crypto from 'crypto'

// X OAuth 1.0a Configuration
const X_API_KEY = process.env.X_API_KEY
const X_API_SECRET = process.env.X_API_SECRET

// Callback URL for OAuth
const CALLBACK_URL = process.env.NEXT_PUBLIC_APP_URL 
  ? `${process.env.NEXT_PUBLIC_APP_URL}/api/x/callback`
  : 'http://localhost:3000/api/x/callback'

// Generate OAuth tokens
export function generateOAuthTokens() {
  const state = crypto.randomBytes(32).toString('hex')
  const codeVerifier = crypto.randomBytes(32).toString('base64url')
  
  return { state, codeVerifier }
}

// Create OAuth client for user authentication
export function createOAuthClient() {
  if (!X_API_KEY || !X_API_SECRET) {
    throw new Error('X_API_KEY and X_API_SECRET must be configured')
  }
  
  return new TwitterApi({
    appKey: X_API_KEY,
    appSecret: X_API_SECRET,
  })
}

// Generate OAuth 1.0a request token
export async function generateAuthLink() {
  const client = createOAuthClient()
  
  try {
    const authLink = await client.generateAuthLink(CALLBACK_URL, {
      linkMode: 'authorize'
    })
    
    return {
      url: authLink.url,
      oauthToken: authLink.oauth_token,
      oauthTokenSecret: authLink.oauth_token_secret
    }
  } catch (error) {
    console.error('Error generating OAuth link:', error)
    throw new Error('Failed to generate authentication link')
  }
}

// Exchange OAuth tokens for access tokens
export async function loginWithOAuth(
  oauthToken: string,
  oauthVerifier: string
) {
  const client = createOAuthClient()
  
  try {
    // Get the cached token secret (this should be stored temporarily during the OAuth flow)
    // In a real implementation, you'd store this in a session or temporary storage
    const { accessToken, accessSecret, screenName, userId } = await client.login(oauthVerifier)
    
    return {
      accessToken,
      accessSecret,
      screenName,
      userId
    }
  } catch (error) {
    console.error('Error exchanging OAuth tokens:', error)
    throw new Error('Failed to complete OAuth authentication')
  }
}

// Create user client with stored credentials
export function createUserClient(accessToken: string, accessSecret: string) {
  if (!X_API_KEY || !X_API_SECRET) {
    throw new Error('X_API_KEY and X_API_SECRET must be configured')
  }
  
  return new TwitterApi({
    appKey: X_API_KEY,
    appSecret: X_API_SECRET,
    accessToken: accessToken,
    accessSecret: accessSecret,
  })
}

// Fetch user profile
export async function fetchUserProfile(accessToken: string, accessSecret: string) {
  const client = createUserClient(accessToken, accessSecret)
  
  try {
    const user = await client.v2.me({
      'user.fields': ['profile_image_url', 'public_metrics', 'verified']
    })
    
    return {
      id: user.data.id,
      username: user.data.username,
      displayName: user.data.name,
      profileImageUrl: user.data.profile_image_url || null,
      followersCount: user.data.public_metrics?.followers_count || 0,
      verified: user.data.verified || false
    }
  } catch (error) {
    console.error('Error fetching user profile:', error)
    throw new Error('Failed to fetch user profile')
  }
}

// Post tweet with user credentials
export async function postTweetAsUser(
  accessToken: string,
  accessSecret: string,
  text: string
) {
  const client = createUserClient(accessToken, accessSecret)
  
  try {
    const tweet = await client.v2.tweet(text)
    return tweet.data.id
  } catch (error: any) {
    console.error('Error posting tweet:', error)
    throw new Error(error.message || 'Failed to post tweet')
  }
}

// Retweet with user credentials
export async function retweetAsUser(
  accessToken: string,
  accessSecret: string,
  tweetId: string
) {
  const client = createUserClient(accessToken, accessSecret)
  
  try {
    const user = await client.v2.me()
    const retweet = await client.v2.retweet(user.data.id, tweetId)
    
    if (!retweet.data?.retweeted) {
      throw new Error('Retweet was not successful')
    }
    
    return tweetId
  } catch (error: any) {
    console.error('Error retweeting:', error)
    throw new Error(error.message || 'Failed to retweet')
  }
}

// Verify credentials are valid
export async function verifyCredentials(accessToken: string, accessSecret: string) {
  try {
    const profile = await fetchUserProfile(accessToken, accessSecret)
    return { valid: true, profile }
  } catch (error) {
    return { valid: false, error: 'Invalid credentials' }
  }
}
