import express from 'express';
import cors from 'cors';
import ingestionRoutes from './routes/ingestionRoutes.js';
import retrievalRoutes from './routes/retrievalRoutes.js';
import { errorHandler } from './utils/errorHandler.js';

const app = express();

app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/ingest', ingestionRoutes);
app.use('/api/retrieval', retrievalRoutes);
app.use(errorHandler);

export default app;
