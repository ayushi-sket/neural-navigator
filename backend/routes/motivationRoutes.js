import express from 'express';
import { GoogleGenAI } from '@google/genai';

const router = express.Router();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// GET: /api/motivation/quote
router.get('/quote', async (req, res) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "Generate one unique, short motivational quote (under 12 words) focused on consistency and growth. Do not include markdown or filler conversational text.",
    });
    res.status(200).json({ quote: response.text.trim() });
  } catch (error) {
    res.status(200).json({ quote: "Great execution relies on individual small daily milestones. Keep going!" });
  }
});

export default router;
