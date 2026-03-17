import { NextRequest, NextResponse } from 'next/server'
import { generateMotivationalQuote } from '@/lib/ollama'
import quotesData from '@/lib/quotes-extended.json'

export async function POST(request: NextRequest) {
  try {
    const { type, topic, count = 1 } = await request.json()

    // Generate multiple quotes
    const quotes: { quote: string; type: string; author?: string }[] = []

    for (let i = 0; i < count; i++) {
      if (type === 'motivational') {
        // Use Ollama for AI-generated quotes
        const quote = await generateMotivationalQuote(topic)
        quotes.push({ quote, type: 'motivational' })
      } else if (type === 'famous') {
        // Use extended famous quotes database (150+ quotes)
        const { quotes: famousQuotes } = quotesData
        const filtered = topic 
          ? famousQuotes.filter(q => q.category === topic)
          : famousQuotes
        const randomQuote = filtered[Math.floor(Math.random() * filtered.length)]
        const formatted = `"${randomQuote.text}" — ${randomQuote.author}`
        quotes.push({ quote: formatted, type: 'famous', author: randomQuote.author })
      } else if (type === 'mixed') {
        // 50/50 mix of AI and famous quotes
        if (Math.random() > 0.5) {
          const quote = await generateMotivationalQuote(topic)
          quotes.push({ quote, type: 'motivational' })
        } else {
          const { quotes: famousQuotes } = quotesData
          const filtered = topic 
            ? famousQuotes.filter(q => q.category === topic)
            : famousQuotes
          const randomQuote = filtered[Math.floor(Math.random() * famousQuotes.length)]
          const formatted = `"${randomQuote.text}" — ${randomQuote.author}`
          quotes.push({ quote: formatted, type: 'famous', author: randomQuote.author })
        }
      }
    }

    if (count === 1) {
      return NextResponse.json(quotes[0])
    }

    return NextResponse.json({ quotes, count })
  } catch (error) {
    console.error('Error generating quote:', error)
    return NextResponse.json({ error: 'Failed to generate quote' }, { status: 500 })
  }
}
