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
      <input className="input" type="file" accept="image/*" onChange={handleFile} />
      {preview && <img src={preview} alt="uploaded card preview" style={{ width: 280, marginTop: 14, borderRadius: 16 }} />}
    </div>
  );
}
