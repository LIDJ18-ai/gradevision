import Logo from './Logo';
import type { Page } from '@/types';

interface FooterProps {
  onNavigate: (page: Page) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="border-t border-ink-700/60 bg-ink-950">
      <div className="section-padding max-w-7xl mx-auto py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <Logo size="md" />
            <p className="text-sm text-ink-400 mt-4 max-w-sm leading-relaxed">
              Professional AI-powered pre-grading for Pokémon trading cards.
              Centering, corners, edges, and surface analysis with detailed 1–10 grading reports.
            </p>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-[0.15em] text-gold-400 mb-4">Platform</h4>
            <div className="flex flex-col gap-2.5">
              <button onClick={() => onNavigate('upload')} className="text-sm text-ink-300 hover:text-white transition-colors text-left">
                New Grading
              </button>
              <button onClick={() => onNavigate('dashboard')} className="text-sm text-ink-300 hover:text-white transition-colors text-left">
                Dashboard
              </button>
              <button onClick={() => onNavigate('home')} className="text-sm text-ink-300 hover:text-white transition-colors text-left">
                How It Works
              </button>
            </div>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-[0.15em] text-gold-400 mb-4">Account</h4>
            <div className="flex flex-col gap-2.5">
              <button onClick={() => onNavigate('login')} className="text-sm text-ink-300 hover:text-white transition-colors text-left">
                Sign In
              </button>
              <button onClick={() => onNavigate('signup')} className="text-sm text-ink-300 hover:text-white transition-colors text-left">
                Create Account
              </button>
            </div>
          </div>
        </div>

        <div className="divider-gold mb-6" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-ink-500">
            © {new Date().getFullYear()} GradeVision. Pre-grading estimates only — not a substitute for professional slab grading.
          </p>
          <p className="text-xs text-ink-500">
            Demo mode — grading results are simulated for demonstration.
          </p>
        </div>
      </div>
    </footer>
  );
}
