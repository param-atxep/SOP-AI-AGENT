import { MongoClient } from 'mongodb';
import config from '../config/index.js';
import logger from '../utils/logger.js';

let client;
let db;

export const connectDb = async () => {
  if (client && db) {
    return db;
  }

  client = new MongoClient(config.mongoUri, {
    serverApi: { version: '1' },
    maxPoolSize: 20,
  });

  await client.connect();
  db = client.db(config.mongoDbName);

  logger.info({ uri: config.mongoUri, db: config.mongoDbName }, 'Connected to MongoDB Atlas');

  return db;
};

export const getDb = () => {
  if (!db) {
    throw new Error('MongoDB client is not initialized');
  }

  return db;
};

export const ensureIndexes = async () => {
  const database = getDb();
  const documents = database.collection('documents');
  const chunks = database.collection('chunks');

  await Promise.all([
    documents.createIndex({ contentHash: 1 }, { unique: true, background: true }),
    documents.createIndex({ status: 1 }, { background: true }),
    documents.createIndex({ documentId: 1 }, { unique: true, background: true }),
    chunks.createIndex({ documentId: 1 }, { background: true }),
    chunks.createIndex({ sourceFilename: 1 }, { background: true }),
    chunks.createIndex({ chunkIndex: 1 }, { background: true }),
  ]);

  logger.info('MongoDB indexes ensured');
};
