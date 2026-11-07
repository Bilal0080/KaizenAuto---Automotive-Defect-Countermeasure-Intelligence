import React, { useState } from 'react';
import { X, QrCode, AlertTriangle, Activity, CheckCircle2, ChevronRight, ChevronLeft } from 'lucide-react';

interface OnboardingModalProps {
  onClose: () => void;
  onOpenScanner: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ onClose, onOpenScanner }) => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: 'Scan VIN or Part Barcode',
      subtitle: 'Instant Optical Traceability',
      icon: QrCode,
      color: 'text-blue-500',
      description:
        'Use the built-in optical scanner on your mobile or shop-floor tablet to read 17-character VINs or AIAG 2D barcodes on parts. This auto-populates assembly station and vehicle model data.',
      actionLabel: 'Try QR Scanner Now',
      action: () => {
        onClose();
        onOpenScanner();
      },
    },
    {
      title: 'Rapid In-Station Defect Logging',
      subtitle: 'Sub-30 Second Recording',
      icon: AlertTriangle,
      color: 'text-amber-500',
      description:
        'Select severity (Critical, Major, Minor), assign vehicle zone (CAD blueprint or drop-down), and record defect details. If severe, pull the digital Andon switch to stop the line immediately.',
    },
    {
      title: '5-Why Root Cause & Ishikawa 6M',
      subtitle: 'Toyota Production System (TPS) Kaizen',
      icon: Activity,
      color: 'text-purple-500',
      description:
        'Drill down through 5 levels of "Why" or use the AI Kaizen Advisor powered by Gemini to formulate interim containment (ICA) and permanent corrective action (PCA) within seconds.',
    },
    {
      title: 'Close Loop Countermeasures & 8D Dossier',
      subtitle: 'IATF 16949 / VDA Compliance',
      icon: CheckCircle2,
      color: 'text-emerald-500',
      description:
        'Assign owners to error-proofing Poka-Yoke countermeasures, track 100% verification across shifts, and generate printable 8D reports with a single click.',
    },
  ];

  const currentStep = steps[step];
  const Icon = currentStep.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 w-full max-w-lg p-6 shadow-2xl space-y-6 font-sans">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold">
              STEP {step + 1} OF 4
            </span>
            <span className="text-xs font-mono uppercase text-zinc-500">
              Operator Onboarding Guide
            </span>
          </div>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Body */}
        <div className="text-center space-y-4 py-4">
          <div className={`w-16 h-16 mx-auto rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center ${currentStep.color}`}>
            <Icon className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              {currentStep.title}
            </h3>
            <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400 mt-0.5">
              {currentStep.subtitle}
            </p>
          </div>

          <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed max-w-md mx-auto">
            {currentStep.description}
          </p>

          {currentStep.action && (
            <button
              onClick={currentStep.action}
              className="mt-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-xs font-semibold uppercase tracking-wider inline-flex items-center gap-1.5 transition-colors"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>{currentStep.actionLabel}</span>
            </button>
          )}
        </div>

        {/* Step Navigation Dots & Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-1.5">
            {steps.map((_, idx) => (
              <span
                key={idx}
                className={`w-2 h-2 transition-all ${
                  step === idx
                    ? 'w-6 bg-emerald-600'
                    : 'bg-zinc-300 dark:bg-zinc-700'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-3 py-1.5 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-mono flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>
            )}

            {step < steps.length - 1 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="px-4 py-1.5 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs font-mono font-semibold flex items-center gap-1"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-mono font-semibold uppercase tracking-wider"
              >
                Start Using KaizenAuto
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
