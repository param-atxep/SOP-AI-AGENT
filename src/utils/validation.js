export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const isPdfFile = (filename, mimeType) => {
  const normalized = filename.toLowerCase();
  return normalized.endsWith('.pdf') && mimeType?.toLowerCase().includes('pdf');
};
