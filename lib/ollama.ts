// Ollama API client for local AI generation

const OLLAMA_URL = (process.env.OLLAMA_URL || 'http://localhost:11434').trim()
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'kimi-k2.5'

interface OllamaResponse {
  response: string
  done: boolean
}

// Random topics for variety
const quoteTopics = [
  'success', 'failure', 'persistence', 'dreams', 'goals', 
  'hard work', 'determination', 'courage', 'believing in yourself',
  'overcoming obstacles', 'growth mindset', 'leadership', 'teamwork',
  'innovation', 'creativity', 'discipline', 'focus', 'ambition'
]

const commentStyles = [
  'insightful', 'appreciative', 'thought-provoking', 'supportive',
  'encouraging', 'analytical', 'enthusiastic', 'curious'
]

async function generate(prompt: string, system?: string, temperature: number = 0.9): Promise<string> {
  // Add random seed for variety
  const seed = Math.floor(Math.random() * 10000)
  
  const res = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      prompt: system ? `${system}\n\n${prompt}` : prompt,
      stream: false,
      options: {
        temperature: temperature, // Higher = more random
        num_predict: 150,
        seed: seed, // Random seed each time
        top_p: 0.9,
        top_k: 40,
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
  const randomTopic = topic || quoteTopics[Math.floor(Math.random() * quoteTopics.length)]
  const angle = ['morning', 'difficult times', 'starting fresh', 'pushing through'][Math.floor(Math.random() * 4)]
  
  const system = 'You are a motivational quote generator. Create inspiring, concise quotes suitable for social media. Each quote must be unique and different from previous ones. Respond with ONLY the quote text, no quotes or explanation.'
  
  const prompt = `Generate a fresh, unique motivational quote about ${randomTopic} ${angle ? `for ${angle}` : ''}. Make it inspiring, tweet-worthy (under 280 characters), and different from common quotes. Be creative and original.`

  try {
    const quote = await generate(prompt, system, 0.95)
    return quote.replace(/[""]/g, '').trim()
  } catch (error) {
    console.error('Ollama error:', error)
    return 'Stay motivated and keep pushing forward!'
  }
}

export async function generateComment(tweetText: string): Promise<string> {
  const style = commentStyles[Math.floor(Math.random() * commentStyles.length)]
  
  const system = 'You are a social media engagement expert. Generate thoughtful, relevant comments that add value to conversations. Each comment should be unique and personalized. Keep comments under 280 characters. Respond with ONLY the comment text.'
  
  const prompt = `Generate a ${style} comment responding to this tweet: "${tweetText}". Make it engaging, authentic, and add value to the conversation. Avoid generic responses.`

  try {
    const comment = await generate(prompt, system, 0.9)
    return comment.replace(/[""]/g, '').trim()
  } catch (error) {
    console.error('Ollama error:', error)
    return 'Great point! Thanks for sharing.'
  }
}

export async function generateEngagementComment(tweetText: string): Promise<string> {
  const tone = ['enthusiastic', 'supportive', 'curious', 'appreciative'][Math.floor(Math.random() * 4)]
  
  const system = 'You are a social media expert. Generate short, engaging replies. Each reply should feel fresh and authentic. Keep it under 100 characters. Respond with ONLY the reply text.'
  
  const prompt = `Generate a ${tone} brief reply to this tweet: "${tweetText}". Make it catchy and memorable.`

  try {
    const comment = await generate(prompt, system, 0.95)
    return comment.replace(/[""]/g, '').trim()
  } catch (error) {
    console.error('Ollama error:', error)
    return 'Love this! 🔥'
  }
}
