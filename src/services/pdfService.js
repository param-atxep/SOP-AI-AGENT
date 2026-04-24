import fs from 'fs/promises';
import pdfParse from 'pdf-parse';
import logger from '../utils/logger.js';

const normalizeText = (rawText) => {
  const lines = rawText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const normalized = lines.join('\n');
  return normalized.replace(/[ \t]{2,}/g, ' ').replace(/\n{2,}/g, '\n\n').trim();
};

export const extractPdfText = async (filePath) => {
  const fileBuffer = await fs.readFile(filePath);
  const data = await pdfParse(fileBuffer);

  if (!data || typeof data.text !== 'string') {
    logger.warn({ filePath }, 'PDF parser returned no text content');
    return '';
  }

  const text = normalizeText(data.text);
  if (text.length === 0) {
    logger.warn({ filePath }, 'PDF contains no extractable text; scanned PDF may require OCR');
  }

  return text;
};
