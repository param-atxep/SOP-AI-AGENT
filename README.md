# 🚀 OpsMind AI — SOP AI Agent (Production-Grade)

## 🧠 Overview

OpsMind AI is an enterprise-level **AI-powered SOP assistant** that allows users to upload PDFs and query them using a chatbot. The system uses **vector search + LLM grounding** to provide accurate, source-based answers with **zero hallucination design**.

---

# 🏗️ Architecture

```
Client (Next.js)
   ↓
API Layer (Node.js + Express)
   ↓
Services:
  - Ingestion Service
  - Embedding Service
  - Retrieval Service
  - Chat Service
   ↓
MongoDB Atlas (Vector DB)
   ↓
LLM (Gemini / OpenAI)
```

---

# ⚙️ Tech Stack

### Frontend

* Next.js (TypeScript)
* Tailwind CSS

### Backend

* Node.js + Express (TypeScript)
* Multer (file upload)
* pdf-parse (PDF parsing)

### Database

* MongoDB Atlas (Vector Search)

### AI Layer

* Gemini API (Embedding + LLM)

### Optional (High-End)

* Redis (Caching)
* BullMQ (Background Jobs)
* Docker (Deployment)

---

# 🔁 Core Flow

```
PDF Upload → Text Extraction → Chunking → Embedding → Store
                                              ↓
User Query → Query Embedding → Vector Search → Context
                                              ↓
LLM → Answer → Source Citation
```

---

# 📅 7-Day Execution Plan (Production-Focused)

---

## 🔥 Day 1 — Foundation Setup

### Backend Setup

```bash
mkdir backend && cd backend
npm init -y
npm install express mongoose cors dotenv multer
npm install typescript ts-node-dev @types/node @types/express
```

### Folder Structure

```
src/
 ├── controllers/
 ├── services/
 ├── models/
 ├── routes/
 ├── utils/
 └── index.ts
```

### MongoDB Connection

```ts
mongoose.connect(process.env.MONGO_URI);
```

### Frontend Setup

```bash
npx create-next-app frontend
```

---

## 🔥 Day 2 — File Upload + PDF Parsing

### Install

```bash
npm install pdf-parse
```

### Upload API

```ts
import multer from "multer";
const upload = multer({ dest: "uploads/" });

app.post("/upload", upload.single("file"), async (req, res) => {
  res.send("File uploaded");
});
```

### Extract Text

```ts
import pdfParse from "pdf-parse";
import fs from "fs";

const data = await pdfParse(fs.readFileSync(filePath));
const text = data.text;
```

---

## 🔥 Day 3 — Chunking + Storage

### Chunk Function

```ts
function chunkText(text: string) {
  const chunks = [];
  const size = 1000;
  const overlap = 100;

  for (let i = 0; i < text.length; i += size - overlap) {
    chunks.push(text.slice(i, i + size));
  }
  return chunks;
}
```

### MongoDB Schema

```ts
{
  documentId: String,
  text: String,
  embedding: [Number],
  metadata: {
    page: Number
  }
}
```

---

## 🔥 Day 4 — Embeddings + Vector Index

### Install Gemini

```bash
npm install @google/generative-ai
```

### Generate Embeddings

```ts
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "embedding-001" });

const result = await model.embedContent(chunk);
const vector = result.embedding.values;
```

### MongoDB Vector Search Index

```json
{
  "fields": [
    {
      "type": "vector",
      "path": "embedding",
      "numDimensions": 768,
      "similarity": "cosine"
    }
  ]
}
```

---

## 🔥 Day 5 — Retrieval Engine

### Vector Search Query

```ts
const results = await collection.aggregate([
  {
    $vectorSearch: {
      queryVector: queryEmbedding,
      path: "embedding",
      numCandidates: 100,
      limit: 5
    }
  }
]).toArray();
```

### Context Builder

```ts
const context = results.map(r => r.text).join("\n");
```

---

## 🔥 Day 6 — AI Chat Agent

### Prompt Design

```ts
const prompt = `
You are an SOP assistant.
Only answer from the provided context.
If the answer is not present, say "I don't know".

Context:
${context}

Question:
${query}
`;
```

### Generate Response

```ts
const result = await model.generateContent(prompt);
const answer = result.response.text();
```

---

## 🔥 Day 7 — UI + Production Hardening

### Features

* Chat UI (like ChatGPT)
* File Upload UI
* Source Citations
* Chat History

### Additions

* Rate Limiting
* Input Validation
* Error Handling
* Logging

---

# 🔐 Production Enhancements

### Security

* JWT Authentication
* Request validation (Zod)

### Performance

* Redis caching
* Batch embeddings

### Scalability

* Background jobs (BullMQ)
* Microservice separation

### Observability

* Logging (Pino)
* Error tracking

---

# 📦 Deployment

### Backend

```bash
docker build -t opsmind-backend .
docker run -p 5000:5000 opsmind-backend
```

### Frontend

* Deploy on Vercel

### Database

* MongoDB Atlas

---

# 🧪 Testing Checklist

* Upload large PDF ✔
* Ask specific question ✔
* No-answer scenario ✔
* Multiple users ✔
* API failure handling ✔

---

# 💥 Final Features

✔ PDF-based AI chatbot
✔ Accurate answers (context grounded)
✔ Source citation
✔ No hallucination system
✔ Scalable architecture

---

# 🚀 Future Upgrades

* Re-ranking (better accuracy)
* Multi-document querying
* Role-based access
* Analytics dashboard
* Fine-tuned models

---

# ⚠️ Important Notes

* Always use chunking (never full PDF)
* Always enforce “I don’t know”
* Never call LLM without context
* Optimize token usage

---

# 🏁 Conclusion

This is a **real-world, production-ready AI system architecture** used in modern SaaS AI tools. Built correctly, this project is:

* Freelance-ready
* Startup-ready
* Resume standout

---

**Build hard. Ship fast. Scale smart. 🚀**
* Contributors
* 1. Param Shelke
  2. Snehal Satre 
