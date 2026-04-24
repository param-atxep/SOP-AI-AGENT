import fs from 'fs/promises';
import app from './app.js';
import config from './config/index.js';
import { connectDb, ensureIndexes } from './db/mongoClient.js';
import logger from './utils/logger.js';

const startServer = async () => {
  try {
    await fs.mkdir(config.uploadDir, { recursive: true });
    await connectDb();
    await ensureIndexes();

    app.listen(config.port, () => {
      logger.info({ port: config.port }, 'OpsMind AI ingestion service started');
    });
  } catch (error) {
    logger.error({ err: error }, 'Failed to start ingestion service');
    process.exit(1);
  }
};

startServer();

