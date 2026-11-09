import type { GradeResult } from '@/types';

const DEFECT_OPTIONS = [
  'Minor edge whitening detected',
  'Slight corner fraying on top-left',
  'Micro-scratches visible under magnification',
  'Minor print line on front surface',
  'Light surface scuffing',
  'Slight centering offset to the right',
  'Minor back-edge wear',
  'Faint fingerprint residue',
  'Minor gloss inconsistency',
  'Light corner dent on bottom-right',
];

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function pick<T>(arr: T[], rand: () => number, count: number): T[] {
  const pool = [...arr];
  const result: T[] = [];
  for (let i = 0; i < count && pool.length > 0; i++) {
    const idx = Math.floor(rand() * pool.length);
    result.push(pool.splice(idx, 1)[0]);
  }
  return result;
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

  const cornerDefects = pick(DEFECT_OPTIONS, rand, Math.floor(rand() * 2) + 1);
  const edgeDefects = pick(DEFECT_OPTIONS, rand, Math.floor(rand() * 2));
  const surfaceDefects = pick(DEFECT_OPTIONS, rand, Math.floor(rand() * 2) + 1);

  const summary = generateSummary(overall, centering, corners, edges, surface, cardName);

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
      defects: cornerDefects,
    },
    edgesData: {
      top: clamp(7 + rand() * 3, 5, 10),
      bottom: clamp(7 + rand() * 3, 5, 10),
      left: clamp(7 + rand() * 3, 5, 10),
      right: clamp(7 + rand() * 3, 5, 10),
      wearLevel: edges >= 8 ? 'Minimal' : edges >= 7 ? 'Light' : 'Moderate',
      defects: edgeDefects,
    },
    surfaceData: {
      scratches: Math.floor(rand() * 4),
      printDefects: Math.floor(rand() * 3),
      whitening: Math.floor(rand() * 3),
      overall: surface >= 8.5 ? 'Clean' : surface >= 7 ? 'Minor wear' : 'Visible wear',
      defects: surfaceDefects,
    },
    summary,
  };
}

function generateSummary(
  overall: number,
  centering: number,
  corners: number,
  edges: number,
  surface: number,
  cardName: string
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

  return `This card grades at ${overall.toFixed(1)} (${label}). The ${strongestName} is the strongest attribute at ${strongest.toFixed(1)}, while the ${weakestName} is the primary area of concern at ${weakest.toFixed(1)}. Based on this pre-grade analysis, this card would likely receive a PSA-style grade in the ${overall >= 9 ? '9–10' : overall >= 8 ? '8–9' : overall >= 7 ? '7–8' : '6–7'} range. For a final authoritative grade, professional physical submission is recommended.`;
}

export function gradeLabelFromScore(score: number): string {
  return gradeLabel(score);
}
