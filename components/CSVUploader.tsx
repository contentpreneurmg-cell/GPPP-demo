"use client";
import { useState } from "react";

function parseCSV(text: string) {
  const lines = text.trim().split(/\r?\n/);
  const headers = lines[0].split(",").map(h => h.trim());
  return lines.slice(1).filter(Boolean).map(line => {
    const values = line.split(",").map(v => v.trim());
    const obj: any = {};
    headers.forEach((h, i) => (obj[h] = values[i] ?? ""));
    return obj;
  });
}

export default function CSVUploader({ onData }: { onData: (rows: any[]) => void }) {
  const [count, setCount] = useState(0);
  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const rows = parseCSV(text);
    setCount(rows.length);
    onData(rows);
  }
  return (
    <div>
      <input className="input" type="file" accept=".csv" onChange={handleFile} />
      <p className="muted">{count} PSA records loaded</p>
    </div>
  );
}
