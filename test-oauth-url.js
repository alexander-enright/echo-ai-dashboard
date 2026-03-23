// Generate a test OAuth URL to verify configuration
const crypto = require('crypto');

const CLIENT_ID = 'NlN4eGpBX0xVbHlsRmU5Nk9PcGg6MTpjaQ';
const REDIRECT_URI = 'https://echo-ai-dashboard.vercel.app/api/x/callback';

// Generate PKCE
const codeVerifier = crypto.randomBytes(32).toString('base64url');
const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url');
const state = crypto.randomBytes(16).toString('hex');

// Build URL with EXACT parameters
const params = new URLSearchParams({
  response_type: 'code',
  client_id: CLIENT_ID,
  redirect_uri: REDIRECT_URI,
  scope: 'tweet.read users.read',  // Minimal scopes first
  state: state,
  code_challenge: codeChallenge,
  code_challenge_method: 'S256',
});

const authUrl = `https://twitter.com/i/oauth2/authorize?${params.toString()}`;

console.log('Test this URL in your browser:');
console.log(authUrl);
console.log('\nParameters being sent:');
console.log('  client_id:', CLIENT_ID);
console.log('  redirect_uri:', REDIRECT_URI);
console.log('  scope: tweet.read users.read');
