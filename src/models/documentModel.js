export const DOCUMENT_STATUS = {
  UPLOADED: 'uploaded',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
};

export const createDocumentPayload = ({ documentId, filename, contentHash, sourceType, sourcePath }) => ({
  documentId,
  filename,
  contentHash,
  sourceType,
  sourcePath,
  status: DOCUMENT_STATUS.UPLOADED,
  uploadedAt: new Date(),
  updatedAt: new Date(),
  metadata: {},
});
