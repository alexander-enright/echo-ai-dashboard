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
export function generateAuthURL() {
  if (!X_CLIENT_ID) {
    throw new Error('X_API_KEY (Client ID) must be configured')
  }
  
  const { codeVerifier, codeChallenge, state } = generatePKCE()
  
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: X_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    scope: 'tweet.read tweet.write users.read offline.access',
    state: state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  })
  
  return {
    url: `https://twitter.com/i/oauth2/authorize?${params.toString()}`,
    codeVerifier,
    state
  }
}

// Exchange authorization code for access token
export async function exchangeCodeForToken(code: string, codeVerifier: string) {
  if (!X_CLIENT_ID || !X_CLIENT_SECRET) {
    throw new Error('X_API_KEY and X_API_SECRET must be configured')
  }
  
  console.log('Exchanging code for token...')
  console.log('Client ID:', X_CLIENT_ID.substring(0, 10) + '...')
  console.log('Redirect URI:', REDIRECT_URI)
  
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
  return data.data.id
}

// Retweet with OAuth 2.0 token
export async function retweet(accessToken: string, userId: string, tweetId: string) {
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