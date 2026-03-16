import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function generateMotivationalQuote(topic?: string): Promise<string> {
  const prompt = topic 
    ? `Generate a short, powerful motivational quote about ${topic}. Make it inspiring and tweet-worthy (under 280 characters).`
    : 'Generate a short, powerful motivational quote. Make it inspiring and tweet-worthy (under 280 characters).'

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are a motivational quote generator. Create inspiring, concise quotes suitable for social media.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    max_tokens: 100,
    temperature: 0.8,
  })

  return completion.choices[0]?.message?.content?.trim() || 'Stay motivated and keep pushing forward!'
}

export async function generateComment(tweetText: string): Promise<string> {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are a social media engagement expert. Generate thoughtful, relevant comments that add value to conversations. Keep comments under 280 characters.',
      },
      {
        role: 'user',
        content: `Generate a thoughtful comment for this tweet: "${tweetText}"`,
      },
    ],
    max_tokens: 100,
    temperature: 0.7,
  })

  return completion.choices[0]?.message?.content?.trim() || 'Great point! Thanks for sharing.'
}

export async function generateEngagementComment(tweetText: string): Promise<string> {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are a social media expert. Generate a short, engaging reply to show appreciation. Keep it under 100 characters.',
      },
      {
        role: 'user',
        content: `Generate a brief reply to this tweet: "${tweetText}"`,
      },
    ],
    max_tokens: 50,
    temperature: 0.7,
  })

  return completion.choices[0]?.message?.content?.trim() || 'Love this! 🔥'
}
