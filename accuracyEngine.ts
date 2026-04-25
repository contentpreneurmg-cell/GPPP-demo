export function calculateAccuracy(records: any[]) {
  const clean = records.filter(r => r.predictedGrade && r.actualGrade);
  const correct = clean.filter(r => Number(r.predictedGrade) === Number(r.actualGrade)).length;
  return { total: clean.length, correct, accuracy: clean.length ? (correct / clean.length) * 100 : 0 };
}

export function calculateLooseAccuracy(records: any[]) {
  const clean = records.filter(r => r.predictedGrade && r.actualGrade);
  const withinOne = clean.filter(r => Math.abs(Number(r.predictedGrade) - Number(r.actualGrade)) <= 1).length;
  return { total: clean.length, withinOne, accuracy: clean.length ? (withinOne / clean.length) * 100 : 0 };
}
