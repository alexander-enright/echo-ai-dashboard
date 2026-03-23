import crypto from 'crypto'

// X OAuth 2.0 Configuration
const X_CLIENT_ID = process.env.X_API_KEY
const X_CLIENT_SECRET = process.env.X_API_SECRET
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/x/callback`

// Generate PKCE challenge
export function generatePKCE() {
  const codeVerifier = crypto.randomBytes(32).toString('base64url')
  const codeChallenge = crypto
    .createHash('sha256')
    .update(codeVerifier)
    .digest('base64url')
  
  const state = crypto.randomBytes(32).toString('hex')
  
  return { codeVerifier, codeChallenge, state }
}

// Generate OAuth 2.0 authorization URL
// Scopes for "Read and write" app permissions
export function generateAuthURL() {
  if (!X_CLIENT_ID) {
    throw new Error('X_API_KEY (Client ID) must be configured')
  }
  
  const { codeVerifier, codeChallenge, state } = generatePKCE()
  
  // For "Read and write" permissions, use these scopes:
  // tweet.read, users.read, tweet.write
  const scope = 'tweet.read users.read tweet.write offline.access'
  
  // Build URL manually to ensure proper encoding
  const url = new URL('https://twitter.com/i/oauth2/authorize')
  url.searchParams.append('response_type', 'code')
  url.searchParams.append('client_id', X_CLIENT_ID)
  url.searchParams.append('redirect_uri', REDIRECT_URI)
  url.searchParams.append('scope', scope)
  url.searchParams.append('state', state)
  url.searchParams.append('code_challenge', codeChallenge)
  url.searchParams.append('code_challenge_method', 'S256')
  
  console.log('=== OAuth URL ===')
  console.log('Client ID:', X_CLIENT_ID.substring(0, 10) + '...')
  console.log('Redirect URI:', REDIRECT_URI)
  console.log('Scope:', scope)
  console.log('Full URL:', url.toString().substring(0, 100) + '...')
  
  return {
    url: url.toString(),
    codeVerifier,
    state
  }
}

// Exchange authorization code for access token
export async function exchangeCodeForToken(code: string, codeVerifier: string) {
  if (!X_CLIENT_ID || !X_CLIENT_SECRET) {
    throw new Error('X_API_KEY and X_API_SECRET must be configured')
  }
  
  console.log('=== Token Exchange ===')
  console.log('Exchanging code for token...')
  
  const response = await fetch('https://api.twitter.com/2/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(`${X_CLIENT_ID}:${X_CLIENT_SECRET}`).toString('base64')}`
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: REDIRECT_URI,
      code_verifier: codeVerifier,
    })
  })
  
  if (!response.ok) {
    const errorText = await response.text()
    console.error('Token exchange failed:', response.status, errorText)
    throw new Error(`Token exchange failed: ${response.status} ${errorText}`)
  }
  
  const data = await response.json()
  console.log('Token exchange successful!')
  console.log('Scopes received:', data.scope)
  
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
    scope: data.scope
  }
}

// Refresh access token
export async function refreshAccessToken(refreshToken: string) {
  if (!X_CLIENT_ID || !X_CLIENT_SECRET) {
    throw new Error('X_API_KEY and X_API_SECRET must be configured')
  }
  
  const response = await fetch('https://api.twitter.com/2/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(`${X_CLIENT_ID}:${X_CLIENT_SECRET}`).toString('base64')}`
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    })
  })
  
  if (!response.ok) {
    throw new Error('Failed to refresh token')
  }
  
  return await response.json()
}

// Fetch user profile with OAuth 2.0 token
export async function fetchUserProfile(accessToken: string) {
  console.log('Fetching user profile...')
  
  const response = await fetch('https://api.twitter.com/2/users/me?user.fields=profile_image_url,public_metrics,verified', {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  })
  
  if (!response.ok) {
    const errorText = await response.text()
    console.error('Failed to fetch profile:', response.status, errorText)
    throw new Error(`Failed to fetch user profile: ${response.status}`)
  }
  
  const data = await response.json()
  console.log('Profile fetched:', data.data?.username)
  
  return {
    id: data.data.id,
    username: data.data.username,
    displayName: data.data.name,
    profileImageUrl: data.data.profile_image_url,
    followersCount: data.data.public_metrics?.followers_count || 0,
    verified: data.data.verified || false
  }
}

// Post tweet with OAuth 2.0 token
export async function postTweet(accessToken: string, text: string) {
  console.log('Posting tweet...')
  
  const response = await fetch('https://api.twitter.com/2/tweets', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ text })
  })
  
  if (!response.ok) {
    const error = await response.json()
    console.error('Post tweet error:', error)
    throw new Error(error.detail || 'Failed to post tweet')
  }
  
  const data = await response.json()
  console.log('Tweet posted:', data.data.id)
  return data.data.id
}

// Retweet with OAuth 2.0 token
export async function retweet(accessToken: string, userId: string, tweetId: string) {
  console.log('Retweeting...')
  
  const response = await fetch(`https://api.twitter.com/2/users/${userId}/retweets`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ tweet_id: tweetId })
  })
  
  if (!response.ok) {
    const error = await response.json()
    console.error('Retweet error:', error)
    throw new Error(error.detail || 'Failed to retweet')
  }
  
  return tweetId
}