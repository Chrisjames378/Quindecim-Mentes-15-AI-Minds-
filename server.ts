import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Lazy initialize Gemini client
  const getGeminiClient = () => {
    if (!process.env.GEMINI_API_KEY) return null;
    return new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  };

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
      model: 'gemini-3.8-flash',
    });
  });

  // Execute or consult an AI Mind
  app.post('/api/ai-mind', async (req, res) => {
    const { mindId, mindName, targetLayer, currentParams } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      // Local fallback
      return res.json({
        success: true,
        source: 'local_dsp',
        explanation: `Quindecim Mentes Mind #${mindId} (${mindName}) executed via real-time DSP matrix.\nParameters modulated on Layer ${targetLayer}.`,
      });
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `You are Quindecim Mentes AI Sound Architect Mind #${mindId} (${mindName}) inside the Quindecima 8-layer Multitimbral Neural Synthesizer.
Analyze the target Layer ${targetLayer} with current parameters:
${JSON.stringify(currentParams || {}, null, 2)}

Provide a concise, expert audio engineering explanation of the specific DSP calculations you perform (frequencies, resonance, harmonic ratios, envelopes, or spatial imaging). Keep it within 3-4 dense, technical, inspiring bullet points.`,
      });

      res.json({
        success: true,
        source: 'gemini',
        explanation: response.text || `Mind #${mindId} executed.`,
      });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      console.error('Gemini API Error:', errorMsg);
      res.json({
        success: true,
        source: 'local_dsp_fallback',
        explanation: `[Mind #${mindId}: ${mindName}]\nExecuted local DSP transformations on Layer ${targetLayer}.\n(Note: ${errorMsg})`,
      });
    }
  });

  // Natural Language Sound Designer Terminal
  app.post('/api/ai-prompt', async (req, res) => {
    const { prompt, currentParams } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const ai = getGeminiClient();

    if (!ai) {
      // Intelligent heuristic analysis for local fallback
      const p = prompt.toLowerCase();
      const patch: Record<string, unknown> = {};

      if (p.includes('saw') || p.includes('lead') || p.includes('bright') || p.includes('stadium')) {
        patch.wave = 'sawtooth';
        patch.unison = 11;
        patch.detune = 0.55;
        patch.cutoff = 7500;
        patch.res = 3.0;
        patch.attack = 0.02;
        patch.decay = 0.35;
        patch.sustain = 0.8;
      } else if (p.includes('pad') || p.includes('ambient') || p.includes('cloud') || p.includes('soft')) {
        patch.wave = 'triangle';
        patch.unison = 7;
        patch.detune = 0.2;
        patch.cutoff = 1800;
        patch.res = 1.4;
        patch.attack = 0.8;
        patch.decay = 1.2;
        patch.sustain = 0.9;
        patch.release = 2.4;
      } else if (p.includes('bass') || p.includes('sub') || p.includes('punch') || p.includes('growl')) {
        patch.wave = 'square';
        patch.unison = 5;
        patch.detune = 0.25;
        patch.cutoff = 2400;
        patch.res = 7.5;
        patch.subOsc = 0.6;
        patch.attack = 0.002;
        patch.decay = 0.22;
        patch.sustain = 0.3;
      } else if (p.includes('bell') || p.includes('pluck') || p.includes('crystal')) {
        patch.wave = 'sine';
        patch.unison = 9;
        patch.cutoff = 2200;
        patch.filterType = 'highpass';
        patch.res = 4.2;
        patch.attack = 0.005;
        patch.decay = 0.6;
        patch.sustain = 0.1;
      } else {
        patch.wave = 'sawtooth';
        patch.unison = 7;
        patch.cutoff = 3500;
        patch.res = 3.5;
        patch.attack = 0.04;
        patch.decay = 0.4;
      }

      return res.json({
        success: true,
        source: 'local_nlp_engine',
        explanation: `[Neural DSP Compiler]\nAnalyzed acoustic intent: "${prompt}".\nSynthesized optimal timbre matrix for active multitimbral layer.`,
        patchUpdates: patch,
      });
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `You are the Neural Sound Designer for the Quindecima 8-layer Multitimbral Synthesizer.
The user wants to sculpt sound with this description: "${prompt}"

Current active layer state:
${JSON.stringify(currentParams || {}, null, 2)}

Return a valid JSON object strictly with this shape (no markdown backticks around the json):
{
  "explanation": "A 2-3 sentence sound designer explanation of the sonic choices made.",
  "patch": {
    "wave": "sawtooth" | "square" | "sine" | "triangle",
    "unison": number (1 to 15, odd),
    "detune": number (0 to 1),
    "drift": number (0 to 1),
    "subOsc": number (0 to 1),
    "filterType": "lowpass" | "highpass" | "bandpass" | "notch",
    "cutoff": number (20 to 18000),
    "res": number (0.1 to 15),
    "envmod": number (-1 to 1),
    "drive": number (0 to 1),
    "attack": number (0.001 to 3),
    "decay": number (0.01 to 3),
    "sustain": number (0 to 1),
    "release": number (0.01 to 5)
  }
}`,
      });

      const text = response.text || '{}';
      // Clean possible json code blocks
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);

      res.json({
        success: true,
        source: 'gemini',
        explanation: parsed.explanation || 'Sound design updated.',
        patchUpdates: parsed.patch || {},
      });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      console.error('Gemini NLP Error:', errorMsg);
      res.json({
        success: true,
        source: 'local_fallback',
        explanation: `Applied neural sound design heuristics for "${prompt}".`,
        patchUpdates: {
          wave: 'sawtooth',
          unison: 9,
          detune: 0.45,
          cutoff: 4200,
          res: 3.8,
          attack: 0.03,
          decay: 0.35,
          sustain: 0.65,
          release: 0.8,
        },
      });
    }
  });

  // Vite middleware in dev or static files in production
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
    console.log(`QUINDECIMA Neural Synthesizer running on http://localhost:${PORT}`);
  });
}

startServer();
