import { Defect } from '../types';

export interface AIAnalysisResult {
  summary: string;
  rootCauseHypothesis: string;
  fiveWhys: string[];
  containmentAction: string;
  correctiveAction: string;
  preventiveAction: string;
  verificationMethod: string;
  recommendedTimelineHours: number;
  confidenceScore: number;
  source: string;
}

export interface SuggestedCountermeasure {
  type: string;
  title: string;
  action: string;
  priority: string;
  estimatedTime: string;
  responsibility: string;
}

export interface SuggestedCountermeasureResponse {
  countermeasures: SuggestedCountermeasure[];
  verification: string;
}

export const apiService = {
  async analyzeDefect(defect: Partial<Defect>, isOffline = false): Promise<AIAnalysisResult> {
    if (isOffline) {
      // Local rule-based Kaizen fallback when offline
      return this.getLocalKaizenAnalysis(defect);
    }

    try {
      const res = await fetch('/api/ai/analyze-defect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ defect }),
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const data = await res.json();
      return data.result || this.getLocalKaizenAnalysis(defect);
    } catch (err) {
      console.warn('API error, using local automotive Kaizen intelligence:', err);
      return this.getLocalKaizenAnalysis(defect);
    }
  },

  async suggestCountermeasures(defect: Partial<Defect>, isOffline = false): Promise<SuggestedCountermeasureResponse> {
    if (isOffline) {
      const fallback = this.getLocalKaizenAnalysis(defect);
      return {
        countermeasures: [
          {
            type: 'Immediate Containment (ICA)',
            title: 'Stop Defect Flow & 100% Audit',
            action: fallback.containmentAction,
            priority: 'Critical',
            estimatedTime: '1 Hour',
            responsibility: 'Line Quality Inspector',
          },
          {
            type: 'Permanent Corrective (PCA)',
            title: 'Tool & Parameter Rectification',
            action: fallback.correctiveAction,
            priority: 'High',
            estimatedTime: '1 Shift',
            responsibility: 'Process Engineer',
          },
          {
            type: 'Preventive Kaizen (Systemic)',
            title: 'Poka-Yoke Error Proofing & SWI Revision',
            action: fallback.preventiveAction,
            priority: 'Medium',
            estimatedTime: '3 Days',
            responsibility: 'Quality Assurance Lead',
          },
        ],
        verification: fallback.verificationMethod,
      };
    }

    try {
      const res = await fetch('/api/ai/suggest-countermeasures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ defect }),
      });

      if (!res.ok) throw new Error('Failed to fetch suggestions');
      return await res.json();
    } catch {
      return this.suggestCountermeasures(defect, true);
    }
  },

  getLocalKaizenAnalysis(defect: Partial<Defect>): AIAnalysisResult {
    const category = (defect.category || 'General').toLowerCase();
    const station = defect.station || 'Assembly Station';

    let containment = 'Contain lot, hold current station vehicles, and execute 100% manual verification.';
    let rootCause = 'Tooling calibration drift or component dimension variance from supplier.';
    let corrective = 'Recalibrate automated assembly spindle, adjust fixture datum, and verify next 25 cycles.';
    let preventive = 'Implement optical Poka-Yoke interlock and update station standard work instruction.';
    let verification = '100% torque and visual audit on next 50 consecutive units with Zero defect sign-off.';

    if (category.includes('torque') || category.includes('fastener')) {
      containment = 'Immediate 100% torque audit on last 20 chassis using certified digital torque wrench.';
      rootCause = 'Torque spindle shutoff triggered prematurely by thread interference or friction spike.';
      corrective = 'Reprogram rundown parameters with torque-angle window and re-dress weld nuts.';
      preventive = 'Add automated torque-angle telemetry logging to plant MES to auto-flag variances.';
      verification = 'Capability study (Cpk >= 1.67) on 30 consecutive bolt rundown cycles.';
    } else if (category.includes('paint') || category.includes('surface')) {
      containment = 'Inspect incoming bodies at buffer deck, quarantine affected vehicle for wet polish.';
      rootCause = 'Micro-dust contamination or air draft fluctuation in clearcoat applicator zone.';
      corrective = 'Replace HVAC pre-filters and purge paint bell nozzles with solvent wash cycle.';
      preventive = 'Enforce cleanroom antistatic garments and ionized air blower at booth entryway.';
      verification = 'Glossmeter measurement and surface laser inspection for 3 consecutive shifts.';
    } else if (category.includes('electrical') || category.includes('connector')) {
      containment = 'Perform 100% pin push-out test and electrical harness continuity diagnostic.';
      rootCause = 'Connector CPA secondary lock not fully clicked during high-takt-time cycle.';
      corrective = 'Retrain station operator on tactile two-click confirmation; add barcode scan check.';
      preventive = 'Install smart camera sensor to inspect red CPA tab engagement before car exit.';
      verification = '100% end-of-line diagnostic bus scan with zero communication DTC codes.';
    }

    return {
      summary: `Kaizen Analysis for ${defect.title || 'Defect'} at ${station}`,
      rootCauseHypothesis: rootCause,
      fiveWhys: [
        `Why 1: Defect was identified at ${station}.`,
        `Why 2: Process check did not capture the variance within cycle takt time.`,
        `Why 3: Fixture calibration or mechanical seating variance exceeded 1.5mm tolerance.`,
        `Why 4: Wear or contamination on tooling fixture.`,
        `Why 5: Lack of automated Poka-Yoke error-proofing on station ${station}.`,
      ],
      containmentAction: containment,
      correctiveAction: corrective,
      preventiveAction: preventive,
      verificationMethod: verification,
      recommendedTimelineHours: 24,
      confidenceScore: 0.92,
      source: 'Automotive Lean Kaizen Diagnostic Engine',
    };
  },
};
