import fs from 'fs/promises';
import { randomUUID } from 'crypto';
import logger from '../utils/logger.js';
import { computeFileHash } from '../utils/hash.js';
import { extractPdfText } from './pdfService.js';
import { buildChunks, estimateChunkCount } from './chunkService.js';
import { embedChunks } from './embeddingService.js';
import * as storageService from './storageService.js';
import { AppError } from '../utils/errors.js';

const removeFile = async (filePath) => {
  try {
    await fs.unlink(filePath);
    logger.debug({ filePath }, 'Removed temporary upload file');
  } catch (error) {
    logger.warn({ err: error, filePath }, 'Failed to remove uploaded file');
  }
};

const processSingleFile = async (file) => {
  const filePath = file.path;
  const filename = file.originalname;
  const contentHash = await computeFileHash(filePath);
  const existing = await storageService.findDocumentByHash(contentHash);

  if (existing) {
    return {
      filename,
      status: 'duplicate',
      message: 'Document has already been ingested',
      documentId: existing.documentId,
    };
  }

  const documentId = randomUUID();
  await storageService.createDocumentRecord({
    documentId,
    filename,
    contentHash,
    sourceType: 'pdf',
    sourcePath: filePath,
  });
  await storageService.markDocumentProcessing(documentId);

  try {
    const extractedText = await extractPdfText(filePath);
    if (!extractedText || extractedText.trim().length === 0) {
      throw new AppError('No extractable text found in PDF. The file may be a scanned document that requires OCR.', 422);
    }

    const chunks = buildChunks({ text: extractedText, documentId, sourceFilename: filename });
    const expected = estimateChunkCount(extractedText.length);
    logger.info({ documentId, filename, expectedChunkCount: expected, actualChunkCount: chunks.length }, 'Generated text chunks');

    const embeddings = await embedChunks(chunks);
    const chunkRecords = chunks.map((chunk, index) => ({
      ...chunk,
      embedding: embeddings[index],
    }));

    await storageService.persistChunks(chunkRecords);
    await storageService.markDocumentCompleted(documentId, {
      chunkCount: chunkRecords.length,
      processedAt: new Date(),
    });

    return {
      filename,
      status: 'completed',
      documentId,
      chunkCount: chunkRecords.length,
    };
  } catch (error) {
    await storageService.markDocumentFailed(documentId, error.message);
    logger.error({ err: error, filename, documentId }, 'Document ingestion failed');
    throw error; // Re-throw to be caught in processUploadedFiles
  } finally {
    await removeFile(filePath);
  }
};

export const processUploadedFiles = async (files) => {
  const promises = files.map(async (file) => {
    try {
      const startTime = Date.now();
      const result = await processSingleFile(file);
      const processingTime = Date.now() - startTime;
      logger.info({ filename: file.originalname, status: result.status, processingTime }, 'File processed');
      return result;
    } catch (error) {
      logger.error({ err: error, filename: file.originalname }, 'File processing aborted');
      return { filename: file.originalname, status: 'failed', error: error.message };
    }
  });

  const results = await Promise.allSettled(promises);
  return results.map((r) => (r.status === 'fulfilled' ? r.value : { filename: 'unknown', status: 'failed', error: r.reason.message }));
};

export const getDocumentById = async (documentId) => storageService.getDocumentById(documentId);
export const getChunksByDocumentId = async (documentId, limit = 100) => storageService.getChunksByDocumentId(documentId, limit);
