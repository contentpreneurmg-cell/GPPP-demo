"use client";
import { useEffect, useState } from "react";
import ImageUpload from "@/components/ImageUpload";
import CardViewer from "@/components/CardViewer";
import ProbabilityBar from "@/components/ProbabilityBar";
import { compositeScore, scoreToProbabilities, predictedGrade, decision, Scores } from "@/lib/gpppEngine";
import { calculateEV } from "@/lib/evEngine";
import { getConfidence, confidenceScore } from "@/lib/confidenceEngine";

const SUBMISSION_COST = 29;
const DIMENSIONS: (keyof Scores)[] = ["surface", "corners", "centering", "edges"];
const SEVERITY_COLOR: Record<string, string> = { red: "#ff3b30", orange: "#ff9500", green: "#34c759" };

export default function AnalyzePage() {
  const [image, setImage] = useState<string | null>(null);
  const [prices, setPrices] = useState<any>(null);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/comps").then(r => r.json()).then(setPrices).catch(() => {});
  }, []);

  async function analyze(dataUrl: string) {
    setImage(dataUrl);
    setResult(null);
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/grade", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ image: dataUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed.");
      if (data.image_ok === false) throw new Error(data.image_issue || "Photo could not be graded. Try a clearer shot.");
      setResult(data);
    } catch (e: any) {
      setError(e.message || "Analysis failed.");
    } finally {
      setBusy(false);
    }
  }

  const scores: Scores | null = result?.scores ?? null;
  const prob = scores ? scoreToProbabilities(scores) : null;
  const ev = prob && prices ? calculateEV(prob, prices, SUBMISSION_COST) : null;
  const verdict = prob ? decision(prob, ev ? ev.net : null) : null;
  const markers = (result?.defects || []).filter((d: any) => typeof d.x === "number" && typeof d.y === "number");

  return (
    <main>
      <div className="shell">
        <div className="nav"><a href="https://cardprojector.com">← CardProjector</a><span>GPPP Grade Analysis</span></div>
        <div className="grid">
          <section className="panel" style={{ gridColumn: "span 5" }}>
            <div className="kicker">Step 1 · Photo</div>
            <h2>Upload Card</h2>
            <ImageUpload onUpload={analyze} hasImage={!!image} busy={busy} />
            {image && <div style={{ marginTop: 18 }}><CardViewer src={image} markers={markers} /></div>}
            {result?.card && <p style={{ marginTop: 14, fontWeight: 700 }}>{result.card}</p>}
          </section>

          <section className="panel" style={{ gridColumn: "span 7" }}>
            <div className="kicker">Step 2 · GPPP projection</div>
            <h2>Grade + Decision</h2>

            {!image && <p className="muted">Upload a card photo. Claude Vision scores surface, corners, centering and edges, then GPPP converts those scores into PSA grade odds, expected value, and a Submit / Hold / Pass call.</p>}
            {busy && <p className="muted">Claude Vision is inspecting the card. This takes about 10–20 seconds.</p>}
            {error && <p style={{ color: "#ff6b6b" }}>{error}</p>}

            {scores && prob && (
              <>
                <div className="grid" style={{ marginTop: 6 }}>
                  <div className="panel" style={{ gridColumn: "span 4" }}><div className="muted">GPPP score</div><div className="metric">{compositeScore(scores).toFixed(2)}</div></div>
                  <div className="panel" style={{ gridColumn: "span 4" }}><div className="muted">Predicted</div><div className="metric">PSA {predictedGrade(prob)}</div></div>
                  <div className="panel" style={{ gridColumn: "span 4" }}><div className="muted">Decision</div><div className="metric" style={{ color: verdict === "SUBMIT" ? "var(--accent)" : verdict === "PASS" ? "#ff6b6b" : "#ffb340" }}>{verdict}</div></div>
                </div>

                <h3 style={{ marginTop: 22 }}>Subgrades</h3>
                {DIMENSIONS.map(k => (
                  <div className="row" key={k}><span style={{ textTransform: "capitalize" }}>{k}</span><b>{Number(scores[k]).toFixed(1)}</b></div>
                ))}
                {result.centering_ratio && (
                  <p className="muted" style={{ fontSize: 13 }}>Centering L/R {result.centering_ratio.left_right} · T/B {result.centering_ratio.top_bottom}</p>
                )}

                <h3 style={{ marginTop: 22 }}>Grade odds</h3>
                <ProbabilityBar label="PSA 10" value={prob.psa10} />
                <ProbabilityBar label="PSA 9" value={prob.psa9} />
                <ProbabilityBar label="PSA 8 or lower" value={prob.psa8} />

                <div className="grid" style={{ marginTop: 18 }}>
                  <div className="panel" style={{ gridColumn: "span 6" }}><div className="muted">Confidence</div><div className="metric">{getConfidence(prob)}</div><span className="badge">{confidenceScore(prob)}/100</span></div>
                  <div className="panel" style={{ gridColumn: "span 6" }}><div className="muted">Net EV at ${SUBMISSION_COST}</div><div className="metric">{ev ? `${ev.net >= 0 ? "+" : "−"}$${Math.abs(ev.net).toFixed(2)}` : "…"}</div><span className="muted" style={{ fontSize: 12 }}>Sample comps</span></div>
                </div>

                <h3 style={{ marginTop: 22 }}>Primary failure point</h3>
                <p>{result.primary_failure_point}</p>

                {result.defects?.length > 0 && (
                  <>
                    <h3 style={{ marginTop: 22 }}>Visual evidence (VES)</h3>
                    {result.defects.map((d: any, i: number) => (
                      <div className="row" key={i}>
                        <span><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: SEVERITY_COLOR[d.severity] || SEVERITY_COLOR.orange, marginRight: 8 }} />{d.type}</span>
                        <span className="muted">{d.location}</span>
                      </div>
                    ))}
                  </>
                )}

                {result.notes && <p className="muted" style={{ marginTop: 16 }}>{result.notes}</p>}
                <p className="muted" style={{ fontSize: 12, marginTop: 16 }}>AI estimate from a single photo. Not a PSA grade.</p>
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
