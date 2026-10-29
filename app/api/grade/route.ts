import { NextResponse } from "next/server";

export const maxDuration = 60;

const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5";

const PROMPT = `You are the GPPP (Grade Prediction Protocol) visual grader for CardProjector.
Examine this sports card photo the way a PSA grader would, judging only what is visible.

Score each dimension from 1 to 10 in half-point steps (10 = flawless):
- surface: scratches, print lines, dimples, stains, gloss loss, refractor haze
- corners: sharpness, whitening, rounding, dings
- centering: border balance left/right and top/bottom
- edges: chipping, whitening, roughness, nicks

Then list each visible defect with its approximate position on the card as x,y fractions (0,0 = top-left, 1,1 = bottom-right) and a severity:
"red" = likely to cost a grade, "orange" = minor wear, "green" = clean area worth noting.

Reply with ONLY a JSON object, no prose, in exactly this shape:
{
  "card": "best guess of player, year, set, parallel, or \\"Unknown\\"",
  "image_ok": true,
  "image_issue": "",
  "scores": { "surface": 9, "corners": 9, "centering": 9, "edges": 9 },
  "centering_ratio": { "left_right": "55/45", "top_bottom": "50/50" },
  "defects": [ { "type": "corner whitening", "location": "bottom-right corner", "x": 0.95, "y": 0.96, "severity": "orange" } ],
  "primary_failure_point": "the single issue most likely to cap the grade, or \\"None visible\\"",
  "notes": "one or two sentences"
}
If the photo is not a card, or is too blurry, dark or cropped to judge, set image_ok to false and explain in image_issue.`;

function extractJson(text: string) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON in model reply");
  return JSON.parse(text.slice(start, end + 1));
}

export async function POST(request: Request) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "Vision grading is not switched on yet: the ANTHROPIC_API_KEY setting is missing in Vercel." },
      { status: 503 }
    );
  }

  let image: string;
  try {
    ({ image } = await request.json());
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
  const match = /^data:(image\/(?:jpeg|png|webp|gif));base64,(.+)$/.exec(image || "");
  if (!match) return NextResponse.json({ error: "Please upload a JPG or PNG photo." }, { status: 400 });

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1500,
      messages: [
        {
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: match[1], data: match[2] } },
            { type: "text", text: PROMPT },
          ],
        },
      ],
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    console.error("Anthropic API error", res.status, detail);
    return NextResponse.json({ error: `Vision service error (${res.status}). Try again in a moment.` }, { status: 502 });
  }

  const data = await res.json();
  const text = (data.content || []).filter((b: any) => b.type === "text").map((b: any) => b.text).join("");
  try {
    return NextResponse.json(extractJson(text));
  } catch {
    console.error("Unparseable model reply", text);
    return NextResponse.json({ error: "Could not read the analysis. Please try again." }, { status: 502 });
  }
}
