import { normalize } from "./normalize";

export function matchCardToPSA(cardName: string, psaRows: any[]) {
  const target = normalize(cardName);
  return psaRows.find(row => {
    const combined = normalize(`${row.Player || ""} ${row.Set || ""} ${row.Card || ""} ${row.Description || ""}`);
    return combined.includes(target) || target.includes(combined);
  });
}
