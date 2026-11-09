import { useEffect, useState } from 'react';
import {
  Plus,
  Trash2,
  Search,
  Calendar,
  Award,
  ImageIcon,
  AlertCircle,
  Inbox,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { getSignedUrls } from '@/lib/storage';
import GradeDisplay from '@/components/GradeDisplay';
import type { GradingReport, Page } from '@/types';

interface DashboardPageProps {
  onNavigate: (page: Page) => void;
}

interface ReportWithThumb extends GradingReport {
  thumbUrl?: string | null;
}

export default function DashboardPage({ onNavigate }: DashboardPageProps) {
  const { user } = useAuth();
  const [reports, setReports] = useState<ReportWithThumb[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    loadReports();
  }, [user]);

  const loadReports = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from('grading_reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    const rawReports = (data as GradingReport[]) ?? [];

    // Generate signed URLs for all front image thumbnails
    const frontPaths = rawReports.map((r) => r.front_image_url);
    let signedUrls: (string | null)[] = frontPaths.map(() => null);

    try {
      signedUrls = await getSignedUrls(frontPaths);
    } catch {
      // Signed URL generation failed — thumbnails will show placeholder
    }

    const reportsWithThumbs: ReportWithThumb[] = rawReports.map((r, i) => ({
      ...r,
      thumbUrl: signedUrls[i] ?? null,
    }));

    setReports(reportsWithThumbs);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('grading_reports').delete().eq('id', id);
    if (error) {
      setError(error.message);
    } else {
      setReports((prev) => prev.filter((r) => r.id !== id));
    }
    setDeleteId(null);
  };

  const filteredReports = reports.filter((r) =>
    r.card_name.toLowerCase().includes(search.toLowerCase())
  );

  const avgGrade =
    reports.length > 0
      ? (reports.reduce((sum, r) => sum + (r.overall_grade ?? 0), 0) / reports.length).toFixed(1)
      : '—';

  const highestGrade = reports.length > 0
    ? Math.max(...reports.map((r) => r.overall_grade ?? 0)).toFixed(1)
    : '—';

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24 px-6">
        <div className="card-surface-elevated p-10 text-center max-w-md">
          <AlertCircle size={28} className="text-gold-400 mx-auto mb-4" />
          <h2 className="text-xl font-display font-semibold text-white mb-2">Sign in required</h2>
          <p className="text-sm text-ink-400 mb-6">Please sign in to view your grading dashboard.</p>
          <button onClick={() => onNavigate('login')} className="btn-gold w-full">
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 animate-fade-in">
      <div className="section-padding max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-display font-semibold text-white mb-1">
              Your Dashboard
            </h1>
            <p className="text-sm text-ink-400">
              {reports.length} grading{reports.length !== 1 ? 's' : ''} on record
            </p>
          </div>
          <button onClick={() => onNavigate('upload')} className="btn-gold">
            <Plus size={16} />
            New Grading
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <StatCard label="Total Gradings" value={String(reports.length)} icon={Inbox} />
          <StatCard label="Average Grade" value={avgGrade} icon={Award} />
          <StatCard label="Highest Grade" value={highestGrade} icon={Award} />
        </div>

        {/* Search */}
        {reports.length > 0 && (
          <div className="relative mb-6">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10"
              placeholder="Search by card name..."
            />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-6 flex items-start gap-2.5 px-4 py-3 rounded-lg border border-red-900/50 bg-red-950/30">
            <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-gold-400/30 border-t-gold-400 rounded-full animate-spin" />
          </div>
        )}

        {/* Empty state */}
        {!loading && reports.length === 0 && !error && (
          <div className="card-surface-elevated p-16 text-center">
            <div className="w-16 h-16 rounded-2xl border border-gold-400/20 bg-gold-400/5 flex items-center justify-center mx-auto mb-5">
              <ImageIcon size={28} className="text-gold-400" strokeWidth={1.5} />
            </div>
            <h2 className="text-xl font-display font-semibold text-white mb-2">
              No gradings yet
            </h2>
            <p className="text-sm text-ink-400 mb-6 max-w-sm mx-auto">
              Submit your first card for AI pre-grading and it will appear here in your history.
            </p>
            <button onClick={() => onNavigate('upload')} className="btn-gold">
              <Plus size={16} />
              Start First Grading
            </button>
          </div>
        )}

        {/* Report list */}
        {!loading && filteredReports.length > 0 && (
          <div className="flex flex-col gap-4">
            {filteredReports.map((report) => (
              <ReportRow
                key={report.id}
                report={report}
                onDelete={() => setDeleteId(report.id)}
                confirmDelete={deleteId === report.id}
                onCancelDelete={() => setDeleteId(null)}
                onConfirmDelete={() => handleDelete(report.id)}
              />
            ))}
            {filteredReports.length === 0 && search && (
              <div className="text-center py-12 text-sm text-ink-400">
                No gradings found matching "{search}"
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof Award;
}) {
  return (
    <div className="card-surface p-5">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={14} className="text-gold-400" strokeWidth={1.5} />
        <span className="text-xs uppercase tracking-wider text-ink-400">{label}</span>
      </div>
      <p className="text-2xl font-display font-semibold text-white">{value}</p>
    </div>
  );
}

function ReportRow({
  report,
  onDelete,
  confirmDelete,
  onCancelDelete,
  onConfirmDelete,
}: {
  report: ReportWithThumb;
  onDelete: () => void;
  confirmDelete: boolean;
  onCancelDelete: () => void;
  onConfirmDelete: () => void;
}) {
  return (
    <div className="card-surface p-5 flex items-center gap-5 group hover:border-gold-400/20 transition-colors duration-200">
      {/* Thumbnail */}
      <div className="flex-shrink-0 w-16 h-20 rounded-lg overflow-hidden bg-ink-950 border border-ink-700">
        {report.thumbUrl ? (
          <img
            src={report.thumbUrl}
            alt={report.card_name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon size={16} className="text-ink-600" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-base font-display font-semibold text-white truncate">
            {report.card_name}
          </h3>
          {report.is_demo && (
            <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded border border-gold-400/30 text-gold-400 flex-shrink-0">
              Demo
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-ink-400">
          <span className="flex items-center gap-1">
            <Calendar size={11} />
            {new Date(report.created_at).toLocaleDateString()}
          </span>
          {report.card_set && <span>· {report.card_set}</span>}
        </div>
        {report.overall_grade !== null && (
          <div className="flex items-center gap-3 mt-2">
            <SubGrade label="C" value={report.centering_grade} />
            <SubGrade label="Cor" value={report.corners_grade} />
            <SubGrade label="E" value={report.edges_grade} />
            <SubGrade label="S" value={report.surface_grade} />
          </div>
        )}
      </div>

      {/* Grade */}
      {report.overall_grade !== null && (
        <div className="flex-shrink-0 hidden sm:block">
          <GradeDisplay score={report.overall_grade} size="md" label />
        </div>
      )}

      {/* Actions */}
      <div className="flex-shrink-0">
        {confirmDelete ? (
          <div className="flex items-center gap-2">
            <button
              onClick={onConfirmDelete}
              className="text-xs px-3 py-1.5 rounded-md bg-red-900/40 border border-red-700/50 text-red-300 hover:bg-red-900/60 transition-colors"
            >
              Confirm
            </button>
            <button
              onClick={onCancelDelete}
              className="text-xs px-3 py-1.5 rounded-md border border-ink-600 text-ink-300 hover:border-ink-500 transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={onDelete}
            className="p-2 rounded-lg text-ink-500 hover:text-red-400 hover:bg-red-950/30 transition-all duration-200"
            aria-label="Delete report"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

function SubGrade({ label, value }: { label: string; value: number | null }) {
  if (value === null) return null;
  const color = value >= 8 ? 'text-gold-300' : value >= 7 ? 'text-ink-200' : 'text-ink-400';
  return (
    <span className={`text-xs font-mono ${color}`}>
      <span className="text-ink-500">{label}:</span> {value.toFixed(1)}
    </span>
  );
}
