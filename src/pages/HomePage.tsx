import {
  ScanLine,
  Crosshair,
  Square,
  Layers,
  FileSearch,
  ShieldCheck,
  ArrowRight,
  Check,
  AlertCircle,
} from 'lucide-react';
import type { Page } from '@/types';
import { useAuth } from '@/context/AuthContext';

interface HomePageProps {
  onNavigate: (page: Page) => void;
}

const HERO_IMAGE = 'https://images.pexels.com/photos/9661252/pexels-photo-9661252.jpeg?auto=compress&cs=tinysrgb&w=1600';

const ANALYSIS_FEATURES = [
  {
    icon: Crosshair,
    title: 'Centering Analysis',
    description: 'Border measurement estimates exact top/bottom and left/right ratios to assess how well the card image is framed.',
  },
  {
    icon: Square,
    title: 'Corner Inspection',
    description: 'Each corner is individually evaluated for sharpness, rounding, fraying, and whitening — factors that impact the estimated grade.',
  },
  {
    icon: Layers,
    title: 'Edge Evaluation',
    description: 'Edge wear is detected on all four sides, flagging nicking, flaking, and silvering that affect the final grade.',
  },
  {
    icon: FileSearch,
    title: 'Surface Assessment',
    description: 'Scratches, print defects, scuffing, and gloss inconsistencies are identified and weighed against PSA-style grading standards.',
  },
];

const STEPS = [
  { num: '01', title: 'Upload Card Images', description: 'Submit front, back, and close-up photos of your card in high resolution.' },
  { num: '02', title: 'AI Analysis', description: 'Our engine analyzes centering, corners, edges, and surface using computer vision.' },
  { num: '03', title: 'Detailed Report', description: 'Receive a comprehensive estimated grade with sub-scores, a confidence level, and a plausible PSA range.' },
  { num: '04', title: 'Track History', description: 'All your pre-grades are saved to your dashboard for future reference.' },
];

export default function HomePage({ onNavigate }: HomePageProps) {
  const { user } = useAuth();

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative min-h-[92vh] flex items-center pt-16 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={HERO_IMAGE}
            alt="Pokémon trading cards"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ink-950/80 via-ink-950/90 to-ink-950" />
          <div className="absolute inset-0 bg-grid opacity-40" />
        </div>

        <div className="relative section-padding max-w-7xl mx-auto w-full">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gold-400/30 bg-gold-400/5 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-pulse" />
              <span className="text-xs tracking-[0.15em] uppercase text-gold-300">
                AI-Powered Pre-Grading
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-semibold text-white leading-[1.1] mb-6">
              Know your card's grade
              <br />
              <span className="text-gradient-gold">before you submit.</span>
            </h1>

            <p className="text-lg text-ink-300 leading-relaxed max-w-2xl mb-8">
              GradeVision uses computer vision and AI to analyze your Pokémon cards'
              centering, corners, edges, and surface — delivering a detailed pre-grading
              estimate with a confidence level and plausible PSA range in minutes, not weeks.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <button onClick={() => onNavigate(user ? 'upload' : 'signup')} className="btn-gold">
                {user ? 'Start New Pre-Grade' : 'Get Started Free'}
                <ArrowRight size={16} />
              </button>
              <button onClick={() => onNavigate('upload')} className="btn-outline-gold">
                <ScanLine size={16} />
                Try a Demo Pre-Grade
              </button>
            </div>

            <div className="flex items-center gap-6 text-sm text-ink-400">
              <div className="flex items-center gap-2">
                <Check size={14} className="text-gold-400" />
                No card shipped
              </div>
              <div className="flex items-center gap-2">
                <Check size={14} className="text-gold-400" />
                Results in minutes
              </div>
              <div className="flex items-center gap-2">
                <Check size={14} className="text-gold-400" />
                Detailed sub-grades
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo notice banner */}
      <section className="section-padding max-w-7xl mx-auto -mt-8 relative z-10">
        <div className="card-surface px-6 py-4 flex items-center gap-3">
          <AlertCircle size={18} className="text-gold-400 flex-shrink-0" />
          <p className="text-sm text-ink-300">
            <span className="text-gold-300 font-medium">Demo Mode:</span> Pre-grading estimates are
            currently simulated for demonstration. The real computer vision engine is being
            connected — all reports are clearly labeled as demo until then.
          </p>
        </div>
      </section>

      {/* Analysis Features */}
      <section className="section-padding max-w-7xl mx-auto py-24">
        <div className="text-center mb-16">
          <span className="text-xs tracking-[0.2em] uppercase text-gold-400">
            Comprehensive Analysis
          </span>
          <h2 className="text-4xl md:text-5xl font-display font-semibold text-white mt-3 mb-4">
            Four-point card evaluation
          </h2>
          <p className="text-ink-400 max-w-2xl mx-auto">
            Every card is assessed across the four criteria used by professional grading companies,
            each scored independently from 1 to 10.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ANALYSIS_FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="card-surface p-8 group hover:border-gold-400/30 transition-all duration-300"
              >
                <div className="flex items-start gap-5">
                  <div className="flex-shrink-0 w-14 h-14 rounded-xl border border-gold-400/20 bg-gold-400/5 flex items-center justify-center group-hover:border-gold-400/40 transition-colors duration-300">
                    <Icon size={24} className="text-gold-400" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="text-xl font-display font-semibold text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-ink-400 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* How It Works */}
      <section className="relative py-24 border-y border-ink-700/40 bg-ink-900/40">
        <div className="section-padding max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs tracking-[0.2em] uppercase text-gold-400">
              The Process
            </span>
            <h2 className="text-4xl md:text-5xl font-display font-semibold text-white mt-3">
              How GradeVision works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {STEPS.map((step, i) => (
              <div key={step.num} className="relative">
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-6 left-[60%] w-full h-px bg-gradient-to-r from-gold-400/30 to-transparent" />
                )}
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl border border-gold-400/30 bg-ink-900 flex items-center justify-center mb-5">
                    <span className="font-display text-gold-400 font-semibold">{step.num}</span>
                  </div>
                  <h3 className="text-lg font-display font-semibold text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-ink-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Grade Scale */}
      <section className="section-padding max-w-7xl mx-auto py-24">
        <div className="text-center mb-12">
          <span className="text-xs tracking-[0.2em] uppercase text-gold-400">
            Estimation Scale
          </span>
          <h2 className="text-4xl md:text-5xl font-display font-semibold text-white mt-3">
            The 1–10 estimation scale
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { range: '9.0–10', label: 'Gem Mint', desc: 'Flawless' },
            { range: '8.0–8.9', label: 'Mint', desc: 'Near perfect' },
            { range: '7.0–7.9', label: 'Near Mint', desc: 'Minor wear' },
            { range: '5.0–6.9', label: 'Excellent', desc: 'Light play' },
            { range: 'Below 5', label: 'Good–Poor', desc: 'Heavy wear' },
          ].map((tier) => (
            <div key={tier.range} className="card-surface p-6 text-center">
              <div className="font-display text-2xl text-gradient-gold font-semibold mb-1">
                {tier.range}
              </div>
              <div className="text-sm text-white font-medium mb-1">{tier.label}</div>
              <div className="text-xs text-ink-400">{tier.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Trust / Security */}
      <section className="section-padding max-w-7xl mx-auto py-16">
        <div className="card-surface-elevated p-10 md:p-12 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-shrink-0 w-16 h-16 rounded-2xl border border-gold-400/30 bg-gold-400/5 flex items-center justify-center">
            <ShieldCheck size={32} className="text-gold-400" strokeWidth={1.5} />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-2xl font-display font-semibold text-white mb-2">
              Your data is secure
            </h3>
            <p className="text-ink-400 leading-relaxed">
              All image processing runs through encrypted server-side pipelines. Your card
              images and pre-grading history are private to your account, and API keys never
              touch the browser.
            </p>
          </div>
          <button onClick={() => onNavigate(user ? 'upload' : 'signup')} className="btn-gold flex-shrink-0">
            {user ? 'Start Pre-Grading' : 'Create Account'}
            <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding max-w-7xl mx-auto py-20 text-center">
        <h2 className="text-4xl md:text-5xl font-display font-semibold text-white mb-4">
          Ready to pre-grade your collection?
        </h2>
        <p className="text-ink-400 max-w-xl mx-auto mb-8">
          Upload your first card and receive a detailed pre-grading estimate with a confidence level and plausible PSA range in minutes.
        </p>
        <button onClick={() => onNavigate(user ? 'upload' : 'signup')} className="btn-gold text-base px-8 py-4">
          {user ? 'Start New Grading' : 'Get Started Free'}
          <ArrowRight size={18} />
        </button>
      </section>
    </div>
  );
}
