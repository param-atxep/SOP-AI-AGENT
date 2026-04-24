import { processUploadedFiles, getDocumentById, getChunksByDocumentId } from '../services/ingestService.js';

export const uploadDocuments = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, error: 'No PDF files were provided' });
    }

    const results = await processUploadedFiles(req.files);

    return res.status(200).json({ success: true, results });
  } catch (error) {
    next(error);
  }
};

export const getDocument = async (req, res, next) => {
  try {
    const { documentId } = req.params;
    const document = await getDocumentById(documentId);
    if (!document) {
      return res.status(404).json({ success: false, error: 'Document not found' });
    }
    return res.status(200).json({ success: true, document });
  } catch (error) {
    next(error);
  }
};

export const getDocumentChunks = async (req, res, next) => {
  try {
    const { documentId } = req.params;
    const chunks = await getChunksByDocumentId(documentId);
    if (!chunks) {
      return res.status(404).json({ success: false, error: 'Document not found or no chunks available' });
    }
    return res.status(200).json({ success: true, chunks });
  } catch (error) {
    next(error);
  }
};
