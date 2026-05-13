import { getDb } from '../db/mongoClient.js';
import { createDocumentPayload, DOCUMENT_STATUS } from '../models/documentModel.js';

const DOCUMENT_COLLECTION = 'documents';
const CHUNK_COLLECTION = 'chunks';

export const findDocumentByHash = async (contentHash) => {
  const db = getDb();
  return db.collection(DOCUMENT_COLLECTION).findOne({ contentHash });
};

export const createDocumentRecord = async ({ documentId, filename, contentHash, sourceType, sourcePath }) => {
  const db = getDb();
  const payload = createDocumentPayload({ documentId, filename, contentHash, sourceType, sourcePath });
  await db.collection(DOCUMENT_COLLECTION).insertOne(payload);
  return payload;
};

export const markDocumentProcessing = async (documentId) => {
  const db = getDb();
  return db.collection(DOCUMENT_COLLECTION).updateOne(
    { documentId },
    { $set: { status: DOCUMENT_STATUS.PROCESSING, updatedAt: new Date() } }
  );
};

export const markDocumentCompleted = async (documentId, updates = {}) => {
  const db = getDb();
  return db.collection(DOCUMENT_COLLECTION).updateOne(
    { documentId },
    {
      $set: {
        status: DOCUMENT_STATUS.COMPLETED,
        chunkCount: updates.chunkCount || 0,
        processedAt: updates.processedAt || new Date(),
        updatedAt: new Date(),
      },
    }
  );
};

export const markDocumentFailed = async (documentId, message) => {
  const db = getDb();
  return db.collection(DOCUMENT_COLLECTION).updateOne(
    { documentId },
    {
      $set: {
        status: DOCUMENT_STATUS.FAILED,
        errorMessage: message,
        updatedAt: new Date(),
      },
    }
  );
};

export const persistChunks = async (chunkRecords) => {
  if (!chunkRecords || chunkRecords.length === 0) {
    return [];
  }

  const db = getDb();
  const collection = db.collection(CHUNK_COLLECTION);
  const result = await collection.insertMany(chunkRecords, { ordered: false });
  
  if (result.insertedCount !== chunkRecords.length) {
    throw new Error(`Failed to insert all chunks: ${result.insertedCount}/${chunkRecords.length} inserted`);
  }
  
  return chunkRecords;
};

export const getDocumentById = async (documentId) => {
  const db = getDb();
  return db.collection(DOCUMENT_COLLECTION).findOne({ documentId });
};

export const getChunksByDocumentId = async (documentId, limit = 100) => {
  const db = getDb();
  return db
    .collection(CHUNK_COLLECTION)
    .find({ documentId })
    .sort({ chunkIndex: 1 })
    .limit(limit)
    .toArray();
};

export const performVectorSearch = async (queryVector, { limit = 5, minScore = 0 } = {}) => {
  const db = getDb();
  const collection = db.collection(CHUNK_COLLECTION);

  const pipeline = [
    {
      $vectorSearch: {
        index: 'default', // Name of the vector search index
        path: 'embedding',
        queryVector,
        numCandidates: 100, // Higher value increases accuracy but decreases speed
        limit,
      },
    },
    {
      $project: {
        _id: 0,
        documentId: 1,
        text: 1,
        chunkIndex: 1,
        score: { $meta: 'vectorSearchScore' },
      },
    },
  ];

  if (minScore > 0) {
    pipeline.push({
      $match: {
        score: { $gte: minScore },
      },
    });
  }

  return collection.aggregate(pipeline).toArray();
};
