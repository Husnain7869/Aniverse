export function ProgressBar({ pct = 0, color = "var(--purple-600)", height = 5 }) {
  return (
    <div style={{ background:"var(--purple-100)", borderRadius:99, height, width:"100%", overflow:"hidden" }}>
      <div style={{ height:"100%", width:`${Math.min(pct,100)}%`, background:`linear-gradient(90deg,${color},var(--purple-500))`, borderRadius:99, transition:"width .5s ease" }} />
    </div>
  );
}

export function StatusBadge({ status }) {
  const MAP = {
    completed:     { bg:"#d1fae5", color:"#065f46", label:"Completed"     },
    watching:      { bg:"#ede9fe", color:"#5b21b6", label:"Watching"      },
    plan_to_watch: { bg:"#dbeafe", color:"#1e40af", label:"Plan to Watch" },
    on_hold:       { bg:"#fef3c7", color:"#92400e", label:"On Hold"       },
    dropped:       { bg:"#fee2e2", color:"#991b1b", label:"Dropped"       },
  };
  const k = status?.toLowerCase().replace(/ /g,"_");
  const s = MAP[k] || MAP.watching;
  const label = MAP[k]?.label || status;
  return (
    <span style={{ display:"inline-flex", alignItems:"center", padding:"3px 10px", borderRadius:99, fontSize:11, fontWeight:700, background:s.bg, color:s.color }}>
      {label}
    </span>
  );
}

export function Card({ children, style={}, onClick }) {
  return (
    <div className="card" style={{ transition:"box-shadow .2s, transform .2s", ...style }}
      onClick={onClick}
      onMouseEnter={e=>{ if(onClick){e.currentTarget.style.boxShadow="var(--shadow-md)";e.currentTarget.style.transform="translateY(-1px)";} }}
      onMouseLeave={e=>{ e.currentTarget.style.boxShadow="var(--shadow-card)";e.currentTarget.style.transform="translateY(0)"; }}>
      {children}
    </div>
  );
}

export function Skeleton({ width="100%", height=20, radius=10, style={} }) {
  return <div className="skeleton" style={{ width, height, borderRadius:radius, ...style }} />;
}

export function StatCard({ icon, label, value, sub, color="#7c3aed" }) {
  return (
    <Card style={{ padding:"20px 22px", display:"flex", alignItems:"center", gap:16 }}>
      <div style={{ width:48, height:48, borderRadius:14, background:`${color}18`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize:12, color:"var(--text-muted)", fontWeight:600, marginBottom:2 }}>{label}</div>
        <div style={{ fontSize:26, fontWeight:800, color:"var(--text-primary)", lineHeight:1 }}>{value}</div>
        {sub && <div style={{ fontSize:11, color:"var(--green)", fontWeight:600, marginTop:3 }}>{sub}</div>}
      </div>
    </Card>
  );
}

export function SectionHeader({ title, icon, action, actionLabel="View All" }) {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18 }}>
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        {icon && <span style={{ fontSize:18 }}>{icon}</span>}
        <span style={{ fontSize:18, fontWeight:800, color:"var(--text-primary)" }}>{title}</span>
      </div>
      {action && (
        <button onClick={action} style={{ fontSize:13, color:"var(--purple-600)", background:"none", border:"none", fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:4 }}>
          {actionLabel} →
        </button>
      )}
    </div>
  );
}

export function Badge({ children, color="var(--purple-600)" }) {
  return (
    <span style={{ padding:"2px 10px", borderRadius:99, background:`${color}15`, color, fontSize:11, fontWeight:700, display:"inline-block" }}>
      {children}
    </span>
  );
}

export function EmptyState({ icon, title, desc, action }) {
  return (
    <div style={{ textAlign:"center", padding:"60px 20px" }}>
      <div style={{ fontSize:56, marginBottom:16 }}>{icon}</div>
      <div style={{ fontSize:18, fontWeight:800, color:"var(--text-primary)", marginBottom:8 }}>{title}</div>
      <div style={{ fontSize:14, color:"var(--text-muted)", marginBottom:action?20:0 }}>{desc}</div>
      {action}
    </div>
  );
}
