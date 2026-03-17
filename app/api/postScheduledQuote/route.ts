import { NextRequest, NextResponse } from 'next/server'
import { updateScheduledQuote } from '@/lib/supabase'
import { postTweet } from '@/lib/twitter'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { quote_id } = await request.json()
    
    if (!quote_id) {
      return NextResponse.json({ error: 'quote_id required' }, { status: 400 })
    }

    // Get the quote from database
    const { getScheduledQuotes } = await import('@/lib/supabase')
    const quotes = await getScheduledQuotes(1)
    const quote = quotes.find((q: any) => q.id === quote_id)
    
    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
    }

    if (quote.posted_to_x) {
      return NextResponse.json({ error: 'Quote already posted' }, { status: 400 })
    }

    // Post to X
    const tweetId = await postTweet(`"${quote.quote_text}" — ${quote.author}`)
    
    // Update database
    await updateScheduledQuote(quote_id, {
      posted_to_x: true,
      tweet_id: tweetId,
      posted_at: new Date().toISOString(),
    })

    return NextResponse.json({ success: true, tweet_id: tweetId })
  } catch (error: any) {
    console.error('Error posting scheduled quote:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to post quote' },
      { status: 500 }
    )
  }
}
