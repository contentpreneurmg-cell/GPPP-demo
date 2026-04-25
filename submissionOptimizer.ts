export function optimizeSubmission(cards: any[]) {
  return cards.map(card => {
    const ev = card.prob.psa10 * card.prices.psa10 + card.prob.psa9 * card.prices.psa9 + card.prob.psa8 * card.prices.psa8 - card.cost;
    return { ...card, ev };
  }).sort((a, b) => b.ev - a.ev);
}
