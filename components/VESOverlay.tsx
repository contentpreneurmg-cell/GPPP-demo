export type Marker = { x: number; y: number; severity: string; type?: string };

const COLORS: Record<string, string> = { red: "#ff3b30", orange: "#ff9500", green: "#34c759" };

export default function VESOverlay({ markers = [] }: { markers?: Marker[] }) {
  return (
    <>
      {markers.map((m, i) => (
        <div
          key={i}
          title={m.type}
          style={{
            position: "absolute",
            top: `${Math.min(1, Math.max(0, m.y)) * 100}%`,
            left: `${Math.min(1, Math.max(0, m.x)) * 100}%`,
            transform: "translate(-50%,-50%)",
          }}
        >
          <div
            style={{
              width: 16,
              height: 16,
              background: COLORS[m.severity] || COLORS.orange,
              borderRadius: "50%",
              border: "2px solid #fff",
              boxShadow: "0 0 0 6px rgba(0,0,0,.35)",
            }}
          />
        </div>
      ))}
    </>
  );
}
