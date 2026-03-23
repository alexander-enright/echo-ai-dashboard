const crypto = require('crypto');

// Get the actual values
const CLIENT_ID = 'NlN4eGpBX0xVbHlsRmU5Nk9PcGg6MTpjaQ';
const REDIRECT_URI = 'https://echo-ai-dashboard.vercel.app/api/x/callback';

// Generate PKCE
const codeVerifier = crypto.randomBytes(32).toString('base64url');
const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url');
const state = crypto.randomBytes(32).toString('hex');

// Build URL
const params = new URLSearchParams({
  response_type: 'code',
  client_id: CLIENT_ID,
  redirect_uri: REDIRECT_URI,
  scope: 'users.read',
  state: state,
  code_challenge: codeChallenge,
  code_challenge_method: 'S256',
});

const authUrl = `https://twitter.com/i/oauth2/authorize?${params.toString()}`;

console.log('=== OAuth Test URL ===');
console.log(authUrl);
console.log('\n=== Parameters ===');
console.log('client_id:', CLIENT_ID);
console.log('redirect_uri:', REDIRECT_URI);
console.log('scope:', 'users.read');
console.log('state:', state);
console.log('code_challenge:', codeChallenge.substring(0, 20) + '...');
