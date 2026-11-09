import { useEffect, useState } from 'react';
import { Crosshair, Square, Layers, FileSearch, Check } from 'lucide-react';
import type { UploadedCardData } from './UploadPage';
import { generateDemoGrade } from '@/lib/gradingEngine';
import type { GradeResult } from '@/types';

interface AnalyzingPageProps {
  cardData: UploadedCardData;
  onComplete: (result: GradeResult) => void;
}

const STAGES = [
  { icon: Crosshair, label: 'Measuring centering', desc: 'Calculating border ratios with OpenCV edge detection' },
  { icon: Square, label: 'Inspecting corners', desc: 'Detecting rounding, fraying, and whitening on all four corners' },
  { icon: Layers, label: 'Evaluating edges', desc: 'Scanning edge wear, nicking, and silvering' },
  { icon: FileSearch, label: 'Assessing surface', desc: 'Identifying scratches, print defects, and gloss issues' },
];

export default function AnalyzingPage({ cardData, onComplete }: AnalyzingPageProps) {
  const [currentStage, setCurrentStage] = useState(0);

  useEffect(() => {
    if (currentStage >= STAGES.length) {
      const result = generateDemoGrade(cardData.cardName, cardData.frontImageUrl);
      const timer = setTimeout(() => onComplete(result), 600);
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(() => setCurrentStage((s) => s + 1), 1100);
    return () => clearTimeout(timer);
  }, [currentStage, cardData, onComplete]);

  return (
    <div className="min-h-screen pt-24 pb-16 flex items-center justify-center px-6">
      <div className="w-full max-w-2xl animate-fade-in">
        <div className="text-center mb-10">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-gold-400/20 blur-2xl animate-pulse" />
            <div className="relative w-20 h-20 rounded-2xl border border-gold-400/40 bg-ink-900 flex items-center justify-center">
              {cardData.frontImageUrl && (
                <img
                  src={cardData.frontImageUrl}
                  alt={cardData.cardName}
                  className="w-full h-full object-cover rounded-2xl"
                />
              )}
            </div>
          </div>
          <h1 className="text-3xl font-display font-semibold text-white mb-2">
            Analyzing your card
          </h1>
          <p className="text-sm text-ink-400">
            {cardData.cardName} — running four-point AI evaluation
          </p>
        </div>

        {/* Demo badge */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <span className="px-3 py-1 rounded-full text-[10px] uppercase tracking-[0.15em] border border-gold-400/30 bg-gold-400/5 text-gold-300">
            Demo Mode — Simulated Analysis
          </span>
        </div>

        <div className="card-surface-elevated p-8">
          <div className="flex flex-col gap-4">
            {STAGES.map((stage, i) => {
              const Icon = stage.icon;
              const isDone = i < currentStage;
              const isActive = i === currentStage;
              const isPending = i > currentStage;

              return (
                <div
                  key={stage.label}
                  className={`flex items-center gap-4 p-4 rounded-lg transition-all duration-300 ${
                    isActive
                      ? 'bg-gold-400/5 border border-gold-400/20'
                      : isDone
                      ? 'opacity-50'
                      : 'opacity-30'
                  }`}
                >
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center border transition-all duration-300 ${
                      isDone
                        ? 'border-gold-400/40 bg-gold-400/10'
                        : isActive
                        ? 'border-gold-400/40 bg-gold-400/10'
                        : 'border-ink-600 bg-ink-800'
                    }`}
                  >
                    {isDone ? (
                      <Check size={18} className="text-gold-400" />
                    ) : (
                      <Icon
                        size={18}
                        className={isActive ? 'text-gold-400' : 'text-ink-400'}
                        strokeWidth={1.5}
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${isActive || isDone ? 'text-white' : 'text-ink-400'}`}>
                      {stage.label}
                    </p>
                    <p className="text-xs text-ink-500 mt-0.5">{stage.desc}</p>
                  </div>
                  {isActive && (
                    <div className="flex-shrink-0 w-5 h-5 border-2 border-gold-400/30 border-t-gold-400 rounded-full animate-spin" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <p className="text-center text-xs text-ink-500 mt-6">
          This typically takes a few seconds. Please don't close this page.
        </p>
      </div>
    </div>
  );
}
