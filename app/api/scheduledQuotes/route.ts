import { NextRequest, NextResponse } from 'next/server'
import { getScheduledQuotes, saveScheduledQuote, updateScheduledQuote, supabase } from '@/lib/supabase'

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { quote_text, author, category, scheduled_time } = body
    
    if (!quote_text || !author || !scheduled_time) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const quote = await saveScheduledQuote({
      quote_text,
      author,
      category: category || 'motivational',
      scheduled_time,
      posted_to_x: false,
    })
    
    return NextResponse.json({ success: true, quote })
  } catch (error: any) {
    console.error('Error creating scheduled quote:', error)
    return NextResponse.json({ error: 'Failed to create quote' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body
    
    if (!id) {
      return NextResponse.json({ error: 'Quote ID required' }, { status: 400 })
    }

    const quote = await updateScheduledQuote(id, updates)
    return NextResponse.json({ success: true, quote })
  } catch (error: any) {
    console.error('Error updating scheduled quote:', error)
    return NextResponse.json({ error: 'Failed to update quote' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Quote ID required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('scheduled_quotes')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting scheduled quote:', error)
    return NextResponse.json({ error: 'Failed to delete quote' }, { status: 500 })
  }
}
