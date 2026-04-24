export const createChunkRecord = ({ documentId, chunkIndex, text, sourceFilename, pageNumbers = [] }) => ({
  documentId,
  chunkIndex,
  text,
  sourceFilename,
  pageNumbers,
  embedding: null,
  createdAt: new Date(),
  updatedAt: new Date(),
});
