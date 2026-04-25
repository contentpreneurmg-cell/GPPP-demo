export default function ProbabilityBar({ label, value }: { label: string; value: number }) {
  return (
    <div style={{margin:"12px 0"}}>
      <div className="row" style={{borderBottom:0, padding:0}}><span>{label}</span><b>{(value*100).toFixed(1)}%</b></div>
      <div style={{height:10, background:"#252525", borderRadius:999, overflow:"hidden", marginTop:6}}>
        <div style={{height:"100%", width:`${value*100}%`, background:"var(--accent)"}} />
      </div>
    </div>
  );
}
