export default function VESOverlay() {
  const markers = [
    { top: "15%", left: "18%", label: "surface watch" },
    { top: "78%", left: "82%", label: "corner risk" }
  ];
  return (
    <>
      {markers.map((m, i) => (
        <div key={i} style={{ position:"absolute", top:m.top, left:m.left, transform:"translate(-50%,-50%)" }}>
          <div style={{ width:14, height:14, background:i===0?"#ff3b30":"#ff9500", borderRadius:"50%", boxShadow:"0 0 0 6px rgba(255,255,255,.15)" }} />
        </div>
      ))}
    </>
  );
}
