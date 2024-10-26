'use server'

import { createGroq } from '@ai-sdk/groq';
import OpenAI from 'openai';
import { generateText } from 'ai';
import Task from '@/models/Task';

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

function updateInputTextContent(contentArray, responseText) {
  return contentArray.map(item => {
    // If it's an inputText type, update innerText with response
    if (item.type === 'inputText') {
      item.content.innerText = responseText;
    }

    // If the element has nested content, call the function recursively
    if (item.content && Array.isArray(item.content)) {
      item.content = updateInputTextContent(item.content, responseText);
    }

    return item;
  });
}


async function saveToDatabase(content: string, response: string, taskId: string) {
  const newContent = updateInputTextContent(JSON.parse(content), response);
  const a =await Task.updateOne({ _id: taskId }, { content: JSON.stringify(newContent), submitted: true },{ new: true });
  console.log('Saving to database:', { content, response })
  console.log(a)
}



export async function generateAndSaveAIResponse(extractedcontent: string, content: string, taskId: string) {
  const apiKey = "as"
  const provider = "groq"

  if (!apiKey || !taskId || !content) {
    return { error: 'Missing required fields' }
  }

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
        model: groq('llama-3.2-1b-preview'),
        prompt: `
         You're helping in filling data
         directly give the answers like humans
         so help with these questions:
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