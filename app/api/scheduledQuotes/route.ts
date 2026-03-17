import { NextRequest, NextResponse } from 'next/server'
import { getScheduledQuotes } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const quotes = await getScheduledQuotes(50)
    return NextResponse.json({ quotes })
  } catch (error: any) {
    console.error('Error fetching scheduled quotes:', error)
    return NextResponse.json({ error: 'Failed to fetch quotes' }, { status: 500 })
  }
}
