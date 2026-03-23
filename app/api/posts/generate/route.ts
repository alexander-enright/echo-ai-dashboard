import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createGeneratedPost, logActivity } from '@/lib/supabase-server'
import { generateMotivationalQuote } from '@/lib/ollama'
import quotesData from '@/lib/quotes-extended.json'

export async function POST(request: NextRequest) {
  try {
    // Create Supabase client
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { type, topic, count = 1, saveToDatabase = true } = await request.json()

    // Generate quote
    let content: string
    let quoteType: string
    let author: string | undefined

    if (type === 'motivational') {
      content = await generateMotivationalQuote(topic)
      quoteType = 'motivational'
    } else if (type === 'famous') {
      const { quotes: famousQuotes } = quotesData
      const filtered = topic 
        ? famousQuotes.filter(q => q.category === topic)
        : famousQuotes
      const randomQuote = filtered[Math.floor(Math.random() * filtered.length)]
      content = `"${randomQuote.text}" — ${randomQuote.author}`
      quoteType = 'famous'
      author = randomQuote.author
    } else if (type === 'mixed') {
      if (Math.random() > 0.5) {
        content = await generateMotivationalQuote(topic)
        quoteType = 'motivational'
      } else {
        const { quotes: famousQuotes } = quotesData
        const randomQuote = famousQuotes[Math.floor(Math.random() * famousQuotes.length)]
        content = `"${randomQuote.text}" — ${randomQuote.author}`
        quoteType = 'famous'
        author = randomQuote.author
      }
    } else {
      content = await generateMotivationalQuote(topic)
      quoteType = 'motivational'
    }

    // Save to database
    let postId: string | undefined
    if (saveToDatabase) {
      const post = await createGeneratedPost(user.id, content)
      postId = post.id
    }

    // Log activity
    await logActivity(user.id, 'generate_post', {
      postId,
      type: quoteType,
      topic,
      contentLength: content.length
    })

    return NextResponse.json({
      success: true,
      content,
      type: quoteType,
      author,
      postId,
      length: content.length
    })
    
  } catch (error: any) {
    console.error('Error generating post:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate post' },
      { status: 500 }
    )
  }
}