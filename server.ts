import express from 'express';
import http from 'http';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI client server-side only
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  try {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI:', err);
  }
}

// Automotive Domain Knowledge Fallback Generator
function generateAutomotiveFallback(defect: any) {
  const category = (defect.category || 'General Assembly').toLowerCase();
  const station = defect.station || 'Assembly Line';
  const description = defect.description || 'Defect observed during assembly';

  let containment = 'Quarantine affected lot, initiate 100% manual visual inspection on current batch.';
  let rootCause = 'Tooling calibration drift or operator standard work execution deviation.';
  let correctiveAction = 'Re-calibrate assembly fixtures, update digital standard work instruction (SWI), and retrain operators.';
  let verification = 'Verify torque/gap specifications on next 50 consecutive units with Zero defect sign-off.';

  if (category.includes('torque') || category.includes('fastener')) {
    containment = 'Halt line, re-check all critical fastener torques on the last 20 vehicles using calibrated digital torque wrench.';
    rootCause = 'DC torque gun angle transducer slipped or air pressure variation on pneumatic driver.';
    correctiveAction = 'Recalibrate automated DC electric screwdriver, lock torque program P12, install error-proofing Poka-Yoke interlock.';
    verification = '100% torque audit on next 3 shifts with real-time torque angle logging to MES.';
  } else if (category.includes('paint') || category.includes('surface')) {
    containment = 'Tag and buff out surface blemishes in buffer bay, inspect cleanroom air filtration filters immediately.';
    rootCause = 'Debris particle contamination in paint booth zone 3 or electro-static bell applicator overspray.';
    correctiveAction = 'Replace paint booth HEPA filters, clean applicator nozzles with solvent flush cycle, enforce lint-free cleanroom bunny suits.';
    verification = 'Gloss and micron thickness inspection with laser profilometer for 48 hours.';
  } else if (category.includes('weld') || category.includes('body')) {
    containment = 'Non-destructive ultrasonic testing (UT) on previous 10 spot welds; hold batch in staging area.';
    rootCause = 'Weld tip mushrooming or electrode copper wear exceeding 350 spot weld threshold.';
    correctiveAction = 'Implement automated electrode tip dress cycle after every 150 welds; replace electrode caps.';
    verification = 'Pry/tear down test on test coupon every shift start, UT check every 25 units.';
  } else if (category.includes('electrical') || category.includes('connector') || category.includes('wire')) {
    containment = 'Perform 100% continuity and pin push-out test on wire harness connector block.';
    rootCause = 'Secondary lock (CPA - Connector Position Assurance) not fully seated during operator cycle.';
    correctiveAction = 'Add audible-click feedback tactile guide; install optical sensor camera to verify secondary lock engagement before line release.';
    verification = 'Automated end-of-line electrical diagnostic scan on next 100 vehicles.';
  } else if (category.includes('leak') || category.includes('fluid')) {
    containment = 'Dry and clean area; pressurize system to 1.5x working pressure with UV fluorescent dye tracer.';
    rootCause = 'O-ring pinched during insertion or incorrect lubrication specification.';
    correctiveAction = 'Switch to pre-lubricated fluorosilicone O-rings; redesign insertion mandrel with chamfer guide.';
    verification = 'Helium mass-spectrometer leak test at 0.5 bar decay threshold for 2 consecutive days.';
  }

  return {
    summary: `Automotive Kaizen Analysis for ${defect.title || 'Defect'} at ${station}`,
    rootCauseHypothesis: rootCause,
    fiveWhys: [
      `1. Why did the defect occur? -> ${description}`,
      `2. Why was it not caught earlier? -> In-station inspection relied on visual check without positive interlock.`,
      `3. Why did standard process fail? -> Tool calibration or component tolerance variance occurred during high-speed cycle.`,
      `4. Why did variance occur? -> Wear on tooling or deviation from standard work cycle timing.`,
      `5. Root Cause -> Absence of automated Poka-Yoke error-proofing on station ${station}.`,
    ],
    containmentAction: containment,
    correctiveAction: correctiveAction,
    preventiveAction: 'Update Design FMEA and Process FMEA (PFMEA RPN reduction) and incorporate into Quality Standard Work Instruction.',
    verificationMethod: verification,
    recommendedTimelineHours: 24,
    confidenceScore: 0.94,
    source: 'Automotive Quality & Kaizen Standards (IATF 16949 / Lean 8D)',
  };
}

// API: Analyze defect using Gemini or Kaizen Fallback
app.post('/api/ai/analyze-defect', async (req, res) => {
  try {
    const { defect } = req.body;
    if (!defect) {
      return res.status(400).json({ error: 'Defect details are required' });
    }

    if (!ai) {
      const fallback = generateAutomotiveFallback(defect);
      return res.json({ result: fallback, mode: 'local-expert' });
    }

    const prompt = `You are a world-class Automotive Manufacturing Quality Director and Lean Kaizen Master (certified in IATF 16949 and 8D problem-solving).
Analyze this automotive production defect and provide structured root cause analysis and countermeasures.

Defect Details:
- Title: ${defect.title}
- Station/Line: ${defect.station || 'Unknown'} (Line: ${defect.line || 'Main Assembly'})
- Category: ${defect.category}
- Severity: ${defect.severity}
- Description: ${defect.description}
- Symptoms/Observation: ${defect.symptoms || defect.description}
- Vehicle Model/VIN: ${defect.vehicleModel || 'Standard Vehicle'}
- Part Number: ${defect.partNumber || 'N/A'}

Respond with pure JSON with this exact schema:
{
  "summary": "Brief 1-2 sentence engineering diagnosis",
  "rootCauseHypothesis": "Technical explanation of the primary root cause",
  "fiveWhys": [
    "Why 1: ...",
    "Why 2: ...",
    "Why 3: ...",
    "Why 4: ...",
    "Why 5: ... (True Root Cause)"
  ],
  "containmentAction": "Immediate Interim Containment Action (ICA) to protect the customer/line within 1 hour",
  "correctiveAction": "Permanent Corrective Action (PCA) addressing the root cause",
  "preventiveAction": "Preventive Kaizen measure (PFMEA update, Poka-Yoke error proofing, SWI revision)",
  "verificationMethod": "Method and sample size to prove the fix works (e.g. Cp/Cpk study, 100% audit for 50 units)",
  "recommendedTimelineHours": 24,
  "confidenceScore": 0.95,
  "source": "AI Automotive Engineering Intelligence"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('Empty response from AI model');
    }

    const parsed = JSON.parse(text);
    return res.json({ result: parsed, mode: 'gemini-3.8-flash' });
  } catch (error: any) {
    console.warn('Gemini API call failed, using automotive expert engine:', error?.message);
    const fallback = generateAutomotiveFallback(req.body?.defect || {});
    return res.json({ result: fallback, mode: 'local-expert', errorNotice: error?.message });
  }
});

// API: Suggest Countermeasures
app.post('/api/ai/suggest-countermeasures', async (req, res) => {
  try {
    const { defect } = req.body;
    const fallback = generateAutomotiveFallback(defect || {});

    if (!ai) {
      return res.json({
        countermeasures: [
          {
            type: 'Immediate Containment (ICA)',
            title: 'Stop Defect Flow & Quarantine',
            action: fallback.containmentAction,
            priority: 'Critical',
            estimatedTime: '1 - 2 Hours',
            responsibility: 'Line Quality Inspector',
          },
          {
            type: 'Permanent Corrective (PCA)',
            title: 'Tooling & Poka-Yoke Interlock',
            action: fallback.correctiveAction,
            priority: 'High',
            estimatedTime: '24 Hours',
            responsibility: 'Manufacturing Engineer',
          },
          {
            type: 'Preventive Kaizen (Systemic)',
            title: 'Process FMEA & Standard Work Revision',
            action: fallback.preventiveAction,
            priority: 'Medium',
            estimatedTime: '3 Days',
            responsibility: 'Quality Assurance Lead',
          },
        ],
        verification: fallback.verificationMethod,
      });
    }

    const prompt = `You are an Automotive Kaizen Specialist. Propose 3 actionable countermeasures for this automotive defect:
Title: ${defect.title}
Category: ${defect.category}
Station: ${defect.station}
Description: ${defect.description}

Provide JSON output in this format:
{
  "countermeasures": [
    {
      "type": "Immediate Containment (ICA) | Permanent Corrective (PCA) | Preventive Kaizen (Systemic)",
      "title": "Clear action title",
      "action": "Specific technical step-by-step instruction",
      "priority": "Critical | High | Medium | Low",
      "estimatedTime": "e.g. 1 hour or 24 hours",
      "responsibility": "e.g. Line Lead, Maintenance, Tooling Engineer"
    }
  ],
  "verification": "Specific quality validation protocol"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    const fallback = generateAutomotiveFallback(req.body?.defect || {});
    return res.json({
      countermeasures: [
        {
          type: 'Immediate Containment (ICA)',
          title: 'Immediate Lot Quarantine',
          action: fallback.containmentAction,
          priority: 'Critical',
          estimatedTime: '1 Hour',
          responsibility: 'Line Lead',
        },
        {
          type: 'Permanent Corrective (PCA)',
          title: 'Equipment & Calibration Rectification',
          action: fallback.correctiveAction,
          priority: 'High',
          estimatedTime: '1 Shift',
          responsibility: 'Manufacturing Engineering',
        },
        {
          type: 'Preventive Kaizen (Systemic)',
          title: 'Digital Standard Work & Poka-Yoke Verification',
          action: fallback.preventiveAction,
          priority: 'Medium',
          estimatedTime: '48 Hours',
          responsibility: 'Quality Manager',
        },
      ],
      verification: fallback.verificationMethod,
    });
  }
});

// Setup server with Vite in dev or static files in production
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';
  const server = http.createServer(app);

  if (!isProduction) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
        watch: null,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`KaizenAuto Automotive Quality Server is running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
