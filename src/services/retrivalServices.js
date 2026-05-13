import { embedQuery } from './embeddingService.js';
import { performVectorSearch } from './storageService.js';
import logger from '../utils/logger.js';

/**
 * Retrieves relevant chunks for a given query.
 * @param {string} queryText - The user's question.
 * @param {Object} options - Search options (limit, minScore).
 * @returns {Promise<Array>} - Array of relevant chunks with scores.
 */
export const searchRelevantChunks = async (queryText, options = {}) => {
  try {
    const queryVector = await embedQuery(queryText);
    const results = await performVectorSearch(queryVector, options);
    
    logger.info({ queryText, resultCount: results.length }, 'Completed vector search for query');
    
    return results;
  } catch (error) {
    logger.error({ err: error, queryText }, 'Error in searchRelevantChunks');
    throw error;
  }
};

/**
 * Formats retrieved chunks into a single context string for LLM.
 * @param {Array} chunks - Array of chunk objects.
 * @returns {string} - Combined context.
 */
export const formatContext = (chunks) => {
  return chunks
    .map((chunk, index) => `[Source Chunk ${index + 1}]:\n${chunk.text}`)
    .join('\n\n');
};
