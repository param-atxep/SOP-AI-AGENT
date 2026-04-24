const CHUNK_MAX_LENGTH = 1000;
const CHUNK_OVERLAP = 100;
const MIN_CHUNK_LENGTH = 600;

const splitSentences = (text) => {
  const sentenceRegex = /[^.!?\n]+(?:[.!?]+|$)/g;
  const matches = text.match(sentenceRegex);
  return matches ? matches.map((sentence) => sentence.trim()) : [text.trim()];
};

const buildChunk = ({ text, documentId, chunkIndex, sourceFilename }) => ({
  documentId,
  chunkIndex,
  text: text.trim(),
  sourceFilename,
  timestamps: {
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
});

export const buildChunks = ({ text, documentId, sourceFilename }) => {
  const sentences = splitSentences(text);
  const chunks = [];
  let currentSentences = [];
  let currentLength = 0;
  let chunkIndex = 0;

  for (const sentence of sentences) {
    const sentenceLength = sentence.length + 1; // +1 for space

    if (currentLength + sentenceLength > CHUNK_MAX_LENGTH && currentLength >= MIN_CHUNK_LENGTH) {
      // Push current chunk
      const chunkText = currentSentences.join(' ');
      chunks.push(buildChunk({ text: chunkText, documentId, chunkIndex, sourceFilename }));
      chunkIndex += 1;

      // Calculate overlap sentences
      let overlapSentences = [];
      let overlapLength = 0;
      for (let i = currentSentences.length - 1; i >= 0; i--) {
        if (overlapLength >= CHUNK_OVERLAP) break;
        const s = currentSentences[i];
        if (overlapLength + s.length + 1 <= CHUNK_OVERLAP) {
          overlapSentences.unshift(s);
          overlapLength += s.length + 1;
        } else {
          break;
        }
      }

      currentSentences = overlapSentences;
      currentLength = overlapLength;
    }

    // Add the new sentence
    currentSentences.push(sentence);
    currentLength += sentenceLength;
  }

  // Add remaining
  if (currentSentences.length > 0) {
    const chunkText = currentSentences.join(' ');
    chunks.push(buildChunk({ text: chunkText, documentId, chunkIndex, sourceFilename }));
  }

  // Fallback if no chunks and text exists
  if (chunks.length === 0 && text.trim().length > 0) {
    chunks.push(buildChunk({ text: text.trim(), documentId, chunkIndex: 0, sourceFilename }));
  }

  return chunks;
};

export const estimateChunkCount = (textLength) => Math.max(1, Math.ceil(textLength / (CHUNK_MAX_LENGTH - CHUNK_OVERLAP)));
