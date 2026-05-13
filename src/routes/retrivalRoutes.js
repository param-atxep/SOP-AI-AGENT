

import express from 'express';
import { search, chat } from '../controllers/retrievalController.js';

const router = express.Router();

router.post('/search', search);
router.post('/chat', chat);

export default router;
