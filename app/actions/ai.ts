'use server'

import Task from '@/models/Task';
import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { task } from '../preview/page';

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  compatibility: 'strict',
});

function updateInputTextContent(contentArray: any[], responseText: string) {
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
  const a = await Task.updateOne({ _id: taskId }, { ai: true, content: JSON.stringify(newContent), submitted: true }, { new: true });
  console.log('Saving to database:', { content, response })
}

export async function generateAndSaveAIResponse(extractedcontent: string, content: string, taskId: string) {
  if (!taskId || !content) {
    return { error: 'Missing required fields' }
  }

  try {
    const { text } = await generateText({
      model: openai('gpt-3.5-turbo'),
      prompt: `
         You're helping in filling data
         directly give the answers like humans
         so help with these questions:
        ${extractedcontent}
        `,
    });

    const response = text

    await saveToDatabase(content, response, taskId)

    return { response, message: 'Response generated and saved successfully' }
  } catch (error) {
    console.error('Error generating or saving AI response:', error)
    return { error: 'An error occurred while generating or saving the AI response' }
  }
}

export async function AssignAi(ids: string[]) {
  const tasks = await Task.find({ _id: { $in: ids } });
  const taskPromises = tasks.map(async (task) => {
    if (!task.annotator) {
      const content = extractPlaceholdersFromResponse(task);
      const response = await generateAndSaveAIResponse(content as string, task.content, task._id);
      if (response.error) {
        console.error('Error:', response.error);
      }
    }
  });
  await Promise.all(taskPromises);
}

function extractPlaceholdersFromResponse(task: task) {
  const content = JSON.parse(task.content)
  const extractedPlaceholders: string[] = []
  let hasInputText = false;
  const extractPlaceholders = (item: any) => {
    if (Array.isArray(item.content)) {
      item.content.forEach(extractPlaceholders)
    } else if (item.type) {
      if (item.type === "inputText") {
        hasInputText = true;
      }
      if ((item.type === "dynamicText" || item.type === "text") && item.content?.innerText) {
        extractedPlaceholders.push(item.content.innerText);
      }
    }
  }

  try {
    content.forEach(extractPlaceholders)
    if (!hasInputText) {
      throw new Error("Error: Missing 'inputText' type.");
    }
    if (extractedPlaceholders.length === 0) {
      throw new Error("Error: Missing 'dynamicText' or 'text' types.");
    }
    return extractedPlaceholders.join("\n")
  } catch (error: any) {
    console.error(error.message);
  }
}
