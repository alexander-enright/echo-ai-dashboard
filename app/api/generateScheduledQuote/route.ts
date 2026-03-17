import { NextRequest, NextResponse } from 'next/server'
import { generateMotivationalQuote } from '@/lib/ollama'
import { saveScheduledQuote, getAutomationSetting } from '@/lib/supabase'
import { postTweet } from '@/lib/twitter'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { scheduled_time } = await request.json()
    
    if (!scheduled_time) {
      return NextResponse.json({ error: 'scheduled_time required' }, { status: 400 })
    }

    // Generate quote using Ollama
    const quoteText = await generateMotivationalQuote()
    
    // Parse quote and author (format: "Quote text" — Author)
    const match = quoteText.match(/^"?(.+?)"?\s*(?:[—-]\s*|\s*-\s*|\s*by\s+)?(.+?)$/i)
    const quote = match ? match[1].trim() : quoteText
    const author = match ? match[2].trim() : 'Unknown'

    // Save to database
    const savedQuote = await saveScheduledQuote({
      quote_text: quote,
      author: author,
      scheduled_time: scheduled_time,
      category: 'motivational',
    })

    // Check if auto-post is enabled
    const autoPostEnabled = await getAutomationSetting('auto_post_quotes')
    let tweetId = null
    let postedAt = null

    if (autoPostEnabled) {
      try {
        tweetId = await postTweet(`"${quote}" — ${author}`)
        postedAt = new Date().toISOString()
        // Update the quote as posted
        const { updateScheduledQuote } = await import('@/lib/supabase')
        await updateScheduledQuote(savedQuote.id, {
          posted_to_x: true,
          tweet_id: tweetId,
          posted_at: postedAt,
        })
      } catch (error) {
        console.error('Auto-post failed:', error)
      }
    }

    return NextResponse.json({
      success: true,
      quote: {
        id: savedQuote.id,
        quote_text: quote,
        author: author,
        scheduled_time: scheduled_time,
        posted_to_x: autoPostEnabled && !!tweetId,
        tweet_id: tweetId,
      },
      auto_posted: autoPostEnabled && !!tweetId,
    })
  } catch (error: any) {
    console.error('Error generating scheduled quote:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate quote' },
      { status: 500 }
    )
  }
}
