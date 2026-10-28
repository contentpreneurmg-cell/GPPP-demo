"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import ImageUpload from "@/components/ImageUpload";
import CardViewer from "@/components/CardViewer";
import ProbabilityBar from "@/components/ProbabilityBar";
import { getProbabilities, predictedGrade } from "@/lib/gpppEngine";
import { calculateEV } from "@/lib/evEngine";
import { getConfidence, confidenceScore } from "@/lib/confidenceEngine";

export default function AnalyzePage() {
  const [image, setImage] = useState<string | null>(null);
  const [prices, setPrices] = useState<any>(null);
  useEffect(() => { fetch("/api/comps").then(r => r.json()).then(setPrices); }, []);

  const defects = { surface: true, edges: false, centering: true, corners: false };
  const prob = getProbabilities(defects);
  const cost = 30;
  const ev = prices ? calculateEV(prob, prices, cost) : null;

  return (
    <main>
      <div className="shell">
        <div className="nav"><span>02 / Analyze</span><span>VES + EV engine</span></div>
        <div className="grid">
          <section className="panel" style={{gridColumn:"span 5"}}>
            <div className="kicker">Image ingestion</div>
            <h2>Upload Card</h2>
            <ImageUpload onUpload={setImage} />
            {image && <div style={{marginTop:18}}><CardViewer src={image} /></div>}
          </section>
          <section className="panel" style={{gridColumn:"span 7"}}>
            <div className="kicker">GPPP projection</div>
            <h2>Probability + Financial Decision Layer</h2>
            <ProbabilityBar label="PSA 10" value={prob.psa10} />
            <ProbabilityBar label="PSA 9" value={prob.psa9} />
            <ProbabilityBar label="PSA 8" value={prob.psa8} />
            <div className="grid" style={{marginTop:18}}>
              <div className="panel" style={{gridColumn:"span 4"}}><div className="muted">Predicted</div><div className="metric">PSA {predictedGrade(prob)}</div></div>
              <div className="panel" style={{gridColumn:"span 4"}}><div className="muted">Confidence</div><div className="metric">{getConfidence(prob)}</div><span className="badge">{confidenceScore(prob)}/100</span></div>
              <div className="panel" style={{gridColumn:"span 4"}}><div className="muted">Net EV</div><div className="metric">{ev ? `$${ev.net.toFixed(2)}` : "..."}</div></div>
            </div>
            <Link href="/submit" className="btn">Submit Decision</Link>
          </section>
        </div>
      </div>
    </main>
  );
}
