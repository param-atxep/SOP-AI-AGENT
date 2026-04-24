import OpenAI from 'openai';
import config from '../config/index.js';
import logger from '../utils/logger.js';
import { delay } from '../utils/validation.js';

const client = new OpenAI({ apiKey: config.openAiApiKey, baseURL: config.openAiApiBase });

const retryRequest = async (fn, attempts = 3) => {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const backoff = 500 * attempt;
      logger.warn({ attempt, message: error.message }, 'Embedding request failed, retrying');
      await delay(backoff);
    }
  }
  throw lastError;
};

export const embedChunks = async (chunks) => {
  if (!Array.isArray(chunks) || chunks.length === 0) {
    return [];
  }

  const batchSize = Math.max(1, config.embeddingBatchSize);
  const embeddingResults = [];

  for (let offset = 0; offset < chunks.length; offset += batchSize) {
    const batch = chunks.slice(offset, offset + batchSize);
    const inputs = batch.map((chunk) => chunk.text);

    const response = await retryRequest(() =>
      client.embeddings.create({
        model: config.embeddingModel,
        input: inputs,
      })
    );

    if (!response || !response.data) {
      throw new Error('OpenAI embeddings response was malformed');
    }

    response.data.forEach((item) => {
      if (!item.embedding || !Array.isArray(item.embedding)) {
        throw new Error('Invalid embedding vector received from OpenAI');
      }
      embeddingResults.push(item.embedding);
    });
  }

  const expectedDim = embeddingResults[0]?.length || 0;
  if (expectedDim === 0) {
    throw new Error('Embedding dimension could not be determined');
  }

  const inconsistent = embeddingResults.some((vector) => vector.length !== expectedDim);
  if (inconsistent) {
    throw new Error('Embedding dimension mismatch detected across chunks');
  }

  return embeddingResults;
};
