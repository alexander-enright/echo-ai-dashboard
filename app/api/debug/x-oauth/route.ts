import { NextRequest, NextResponse } from 'next/server'
import { TwitterApi } from 'twitter-api-v2'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Check environment variables
    const checks = {
      X_API_KEY: process.env.X_API_KEY ? 'Set' : 'Missing',
      X_API_SECRET: process.env.X_API_SECRET ? 'Set' : 'Missing',
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'Missing',
      NODE_ENV: process.env.NODE_ENV
    }
    
    // Try to create Twitter client
    let twitterClientStatus = 'Not tested'
    try {
      const client = new TwitterApi({
        appKey: process.env.X_API_KEY!,
        appSecret: process.env.X_API_SECRET!,
      })
      twitterClientStatus = 'Created successfully'
      
      // Test OAuth generation
      const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/x/callback`
      const authLink = await client.generateAuthLink(callbackUrl, { linkMode: 'authorize' })
      
      return NextResponse.json({
        status: 'success',
        checks,
        callbackUrl,
        authLink: {
          url: authLink.url,
          hasToken: !!authLink.oauth_token,
          hasSecret: !!authLink.oauth_token_secret
        }
      })
    } catch (error: any) {
      return NextResponse.json({
        status: 'error',
        checks,
        error: error.message,
        stack: error.stack
      }, { status: 500 })
    }
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: error.message
    }, { status: 500 })
  }
}
