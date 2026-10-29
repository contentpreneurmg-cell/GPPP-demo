"use client";

// Shrinks phone photos (often 5–12 MB) to a JPEG under ~1 MB so upload is fast
// and stays inside the server's request limit.
async function toResizedDataUrl(file: File, maxEdge = 1568): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = reject;
      el.src = url;
    });
    const scale = Math.min(1, maxEdge / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.naturalWidth * scale);
    canvas.height = Math.round(img.naturalHeight * scale);
    canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.85);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export default function ImageUpload({
  onUpload,
  hasImage,
  busy,
}: {
  onUpload: (dataUrl: string) => void;
  hasImage?: boolean;
  busy?: boolean;
}) {
  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    onUpload(await toResizedDataUrl(file));
  }
  return (
    <div>
      <label
        className="btn"
        style={{
          width: "100%",
          justifyContent: "center",
          fontSize: 17,
          padding: "16px 18px",
          background: "var(--accent)",
          opacity: busy ? 0.6 : 1,
          pointerEvents: busy ? "none" : "auto",
        }}
      >
        {busy ? "Analyzing…" : hasImage ? "Analyze Another Card" : "Upload or Take Card Photo"}
        <input type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
      </label>
      <p className="muted" style={{ fontSize: 13, marginTop: 10 }}>Front of card, flat, good light, fill the frame.</p>
    </div>
  );
}
