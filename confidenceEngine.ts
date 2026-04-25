export function getConfidence(prob: any) {
  const values = [prob.psa10, prob.psa9, prob.psa8].sort((a,b)=>b-a);
  const spread = values[0] - values[1];
  if (spread > 0.30) return "HIGH";
  if (spread > 0.15) return "MEDIUM";
  return "LOW";
}

export function confidenceScore(prob: any) {
  const max = Math.max(prob.psa10, prob.psa9, prob.psa8);
  return Math.round(max * 100);
}
