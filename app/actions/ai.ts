'use server'

import { createGroq } from '@ai-sdk/groq';
import OpenAI from 'openai';
import { generateText } from 'ai';

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

async function saveToDatabase(content: string, response: string, taskId: string) {
  console.log('Saving to database:', { content, response })
}



export async function generateAndSaveAIResponse(extractedcontent: string, content: string, taskId: string) {
  const apiKey = "as"
  const provider = "groq"

  // if (!apiKey || !provider || !content) {
  //   return { error: 'Missing required fields' }
  // }

  try {
    let response: string

    if (provider === 'openai') {
      const openai = new OpenAI({ apiKey })
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content }],
      })
      response = completion.choices[0].message.content || ''

    } else if (provider === 'groq') {

      const { text } = await generateText({
        model: groq('gemma2-9b-it'),
        prompt: `
         You're an AI assistant who answers questions in a concise way.

          You're a chat bot, so keep your replies succinct.
        ${extractedcontent}
        `,
      });

      response = text

    } else {
      return { error: 'Invalid provider' }
    }

    await saveToDatabase(content, response, taskId)

    return { response, message: 'Response generated and saved successfully' }
  } catch (error) {
    console.error('Error generating or saving AI response:', error)
    return { error: 'An error occurred while generating or saving the AI response' }
  }
}