"use client";
import VESOverlay from "./VESOverlay";

export default function CardViewer({ src }: { src: string }) {
  return (
    <div style={{ position: "relative", width: 280 }}>
      <img src={src} alt="card" style={{ width: 280, borderRadius: 16, border: "1px solid #2a2a2a" }} />
      <VESOverlay />
    </div>
  );
}
