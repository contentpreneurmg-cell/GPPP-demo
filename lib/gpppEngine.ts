export type Defects = { surface?: boolean; edges?: boolean; centering?: boolean; corners?: boolean };
export type Scores = { surface: number; corners: number; centering: number; edges: number };
export type Probabilities = { psa10: number; psa9: number; psa8: number };

// GPPP Module I weights (Surface 45 / Corners 20 / Centering 20 / Edges 15)
export const WEIGHTS: Scores = { surface: 0.45, corners: 0.2, centering: 0.2, edges: 0.15 };

export function compositeScore(s: Scores) {
  const raw =
    s.surface * WEIGHTS.surface +
    s.corners * WEIGHTS.corners +
    s.centering * WEIGHTS.centering +
    s.edges * WEIGHTS.edges;
  return Math.round(raw * 100) / 100;
}

// Standard normal CDF (Abramowitz–Stegun approximation)
function phi(z: number) {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp((-z * z) / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return z > 0 ? 1 - p : p;
}

// GPPP Module II (RAKE): composite score -> PSA 10 / 9 / 8-or-lower split.
// The weakest dimension caps the outlook, since one bad corner or surface flaw limits a PSA grade.
export function scoreToProbabilities(s: Scores): Probabilities {
  const weakest = Math.min(s.surface, s.corners, s.centering, s.edges);
  const mean = Math.min(compositeScore(s), weakest + 1);
  const sd = 0.6;
  // Calibrated to the canonical GPPP record PHX-0001: 9.35 -> 48% / 44% / 8%
  const psa10 = 1 - phi((9.38 - mean) / sd);
  const psa8 = phi((8.507 - mean) / sd);
  const psa9 = Math.max(0, 1 - psa10 - psa8);
  return { psa10, psa9, psa8 };
}

// Legacy defect-flag model, kept for the CSV/backtest tools.
export function getProbabilities(defects: Defects) {
  let base10 = 0.65;
  if (defects.surface) base10 -= 0.10;
  if (defects.edges) base10 -= 0.08;
  if (defects.centering) base10 -= 0.07;
  if (defects.corners) base10 -= 0.08;
  base10 = Math.max(0.05, Math.min(0.9, base10));
  const psa8 = 0.08;
  return { psa10: base10, psa9: Math.max(0, 1 - base10 - psa8), psa8 };
}

export function predictedGrade(prob: any) {
  if (prob.psa10 >= prob.psa9 && prob.psa10 >= prob.psa8) return 10;
  if (prob.psa9 >= prob.psa8) return 9;
  return 8;
}

// GPPP Module IV: Submit / Hold / Pass
export function decision(prob: Probabilities, netEV: number | null) {
  if (netEV === null) return "—";
  if (netEV > 0 && prob.psa10 >= 0.4) return "SUBMIT";
  if (netEV > 0) return "HOLD";
  return "PASS";
}
