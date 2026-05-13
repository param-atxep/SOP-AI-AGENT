import OpenAI from 'openai';
import config from '../config/index.js';
import logger from '../utils/logger.js';

const client = new OpenAI({ apiKey: config.openAiApiKey, baseURL: config.openAiApiBase });

/**
 * Generates an answer based on the provided context and user query.
 * @param {string} query - User's question.
 * @param {string} context - Retrieved chunks formatted as string.
 * @returns {Promise<string>} - LLM generated answer.
 */
export const generateAnswer = async (query, context) => {
  try {
    const systemPrompt = `
You are an expert SOP (Standard Operating Procedure) Assistant. 
Your goal is to provide accurate, concise, and helpful answers based ONLY on the provided context from the SOP documents.

Guidelines:
1. If the answer is present in the context, summarize it clearly and provide a step-by-step explanation if applicable.
2. If the answer is NOT present in the context, explicitly state: "I'm sorry, but I couldn't find information regarding this in the provided documents."
3. DO NOT hallucinate or use external knowledge not present in the context.
4. Maintain a professional and helpful tone.

Context:
${context}
`;

    const response = await client.chat.completions.create({
      model: config.chatModel || 'gpt-4o-mini', // Defaulting to a cheap/fast model
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: query },
      ],
      temperature: 0, // Lower temperature for more factual responses
    });

    return response.choices[0].message.content;
  } catch (error) {
    logger.error({ err: error, query }, 'Error in generateAnswer');
    throw error;
  }
};
