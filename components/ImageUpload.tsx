"use client";
import { useState } from "react";

export default function ImageUpload({ onUpload }: { onUpload: (url: string) => void }) {
  const [preview, setPreview] = useState<string | null>(null);
  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    onUpload(url);
  }
  return (
    <div>
      <label className="btn" style={{ width: "100%", justifyContent: "center", fontSize: 17, padding: "16px 18px", background: "var(--accent)" }}>
        {preview ? "Replace Card Photo" : "Upload or Take Card Photo"}
        <input type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
      </label>
      <p className="muted" style={{ fontSize: 13, marginTop: 10 }}>Front of card, flat, good light, fill the frame.</p>
    </div>
  );
}
