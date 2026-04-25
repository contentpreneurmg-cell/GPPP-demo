export function calculateEV(prob: any, prices: any, cost: number) {
  const expectedValue = prob.psa10 * prices.psa10 + prob.psa9 * prices.psa9 + prob.psa8 * prices.psa8;
  return { expectedValue, net: expectedValue - cost };
}
