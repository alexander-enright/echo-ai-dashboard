import crypto from 'crypto';

// X OAuth 2.0 Configuration
const X_CLIENT_ID = process.env.X_API_KEY;
const X_CLIENT_SECRET = process.env.X_API_SECRET;
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/x/callback`;

// Scopes required for Buffer-style functionality
// tweet.read: Read tweets and user data
// tweet.write: Post tweets (requires Elevated access)
// users.read: Read user profile info
// offline.access: Get refresh_token for long-term access
const SCOPES = 'tweet.read tweet.write users.read offline.access';

/**
 * Generate PKCE challenge for OAuth 2.0
 * PKCE (Proof Key for Code Exchange) prevents authorization code interception attacks
 */
export function generatePKCE() {
  // code_verifier: random 128-character string
  const codeVerifier = crypto.randomBytes(96).toString('base64url');
  
  // code_challenge: SHA256 hash of code_verifier, base64url encoded
  const codeChallenge = crypto
    .createHash('sha256')
    .update(codeVerifier)
    .digest('base64url');
  
  // state: random string for CSRF protection
  const state = crypto.randomBytes(32).toString('hex');
  
  return { codeVerifier, codeChallenge, state };
}

/**
 * Generate OAuth 2.0 authorization URL
 * This is step 1: Redirect user to X authorization endpoint
 */
export function generateAuthURL() {
  if (!X_CLIENT_ID) {
    throw new Error('X_API_KEY (Client ID) must be configured');
  }
  
  const { codeVerifier, codeChallenge, state } = generatePKCE();
  
  // Build authorization URL with all required parameters
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: X_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    scope: SCOPES,
    state: state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });
  
  const url = `https://twitter.com/i/oauth2/authorize?${params.toString()}`;
  
  console.log('[OAuth] Generated auth URL:', {
    clientId: X_CLIENT_ID.substring(0, 10) + '...',
    redirectUri: REDIRECT_URI,
    scopes: SCOPES,
  });
  
  return { url, codeVerifier, state };
}

/**
 * Exchange authorization code for access token
 * This is step 3: After user authorizes, exchange the code for tokens
 */
export async function exchangeCodeForToken(code: string, codeVerifier: string) {
  if (!X_CLIENT_ID || !X_CLIENT_SECRET) {
    throw new Error('X_API_KEY and X_API_SECRET must be configured');
  }
  
  console.log('[OAuth] Exchanging code for token...');
  
  const response = await fetch('https://api.twitter.com/2/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(`${X_CLIENT_ID}:${X_CLIENT_SECRET}`).toString('base64')}`,
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: REDIRECT_URI,
      code_verifier: codeVerifier,
    }),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('[OAuth] Token exchange failed:', response.status, errorText);
    throw new Error(`Token exchange failed: ${response.status} ${errorText}`);
  }
  
  const data = await response.json();
  
  console.log('[OAuth] Token exchange successful:', {
    hasAccessToken: !!data.access_token,
    hasRefreshToken: !!data.refresh_token,
    expiresIn: data.expires_in,
    scope: data.scope,
  });
  
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token, // Only present if offline.access scope granted
    expiresIn: data.expires_in, // seconds until expiration
    scope: data.scope,
  };
}

/**
 * Refresh access token using refresh_token
 * Called automatically when access_token is expired
 */
export async function refreshAccessToken(refreshToken: string) {
  if (!X_CLIENT_ID || !X_CLIENT_SECRET) {
    throw new Error('X_API_KEY and X_API_SECRET must be configured');
  }
  
  console.log('[OAuth] Refreshing access token...');
  
  const response = await fetch('https://api.twitter.com/2/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(`${X_CLIENT_ID}:${X_CLIENT_SECRET}`).toString('base64')}`,
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('[OAuth] Token refresh failed:', response.status, errorText);
    throw new Error(`Token refresh failed: ${response.status}`);
  }
  
  const data = await response.json();
  
  console.log('[OAuth] Token refresh successful');
  
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token, // May be new refresh_token
    expiresIn: data.expires_in,
  };
}

/**
 * Calculate expiration timestamp from expires_in (seconds)
 */
export function calculateExpiration(expiresIn: number): Date {
  return new Date(Date.now() + expiresIn * 1000);
}

/**
 * Check if token is expired (with 5-minute buffer)
 */
export function isTokenExpired(expiresAt: Date): boolean {
  const bufferMs = 5 * 60 * 1000; // 5 minutes before actual expiration
  return new Date(Date.now() + bufferMs) >= expiresAt;
}

/**
 * Fetch user profile from X API
 * Used after OAuth to get x_user_id and profile info
 */
export async function fetchUserProfile(accessToken: string) {
  console.log('[X API] Fetching user profile...');
  
  const response = await fetch(
    'https://api.twitter.com/2/users/me?user.fields=profile_image_url,public_metrics,verified',
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('[X API] Failed to fetch profile:', response.status, errorText);
    throw new Error(`Failed to fetch user profile: ${response.status}`);
  }
  
  const data = await response.json();
  
  console.log('[X API] Profile fetched:', {
    id: data.data?.id,
    username: data.data?.username,
  });
  
  return {
    id: data.data.id,
    username: data.data.username,
    displayName: data.data.name,
    profileImageUrl: data.data.profile_image_url,
    followersCount: data.data.public_metrics?.followers_count || 0,
    verified: data.data.verified || false,
  };
}

/**
 * Post a tweet using OAuth 2.0 access token
 * Requires tweet.write scope
 */
export async function postTweet(accessToken: string, text: string) {
  console.log('[X API] Posting tweet...');
  
  const response = await fetch('https://api.twitter.com/2/tweets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    console.error('[X API] Post tweet error:', error);
    throw new Error(error.detail || 'Failed to post tweet');
  }
  
  const data = await response.json();
  
  console.log('[X API] Tweet posted:', data.data.id);
  
  return {
    tweetId: data.data.id,
    text: data.data.text,
  };
}

/**
 * Retweet using OAuth 2.0 access token
 * Requires tweet.write scope
 */
export async function retweet(accessToken: string, userId: string, tweetId: string) {
  console.log('[X API] Retweeting:', tweetId);
  
  const response = await fetch(
    `https://api.twitter.com/2/users/${userId}/retweets`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tweet_id: tweetId }),
    }
  );
  
  if (!response.ok) {
    const error = await response.json();
    console.error('[X API] Retweet error:', error);
    throw new Error(error.detail || 'Failed to retweet');
  }
  
  console.log('[X API] Retweet successful');
  
  return tweetId;
}

/**
 * Get user's timeline (for reading tweets)
 * Requires tweet.read scope
 */
export async function getUserTimeline(accessToken: string, userId: string, maxResults: number = 10) {
  const response = await fetch(
    `https://api.twitter.com/2/users/${userId}/tweets?max_results=${maxResults}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  
  if (!response.ok) {
    throw new Error(`Failed to fetch timeline: ${response.status}`);
  }
  
  const data = await response.json();
  return data.data || [];
}