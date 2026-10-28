export type Defects = { surface?: boolean; edges?: boolean; centering?: boolean; corners?: boolean };

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
