import OpenAI from 'openai'
import dotenv from 'dotenv'

dotenv.config()

const openai = new OpenAI({
  apiKey:  process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || 'https://api.chatanywhere.tech/v1'
})

// Rewrite vague queries into better search terms
export const rewriteQuery = async (query: string): Promise<string> => {
  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content: `You are a search query optimizer for a sports/fashion e-commerce store.
Rewrite the user query into better search terms.
Return ONLY the rewritten query, nothing else.
Examples:
- "cheap running shoes" → "budget running sneakers"
- "something to wear to gym" → "gym workout clothing"
- "nik air" → "Nike Air"
- "warm winter jacket" → "winter jacket coat"`
      },
      { role: 'user', content: query }
    ],
    max_tokens: 50,
    temperature: 0.3
  })

  return response.choices[0].message.content?.trim() || query
}

// Expand query with synonyms
export const expandQueryWithSynonyms = async (query: string): Promise<string[]> => {
  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content: `You are a search synonym generator for a sports/fashion e-commerce store.
Return 3 synonym variations of the query as a JSON array of strings.
Return ONLY the JSON array, nothing else.
Example: "sneakers" → ["shoes", "trainers", "footwear"]`
      },
      { role: 'user', content: query }
    ],
    max_tokens: 100,
    temperature: 0.5
  })

  try {
    const content = response.choices[0].message.content?.trim() || '[]'
    return JSON.parse(content)
  } catch {
    return [query]
  }
}