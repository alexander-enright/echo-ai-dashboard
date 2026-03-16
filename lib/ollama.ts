// Ollama API client for local AI generation

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434'
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'kimi-k2.5'

interface OllamaResponse {
  response: string
  done: boolean
}

async function generate(prompt: string, system?: string): Promise<string> {
  const res = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      prompt: system ? `${system}\n\n${prompt}` : prompt,
      stream: false,
      options: {
        temperature: 0.8,
        num_predict: 150,
      },
    }),
  })

  if (!res.ok) {
    throw new Error(`Ollama API error: ${res.status}`)
  }

  const data: OllamaResponse = await res.json()
  return data.response.trim()
}

export async function generateMotivationalQuote(topic?: string): Promise<string> {
  const system = 'You are a motivational quote generator. Create inspiring, concise quotes suitable for social media. Respond with ONLY the quote text, no quotes or explanation.'
  
  const prompt = topic 
    ? `Generate a short, powerful motivational quote about ${topic}. Make it inspiring and tweet-worthy (under 280 characters).`
    : 'Generate a short, powerful motivational quote. Make it inspiring and tweet-worthy (under 280 characters).'

  try {
    const quote = await generate(prompt, system)
    return quote.replace(/[""]/g, '').trim()
  } catch (error) {
    console.error('Ollama error:', error)
    return 'Stay motivated and keep pushing forward!'
  }
}

export async function generateComment(tweetText: string): Promise<string> {
  const system = 'You are a social media engagement expert. Generate thoughtful, relevant comments that add value to conversations. Keep comments under 280 characters. Respond with ONLY the comment text.'
  
  const prompt = `Generate a thoughtful comment for this tweet: "${tweetText}"`

  try {
    const comment = await generate(prompt, system)
    return comment.replace(/[""]/g, '').trim()
  } catch (error) {
    console.error('Ollama error:', error)
    return 'Great point! Thanks for sharing.'
  }
}

export async function generateEngagementComment(tweetText: string): Promise<string> {
  const system = 'You are a social media expert. Generate a short, engaging reply to show appreciation. Keep it under 100 characters. Respond with ONLY the reply text.'
  
  const prompt = `Generate a brief reply to this tweet: "${tweetText}"`

  try {
    const comment = await generate(prompt, system)
    return comment.replace(/[""]/g, '').trim()
  } catch (error) {
    console.error('Ollama error:', error)
    return 'Love this! 🔥'
  }
}
