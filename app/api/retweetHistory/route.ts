import { NextRequest, NextResponse } from 'next/server'
import { getRetweetHistory } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const retweets = await getRetweetHistory(100)
    return NextResponse.json({ retweets })
  } catch (error: any) {
    console.error('Error fetching retweet history:', error)
    return NextResponse.json({ error: 'Failed to fetch retweets' }, { status: 500 })
  }
}
