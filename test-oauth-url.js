const crypto = require('crypto')

// Simulate the OAuth URL generation
function generatePKCE() {
  const codeVerifier = crypto.randomBytes(32).toString('base64url')
  const codeChallenge = crypto
    .createHash('sha256')
    .update(codeVerifier)
    .digest('base64url')
  
  const state = crypto.randomBytes(32).toString('hex')
  
  return { codeVerifier, codeChallenge, state }
}

const X_CLIENT_ID = process.env.X_API_KEY || 'YOUR_CLIENT_ID'
const REDIRECT_URI = 'https://echo-ai-dashboard.vercel.app/api/x/callback'

const { codeChallenge, state } = generatePKCE()

const params = new URLSearchParams({
  response_type: 'code',
  client_id: X_CLIENT_ID,
  redirect_uri: REDIRECT_URI,
  scope: 'tweet.read tweet.write users.read',
  state: state,
  code_challenge: codeChallenge,
  code_challenge_method: 'S256',
})

const authUrl = `https://twitter.com/i/oauth2/authorize?${params.toString()}`

console.log('Generated OAuth URL:')
console.log(authUrl)
console.log('\n\nKey parts:')
console.log('redirect_uri:', REDIRECT_URI)
console.log('scope:', 'tweet.read tweet.write users.read')
console.log('client_id (first 10 chars):', X_CLIENT_ID.substring(0, 10) + '...')
