import { useEffect, useState } from 'react';
import {
  Crosshair,
  Square,
  Layers,
  FileSearch,
  AlertTriangle,
  Check,
  ArrowRight,
  Download,
  RotateCcw,
  Info,
  ImageIcon,
} from 'lucide-react';
import GradeDisplay from '@/components/GradeDisplay';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { getSignedUrl } from '@/lib/storage';
import { gradeLabelFromScore } from '@/lib/gradingEngine';
import type { GradeResult, GradingReport, Page } from '@/types';
import type { UploadedCardData } from './UploadPage';

interface ReportPageProps {
  cardData: UploadedCardData;
  result: GradeResult;
  reportId: string | null;
  onNavigate: (page: Page) => void;
  onNewGrading: () => void;
}

export default function ReportPage({
  cardData,
  result,
  reportId,
  onNavigate,
  onNewGrading,
}: ReportPageProps) {
  const { user } = useAuth();
  const [saved, setSaved] = useState(!!reportId);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [imageUrls, setImageUrls] = useState<{
    front: string | null;
    back: string | null;
    closeup: string | null;
  }>({
    front: cardData.frontImageUrl,
    back: cardData.backImageUrl,
    closeup: cardData.closeupImageUrl,
  });

  useEffect(() => {
    const refreshUrls = async () => {
      try {
        const [front, back, closeup] = await Promise.all([
          getSignedUrl(cardData.frontImagePath),
          cardData.backImagePath ? getSignedUrl(cardData.backImagePath) : Promise.resolve(null),
          cardData.closeupImagePath ? getSignedUrl(cardData.closeupImagePath) : Promise.resolve(null),
        ]);
        setImageUrls({ front, back, closeup });
      } catch {
        // Signed URL refresh failed — keep existing URLs
      }
    };

    if (cardData.frontImagePath) {
      refreshUrls();
    }
  }, [cardData.frontImagePath, cardData.backImagePath, cardData.closeupImagePath]);

  useEffect(() => {
    if (reportId || saved || !user) return;

    const saveReport = async () => {
      const { error } = await supabase.from('grading_reports').insert({
        user_id: user.id,
        card_name: cardData.cardName,
        card_set: cardData.cardSet,
        card_year: cardData.cardYear,
        front_image_url: cardData.frontImagePath,
        back_image_url: cardData.backImagePath,
        closeup_image_url: cardData.closeupImagePath,
        status: 'complete',
        is_demo: true,
        overall_grade: result.overall,
        centering_grade: result.centering,
        corners_grade: result.corners,
        edges_grade: result.edges,
        surface_grade: result.surface,
        centering_data: result.centeringData,
        corners_data: result.cornersData,
        edges_data: result.edgesData,
        surface_data: result.surfaceData,
        summary: result.summary,
      });

      if (error) {
        setSaveError(error.message);
      } else {
        setSaved(true);
      }
    };

    saveReport();
  }, [reportId, saved, user, cardData, result]);

  const handleDownload = () => {
    const reportText = generateReportText(cardData, result);
    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GradeVision-${cardData.cardName.replace(/[^a-z0-9]/gi, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen pt-24 pb-16 animate-fade-in">
      <div className="section-padding max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="px-3 py-1 rounded-full text-[10px] uppercase tracking-[0.15em] border border-gold-400/30 bg-gold-400/5 text-gold-300">
                Demo Report
              </span>
              {saved && (
                <span className="flex items-center gap-1.5 text-xs text-green-400">
                  <Check size={12} />
                  Saved to dashboard
                </span>
              )}
              {saveError && (
                <span className="flex items-center gap-1.5 text-xs text-red-400">
                  <AlertTriangle size={12} />
                  Not saved: {saveError}
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-semibold text-white">
              {cardData.cardName}
            </h1>
            <p className="text-sm text-ink-400 mt-1">
              {cardData.cardSet && <span>{cardData.cardSet}</span>}
              {cardData.cardSet && cardData.cardYear && <span> · </span>}
              {cardData.cardYear && <span>{cardData.cardYear}</span>}
              {!cardData.cardSet && !cardData.cardYear && <span>Grading Report</span>}
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={handleDownload} className="btn-ghost text-sm px-4 py-2">
              <Download size={14} />
              Download
            </button>
            <button onClick={onNewGrading} className="btn-outline-gold text-sm px-4 py-2">
              <RotateCcw size={14} />
              New Grading
            </button>
          </div>
        </div>

        {/* Overall Score + Images */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Overall score */}
          <div className="card-surface-elevated p-8 flex flex-col items-center justify-center text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-gold-400 mb-5">Overall Grade</p>
            <GradeDisplay score={result.overall} size="xl" />
            <p className="text-sm text-white font-medium mt-4 mb-1">
              {gradeLabelFromScore(result.overall)}
            </p>
            <p className="text-xs text-ink-400">
              Weighted average of all sub-grades
            </p>
          </div>

          {/* Card images */}
          <div className="lg:col-span-2 card-surface-elevated p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-gold-400 mb-4">Submitted Images</p>
            <div className="grid grid-cols-3 gap-3">
              <ReportImage url={imageUrls.front} label="Front" />
              {imageUrls.back ? (
                <ReportImage url={imageUrls.back} label="Back" />
              ) : (
                <EmptyImageSlot label="Back" />
              )}
              {imageUrls.closeup ? (
                <ReportImage url={imageUrls.closeup} label="Close-up" />
              ) : (
                <EmptyImageSlot label="Close-up" />
              )}
            </div>
          </div>
        </div>

        {/* Sub-grades */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <SubGradeCard
            icon={Crosshair}
            label="Centering"
            score={result.centering}
          />
          <SubGradeCard
            icon={Square}
            label="Corners"
            score={result.corners}
          />
          <SubGradeCard
            icon={Layers}
            label="Edges"
            score={result.edges}
          />
          <SubGradeCard
            icon={FileSearch}
            label="Surface"
            score={result.surface}
          />
        </div>

        {/* Detailed breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Centering */}
          <div className="card-surface p-6">
            <SectionHeader icon={Crosshair} title="Centering Analysis" />
            <div className="grid grid-cols-2 gap-4 mb-4">
              <RatioBox label="Vertical" ratio={result.centeringData.verticalRatio} />
              <RatioBox label="Horizontal" ratio={result.centeringData.horizontalRatio} />
            </div>
            <div className="grid grid-cols-4 gap-2 text-center">
              <BorderStat label="Top" value={`${result.centeringData.top}%`} />
              <BorderStat label="Bottom" value={`${result.centeringData.bottom}%`} />
              <BorderStat label="Left" value={`${result.centeringData.left}%`} />
              <BorderStat label="Right" value={`${result.centeringData.right}%`} />
            </div>
            <p className="text-xs text-ink-500 mt-4 leading-relaxed">
              Border percentages are calculated using OpenCV contour detection on the card edge
              relative to the image frame.
            </p>
          </div>

          {/* Corners */}
          <div className="card-surface p-6">
            <SectionHeader icon={Square} title="Corner Inspection" />
            <div className="grid grid-cols-2 gap-3 mb-4">
              <CornerStat label="Top-Left" value={result.cornersData.topLeft} />
              <CornerStat label="Top-Right" value={result.cornersData.topRight} />
              <CornerStat label="Bottom-Left" value={result.cornersData.bottomLeft} />
              <CornerStat label="Bottom-Right" value={result.cornersData.bottomRight} />
            </div>
            <DefectList defects={result.cornersData.defects} />
          </div>

          {/* Edges */}
          <div className="card-surface p-6">
            <SectionHeader icon={Layers} title="Edge Evaluation" />
            <div className="grid grid-cols-2 gap-3 mb-4">
              <CornerStat label="Top Edge" value={result.edgesData.top} />
              <CornerStat label="Bottom Edge" value={result.edgesData.bottom} />
              <CornerStat label="Left Edge" value={result.edgesData.left} />
              <CornerStat label="Right Edge" value={result.edgesData.right} />
            </div>
            <div className="mb-4 px-4 py-2.5 rounded-lg bg-ink-900/60 border border-ink-700">
              <div className="flex items-center justify-between">
                <span className="text-xs text-ink-400">Wear Level</span>
                <span className="text-sm font-medium text-gold-300">{result.edgesData.wearLevel}</span>
              </div>
            </div>
            <DefectList defects={result.edgesData.defects} />
          </div>

          {/* Surface */}
          <div className="card-surface p-6">
            <SectionHeader icon={FileSearch} title="Surface Assessment" />
            <div className="grid grid-cols-3 gap-3 mb-4">
              <SurfaceStat label="Scratches" value={result.surfaceData.scratches} />
              <SurfaceStat label="Print Defects" value={result.surfaceData.printDefects} />
              <SurfaceStat label="Whitening" value={result.surfaceData.whitening} />
            </div>
            <div className="mb-4 px-4 py-2.5 rounded-lg bg-ink-900/60 border border-ink-700">
              <div className="flex items-center justify-between">
                <span className="text-xs text-ink-400">Surface Condition</span>
                <span className="text-sm font-medium text-gold-300">{result.surfaceData.overall}</span>
              </div>
            </div>
            <DefectList defects={result.surfaceData.defects} />
          </div>
        </div>

        {/* Summary */}
        <div className="card-surface-elevated p-8 mb-8">
          <h2 className="text-lg font-display font-semibold text-white mb-3">
            AI Grading Summary
          </h2>
          <p className="text-sm text-ink-300 leading-relaxed mb-5">
            {result.summary}
          </p>
          <div className="flex items-start gap-2.5 px-4 py-3 rounded-lg border border-gold-400/20 bg-gold-400/5">
            <Info size={16} className="text-gold-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-ink-300 leading-relaxed">
              This is a <span className="text-gold-300 font-medium">demo report</span> with simulated
              results. The real grading engine — powered by OpenCV centering detection and AI surface
              analysis — is being connected. Pre-grading estimates are informational only and not a
              guarantee of or substitute for professional physical slab grading.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button onClick={() => onNavigate('dashboard')} className="btn-ghost">
            View All Reports
            <ArrowRight size={16} />
          </button>
          <button onClick={onNewGrading} className="btn-gold">
            Grade Another Card
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

// Sub-components

function SubGradeCard({
  icon: Icon,
  label,
  score,
}: {
  icon: typeof Crosshair;
  label: string;
  score: number;
}) {
  return (
    <div className="card-surface p-5 flex flex-col items-center text-center">
      <Icon size={20} className="text-gold-400 mb-3" strokeWidth={1.5} />
      <GradeDisplay score={score} size="md" />
      <p className="text-xs text-ink-400 mt-3 uppercase tracking-wider">{label}</p>
    </div>
  );
}

function SectionHeader({ icon: Icon, title }: { icon: typeof Crosshair; title: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-5">
      <Icon size={18} className="text-gold-400" strokeWidth={1.5} />
      <h3 className="text-base font-display font-semibold text-white">{title}</h3>
    </div>
  );
}

function RatioBox({ label, ratio }: { label: string; ratio: string }) {
  return (
    <div className="px-4 py-3 rounded-lg bg-ink-900/60 border border-ink-700 text-center">
      <p className="text-xs text-ink-400 mb-1">{label} Ratio</p>
      <p className="text-lg font-mono font-medium text-gold-300">{ratio}</p>
    </div>
  );
}

function BorderStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-2 py-2 rounded-md bg-ink-900/40 border border-ink-700/50">
      <p className="text-[10px] text-ink-500 uppercase tracking-wider">{label}</p>
      <p className="text-sm font-mono text-white mt-0.5">{value}</p>
    </div>
  );
}

function CornerStat({ label, value }: { label: string; value: number }) {
  const color = value >= 8 ? 'text-gold-300' : value >= 7 ? 'text-white' : 'text-ink-300';
  return (
    <div className="px-3 py-2.5 rounded-lg bg-ink-900/60 border border-ink-700">
      <div className="flex items-center justify-between">
        <span className="text-xs text-ink-400">{label}</span>
        <span className={`text-sm font-mono font-medium ${color}`}>{value.toFixed(1)}</span>
      </div>
    </div>
  );
}

function SurfaceStat({ label, value }: { label: string; value: number }) {
  const color = value === 0 ? 'text-green-400' : value <= 1 ? 'text-gold-300' : 'text-red-400';
  return (
    <div className="px-2 py-3 rounded-lg bg-ink-900/60 border border-ink-700 text-center">
      <p className="text-[10px] text-ink-500 uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-lg font-mono font-medium ${color}`}>{value}</p>
    </div>
  );
}

function DefectList({ defects }: { defects: string[] }) {
  if (defects.length === 0) {
    return (
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-green-950/20 border border-green-900/30">
        <Check size={14} className="text-green-400" />
        <p className="text-xs text-green-300">No notable defects detected</p>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-2">
      {defects.map((defect, i) => (
        <div key={i} className="flex items-start gap-2 px-3 py-2 rounded-lg bg-ink-900/40 border border-ink-700/50">
          <AlertTriangle size={13} className="text-gold-400/70 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-ink-300">{defect}</p>
        </div>
      ))}
    </div>
  );
}

function ReportImage({ url, label }: { url: string | null; label: string }) {
  return (
    <div className="aspect-[3/4] rounded-lg overflow-hidden bg-ink-950 border border-ink-700 relative group">
      {url ? (
        <img src={url} alt={label} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <ImageIcon size={20} className="text-ink-600" />
        </div>
      )}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-ink-950/90 to-transparent px-2 py-1.5">
        <p className="text-[10px] text-ink-300 uppercase tracking-wider">{label}</p>
      </div>
    </div>
  );
}

function EmptyImageSlot({ label }: { label: string }) {
  return (
    <div className="aspect-[3/4] rounded-lg bg-ink-900/40 border border-dashed border-ink-700 flex items-center justify-center">
      <p className="text-[10px] text-ink-600 uppercase tracking-wider">{label}</p>
    </div>
  );
}

function generateReportText(cardData: UploadedCardData, result: GradeResult): string {
  const lines = [
    '========================================',
    '       GradeVision AI Pre-Grading Report',
    '           *** DEMO REPORT ***',
    '========================================',
    '',
    `Card: ${cardData.cardName}`,
    cardData.cardSet && `Set: ${cardData.cardSet}`,
    cardData.cardYear && `Year: ${cardData.cardYear}`,
    `Date: ${new Date().toLocaleDateString()}`,
    '',
    '--- OVERALL GRADE ---',
    `${result.overall.toFixed(1)} / 10.0  (${gradeLabelFromScore(result.overall)})`,
    '',
    '--- SUB-GRADES ---',
    `Centering: ${result.centering.toFixed(1)}`,
    `Corners:   ${result.corners.toFixed(1)}`,
    `Edges:     ${result.edges.toFixed(1)}`,
    `Surface:   ${result.surface.toFixed(1)}`,
    '',
    '--- CENTERING DETAILS ---',
    `Vertical Ratio:   ${result.centeringData.verticalRatio}`,
    `Horizontal Ratio: ${result.centeringData.horizontalRatio}`,
    `Top: ${result.centeringData.top}%  Bottom: ${result.centeringData.bottom}%`,
    `Left: ${result.centeringData.left}%  Right: ${result.centeringData.right}%`,
    '',
    '--- CORNER DETAILS ---',
    `Top-Left: ${result.cornersData.topLeft.toFixed(1)}  Top-Right: ${result.cornersData.topRight.toFixed(1)}`,
    `Bottom-Left: ${result.cornersData.bottomLeft.toFixed(1)}  Bottom-Right: ${result.cornersData.bottomRight.toFixed(1)}`,
    result.cornersData.defects.length > 0 ? `Defects: ${result.cornersData.defects.join('; ')}` : 'No notable defects',
    '',
    '--- EDGE DETAILS ---',
    `Wear Level: ${result.edgesData.wearLevel}`,
    result.edgesData.defects.length > 0 ? `Defects: ${result.edgesData.defects.join('; ')}` : 'No notable defects',
    '',
    '--- SURFACE DETAILS ---',
    `Condition: ${result.surfaceData.overall}`,
    `Scratches: ${result.surfaceData.scratches}  Print Defects: ${result.surfaceData.printDefects}  Whitening: ${result.surfaceData.whitening}`,
    result.surfaceData.defects.length > 0 ? `Defects: ${result.surfaceData.defects.join('; ')}` : 'No notable defects',
    '',
    '--- SUMMARY ---',
    result.summary,
    '',
    '========================================',
    'This is a simulated demo report. Results are',
    'not a substitute for professional grading.',
    '========================================',
  ];
  return lines.filter(Boolean).join('\n');
}
