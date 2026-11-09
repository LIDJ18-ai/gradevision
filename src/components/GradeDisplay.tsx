import { gradeLabelFromScore } from '@/lib/gradingEngine';

interface GradeDisplayProps {
  score: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  label?: boolean;
}

const sizes = {
  sm: { box: 'w-12 h-12', text: 'text-base', label: 'text-[8px]' },
  md: { box: 'w-16 h-16', text: 'text-xl', label: 'text-[9px]' },
  lg: { box: 'w-24 h-24', text: 'text-3xl', label: 'text-[10px]' },
  xl: { box: 'w-32 h-32', text: 'text-4xl', label: 'text-xs' },
};

function gradeColor(score: number): string {
  if (score >= 9) return 'from-gold-300 to-gold-500 text-ink-950 border-gold-400';
  if (score >= 8) return 'from-gold-400/80 to-gold-600/80 text-ink-950 border-gold-500/60';
  if (score >= 7) return 'from-ink-600 to-ink-700 text-gold-300 border-gold-400/30';
  if (score >= 5) return 'from-ink-700 to-ink-800 text-ink-200 border-ink-500';
  return 'from-ink-800 to-ink-900 text-ink-400 border-ink-600';
}

export default function GradeDisplay({ score, size = 'md', label = false }: GradeDisplayProps) {
  const s = sizes[size];
  const colors = gradeColor(score);

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className={`${s.box} rounded-xl border bg-gradient-to-br ${colors} flex items-center justify-center font-display font-bold shadow-lg`}
      >
        <span className={s.text}>{score.toFixed(1)}</span>
      </div>
      {label && (
        <span className={`${s.label} uppercase tracking-[0.15em] text-ink-400 font-medium`}>
          {gradeLabelFromScore(score)}
        </span>
      )}
    </div>
  );
}
