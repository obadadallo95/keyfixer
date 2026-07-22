/**
 * @file server.ts
 * @description Full-Stack Express Server with Gemini Translation API proxy and Vite dev middleware.
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini AI client server-side
  const geminiApiKey = process.env.GEMINI_API_KEY;
  let aiClient: GoogleGenAI | null = null;

  if (geminiApiKey) {
    try {
      aiClient = new GoogleGenAI({
        apiKey: geminiApiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    } catch (e) {
      console.warn('Failed to initialize GoogleGenAI client:', e);
    }
  }

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'KeyFixer API', geminiEnabled: !!aiClient });
  });

  // Translation API endpoint using Gemini 3.6 Flash
  app.post('/api/translate', async (req, res) => {
    try {
      const { text, targetLang = 'ar' } = req.body;

      if (!text || typeof text !== 'string' || text.trim().length === 0) {
        return res.status(400).json({ error: 'Text prompt is required' });
      }

      if (!aiClient) {
        // Fallback simulation if no API key is provided
        const isArabicInput = /[\u0600-\u06FF]/.test(text);
        const fallbackText = isArabicInput
          ? `[English Translation]: ${text}`
          : `[ترجمة عربية]: ${text}`;
        return res.json({
          translatedText: fallbackText,
          sourceLang: isArabicInput ? 'ar' : 'en',
          targetLang: isArabicInput ? 'en' : 'ar',
          engine: 'dictionary-fallback',
        });
      }

      const prompt = `Translate the following text accurately into ${
        targetLang === 'ar' ? 'Arabic' : 'English'
      }. Text to translate:\n\n${text}`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          systemInstruction:
            'You are an expert bilingual Arabic-English translator. Return ONLY the translated text without commentary, quotes, or conversational responses.',
          temperature: 0.2,
        },
      });

      const translatedText = response.text ? response.text.trim() : text;

      return res.json({
        translatedText,
        sourceLang: targetLang === 'ar' ? 'en' : 'ar',
        targetLang,
        engine: 'gemini-ai',
      });
    } catch (error: any) {
      console.error('Gemini Translation Error:', error);
      res.status(500).json({
        error: 'Translation failed',
        details: error?.message || 'Server error',
      });
    }
  });

  // Vite middleware in development vs static files in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`KeyFixer server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
