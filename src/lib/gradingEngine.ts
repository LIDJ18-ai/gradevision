import type { GradeResult } from '@/types';

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function clamp(n: number, min: number, max: number): number {
  return Math.round(Math.min(max, Math.max(min, n)) * 10) / 10;
}

function gradeLabel(score: number): string {
  if (score >= 9.5) return 'Gem Mint';
  if (score >= 9) return 'Mint';
  if (score >= 8) return 'Near Mint–Mint';
  if (score >= 7) return 'Near Mint';
  if (score >= 6) return 'Excellent–Near Mint';
  if (score >= 5) return 'Excellent';
  if (score >= 4) return 'Very Good–Excellent';
  if (score >= 3) return 'Very Good';
  if (score >= 2) return 'Good';
  return 'Poor';
}

export function generateDemoGrade(cardName: string, seedString: string): GradeResult {
  const seed = cardName.length * 1000 + seedString.length * 31 + Date.now() % 10000;
  const rand = seededRandom(seed);

  const centering = clamp(7 + rand() * 2.8, 6, 10);
  const corners = clamp(6.5 + rand() * 3, 5.5, 10);
  const edges = clamp(7 + rand() * 2.5, 6, 10);
  const surface = clamp(7.5 + rand() * 2.2, 6.5, 10);

  const overall = clamp((centering + corners + edges + surface) / 4, 1, 10);

  const topPct = Math.round((40 + rand() * 15) * 10) / 10;
  const bottomPct = Math.round(100 - topPct);
  const leftPct = Math.round((45 + rand() * 12) * 10) / 10;
  const rightPct = Math.round(100 - leftPct);

  const confidenceLevel: 'Low' | 'Moderate' | 'High' = 'Moderate';
  const confidenceExplanation =
    'This estimate is based on simulated analysis of the submitted images. ' +
    'When the real grading engine is connected, confidence will reflect image quality, ' +
    'lighting, resolution, and the completeness of submitted views (front, back, close-up).';

  const estimatedRange = overall >= 9
    ? `${(overall - 0.5).toFixed(1)}–${Math.min(10, overall + 0.5).toFixed(1)}`
    : overall >= 8
    ? `${(overall - 1).toFixed(1)}–${overall.toFixed(1)}`
    : `${(overall - 1.5).toFixed(1)}–${(overall - 0.5).toFixed(1)}`;

  const summary = generateSummary(overall, centering, corners, edges, surface, estimatedRange);

  return {
    overall,
    centering,
    corners,
    edges,
    surface,
    centeringData: {
      top: topPct,
      bottom: bottomPct,
      left: leftPct,
      right: rightPct,
      horizontalRatio: `${leftPct}/${rightPct}`,
      verticalRatio: `${topPct}/${bottomPct}`,
    },
    cornersData: {
      topLeft: clamp(7 + rand() * 3, 5, 10),
      topRight: clamp(7 + rand() * 3, 5, 10),
      bottomLeft: clamp(7 + rand() * 3, 5, 10),
      bottomRight: clamp(7 + rand() * 3, 5, 10),
      defects: [],
    },
    edgesData: {
      top: clamp(7 + rand() * 3, 5, 10),
      bottom: clamp(7 + rand() * 3, 5, 10),
      left: clamp(7 + rand() * 3, 5, 10),
      right: clamp(7 + rand() * 3, 5, 10),
      wearLevel: edges >= 8 ? 'Minimal' : edges >= 7 ? 'Light' : 'Moderate',
      defects: [],
    },
    surfaceData: {
      scratches: 0,
      printDefects: 0,
      whitening: 0,
      overall: surface >= 8.5 ? 'Clean' : surface >= 7 ? 'Minor wear' : 'Visible wear',
      defects: [],
    },
    summary,
    confidenceLevel,
    confidenceExplanation,
    estimatedRange,
  };
}

function generateSummary(
  overall: number,
  centering: number,
  corners: number,
  edges: number,
  surface: number,
  estimatedRange: string
): string {
  const weakest = Math.min(centering, corners, edges, surface);
  const weakestName =
    weakest === centering ? 'centering' :
    weakest === corners ? 'corner condition' :
    weakest === edges ? 'edge wear' : 'surface quality';

  const strongest = Math.max(centering, corners, edges, surface);
  const strongestName =
    strongest === centering ? 'centering' :
    strongest === corners ? 'corner condition' :
    strongest === edges ? 'edge condition' : 'surface quality';

  const label = gradeLabel(overall);

  return (
    `Based on the submitted images, this card is estimated to pre-grade at ${overall.toFixed(1)} ` +
    `(${label}), with a plausible PSA-style range of ${estimatedRange}. ` +
    `The ${strongestName} appears to be the strongest attribute at ${strongest.toFixed(1)}, ` +
    `while the ${weakestName} is the primary area of concern at ${weakest.toFixed(1)}. ` +
    `This is a pre-grading estimate only — it is not an official grade and does not guarantee ` +
    `any particular result from PSA or any other grading company. ` +
    `Final grades depend on in-hand inspection under controlled conditions, which cannot be ` +
    `fully replicated from photos alone.`
  );
}

export function gradeLabelFromScore(score: number): string {
  return gradeLabel(score);
}

export function confidenceColor(level: 'Low' | 'Moderate' | 'High'): string {
  if (level === 'High') return 'text-green-400';
  if (level === 'Moderate') return 'text-gold-300';
  return 'text-orange-400';
}
