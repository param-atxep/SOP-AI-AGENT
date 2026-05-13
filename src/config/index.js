import dotenv from 'dotenv';

dotenv.config();

const getRequiredEnv = (key) => {
  const value = process.env[key];
  if (!value || value.trim() === '') {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

const config = {
  port: Number(process.env.PORT) || 4000,
  mongoUri: getRequiredEnv('MONGO_URI'),
  mongoDbName: process.env.MONGO_DB_NAME || 'opsmind',
  openAiApiKey: getRequiredEnv('OPENAI_API_KEY'),
  openAiApiBase: process.env.OPENAI_API_BASE || 'https://api.openai.com/v1',
  embeddingModel: process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-large',
  maxFileSizeBytes: Number(process.env.MAX_FILE_SIZE_BYTES) || 50 * 1024 * 1024,
  uploadMaxFiles: Number(process.env.UPLOAD_MAX_FILES) || 5,
  uploadDir: process.env.UPLOAD_DIR || 'storage/uploads',
  embeddingBatchSize: Number(process.env.EMBEDDING_BATCH_SIZE) || 16,
  chatModel: process.env.OPENAI_CHAT_MODEL || 'gpt-4o-mini',
  logLevel: process.env.LOG_LEVEL || 'info',
};

export default config;
