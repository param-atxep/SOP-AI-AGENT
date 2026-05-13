import { searchRelevantChunks, formatContext } from '../services/retrievalService.js';
import { generateAnswer } from '../services/chatService.js';

export const search = async (req, res, next) => {
  try {
    const { query, limit, minScore } = req.body;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ success: false, error: 'A valid query string is required' });
    }

    const results = await searchRelevantChunks(query, { 
      limit: parseInt(limit, 10) || 5, 
      minScore: parseFloat(minScore) || 0 
    });

    return res.status(200).json({ success: true, results });
  } catch (error) {
    next(error);
  }
};

export const chat = async (req, res, next) => {
  try {
    const { query, limit, minScore } = req.body;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ success: false, error: 'A valid query string is required' });
    }

    // 1. Search for relevant chunks
    const chunks = await searchRelevantChunks(query, { 
      limit: parseInt(limit, 10) || 5, 
      minScore: parseFloat(minScore) || 0 
    });

    if (chunks.length === 0) {
      return res.status(200).json({ 
        success: true, 
        answer: "I'm sorry, but I couldn't find any relevant information in the documents to answer your question.",
        sources: []
      });
    }

    // 2. Format context
    const context = formatContext(chunks);

    // 3. Generate answer
    const answer = await generateAnswer(query, context);

    return res.status(200).json({ 
      success: true, 
      answer, 
      sources: chunks.map(c => ({ 
        documentId: c.documentId, 
        chunkIndex: c.chunkIndex,
        score: c.score 
      }))
    });
  } catch (error) {
    next(error);
  }
};
