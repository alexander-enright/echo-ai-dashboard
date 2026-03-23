import { NextRequest, NextResponse } from 'next/server'
import { generateAuthURL, exchangeCodeForToken, fetchUserProfile } from '@/lib/twitter-oauth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Test 1: Generate OAuth URL
    console.log('Test 1: Generating OAuth URL...')
    const authData = generateAuthURL()
    
    // Test 2: Check environment
    const envCheck = {
      hasClientId: !!process.env.X_API_KEY,
      hasClientSecret: !!process.env.X_API_SECRET,
      hasAppUrl: !!process.env.NEXT_PUBLIC_APP_URL,
      appUrl: process.env.NEXT_PUBLIC_APP_URL,
    }
    
    return NextResponse.json({
      status: 'ok',
      envCheck,
      authUrlPreview: authData.url.substring(0, 100) + '...',
      message: 'OAuth configuration looks correct'
    })
    
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}