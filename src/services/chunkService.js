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
  let current = '';
  let chunkIndex = 0;

  for (const sentence of sentences) {
    const nextCandidate = current ? `${current} ${sentence}` : sentence;

    if (nextCandidate.length > CHUNK_MAX_LENGTH && current.length >= MIN_CHUNK_LENGTH) {
      chunks.push(buildChunk({ text: current, documentId, chunkIndex, sourceFilename }));
      chunkIndex += 1;
      const overlap = current.slice(-CHUNK_OVERLAP).trim();
      current = overlap ? `${overlap} ${sentence}` : sentence;
      continue;
    }

    current = nextCandidate;
  }

  if (current.trim().length > 0) {
    chunks.push(buildChunk({ text: current, documentId, chunkIndex, sourceFilename }));
  }

  if (chunks.length === 0 && text.trim().length > 0) {
    chunks.push(buildChunk({ text: text.trim(), documentId, chunkIndex, sourceFilename }));
  }

  return chunks;
};

export const estimateChunkCount = (textLength) => Math.max(1, Math.ceil(textLength / (CHUNK_MAX_LENGTH - CHUNK_OVERLAP)));
