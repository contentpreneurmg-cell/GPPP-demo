"use client";
import VESOverlay, { Marker } from "./VESOverlay";

export default function CardViewer({ src, markers = [] }: { src: string; markers?: Marker[] }) {
  return (
    <div style={{ position: "relative", width: "100%", maxWidth: 320, margin: "0 auto" }}>
      <img src={src} alt="card" style={{ width: "100%", display: "block", borderRadius: 16, border: "1px solid #2a2a2a" }} />
      <VESOverlay markers={markers} />
    </div>
  );
}
