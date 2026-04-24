import express from 'express';
import multer from 'multer';
import config from '../config/index.js';
import { uploadDocuments, getDocument, getDocumentChunks } from '../controllers/ingestionController.js';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, config.uploadDir),
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${timestamp}-${safeName}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: config.maxFileSizeBytes },
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDF documents are supported'));
    }
    cb(null, true);
  },
});

router.post('/', upload.array('documents', config.uploadMaxFiles), uploadDocuments);
router.get('/documents/:documentId', getDocument);
router.get('/documents/:documentId/chunks', getDocumentChunks);

export default router;
