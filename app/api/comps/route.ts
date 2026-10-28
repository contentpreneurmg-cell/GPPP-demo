import { NextResponse } from "next/server";
import { psaData } from "@/lib/psaDataset";

// Returns PSA comp prices for the demo card. Defaults to the first card in the dataset.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const card = searchParams.get("card");
  const key = card && psaData[card] ? card : Object.keys(psaData)[0];
  return NextResponse.json({ card: key, ...psaData[key] });
}
