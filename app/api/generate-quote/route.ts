import { NextRequest, NextResponse } from 'next/server'
import { generateMotivationalQuote } from '@/lib/ollama'
import quotesData from '@/lib/quotes.json'

export async function POST(request: NextRequest) {
  try {
    const { type, topic } = await request.json()

    if (type === 'motivational') {
      const quote = await generateMotivationalQuote(topic)
      return NextResponse.json({ quote, type: 'motivational' })
    } else if (type === 'famous') {
      const { quotes } = quotesData
      const filtered = topic 
        ? quotes.filter(q => q.category === topic)
        : quotes
      const randomQuote = filtered[Math.floor(Math.random() * filtered.length)]
      const formatted = `"${randomQuote.text}" — ${randomQuote.author}`
      return NextResponse.json({ quote: formatted, type: 'famous' })
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  } catch (error) {
    console.error('Error generating quote:', error)
    return NextResponse.json({ error: 'Failed to generate quote' }, { status: 500 })
  }
}
