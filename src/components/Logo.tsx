import { ScanLine } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

const sizeMap = {
  sm: { icon: 18, text: 'text-lg' },
  md: { icon: 22, text: 'text-xl' },
  lg: { icon: 28, text: 'text-2xl' },
};

export default function Logo({ size = 'md', onClick }: LogoProps) {
  const s = sizeMap[size];
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2.5 group"
      aria-label="GradeVision home"
    >
      <div className="relative">
        <div className="absolute inset-0 bg-gold-400/20 blur-lg group-hover:bg-gold-400/30 transition-all duration-300" />
        <div className="relative flex items-center justify-center w-9 h-9 rounded-lg border border-gold-400/40 bg-ink-900">
          <ScanLine size={s.icon} className="text-gold-400" strokeWidth={1.5} />
        </div>
      </div>
      <div className="flex flex-col items-start leading-none">
        <span className={`font-display font-semibold tracking-tight text-white ${s.text}`}>
          Grade<span className="text-gradient-gold">Vision</span>
        </span>
        <span className="text-[9px] tracking-[0.2em] uppercase text-ink-400 mt-0.5">
          AI Pre-Grading
        </span>
      </div>
    </button>
  );
}
