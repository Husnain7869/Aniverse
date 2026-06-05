import { useQuery } from "@tanstack/react-query";
import { Card, Skeleton } from "../components/ui";
import { getStats } from "../api/backend";

export default function Stats() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ["stats"],
    queryFn: getStats,
    refetchOnWindowFocus: true,
  });

  if (isLoading) return (
    <div className="fade-up">
      <div style={{ marginBottom:28 }}><Skeleton width={300} height={36} style={{ marginBottom:8 }}/><Skeleton width={220} height={20}/></div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:16, marginBottom:28 }}>
        {[...Array(5)].map((_,i)=><Skeleton key={i} height={90}/>)}
      </div>
      <Skeleton height={280} style={{ marginBottom:20 }}/><Skeleton height={240}/>
    </div>
  );

  if (error) return (
    <div style={{ textAlign:"center", padding:"60px 0" }}>
      <div style={{ fontSize:48, marginBottom:12 }}>⚠️</div>
      <div style={{ fontSize:16, color:"var(--text-muted)" }}>Could not load stats. Make sure the backend is running.</div>
    </div>
  );

  // All data is real — derived from stats_service.py
  const totalStatus = stats.watching + stats.completed + stats.plan_to_watch + stats.on_hold + stats.dropped;
  const statusList = [
    { label:"Watching",      val:stats.watching,       color:"#7c3aed", pct: totalStatus ? Math.round(stats.watching/totalStatus*100) : 0 },
    { label:"Completed",     val:stats.completed,      color:"#10b981", pct: totalStatus ? Math.round(stats.completed/totalStatus*100) : 0 },
    { label:"Plan to Watch", val:stats.plan_to_watch,  color:"#3b82f6", pct: totalStatus ? Math.round(stats.plan_to_watch/totalStatus*100) : 0 },
    { label:"On Hold",       val:stats.on_hold,        color:"#f59e0b", pct: totalStatus ? Math.round(stats.on_hold/totalStatus*100) : 0 },
    { label:"Dropped",       val:stats.dropped,        color:"#ef4444", pct: totalStatus ? Math.round(stats.dropped/totalStatus*100) : 0 },
  ];

  // Monthly activity from DB (last 12 months)
  const activity = stats.monthly_activity || [];
  const maxEps = Math.max(...activity.map(a => a.episodes), 1);
  // Ensure we always show 12 month labels
  const last12 = getLast12Months();
  const actMap = Object.fromEntries(activity.map(a => [a.month, a]));

  // Score distribution from real user ratings
  const scoreDist = stats.score_distribution || [];
  const maxScore = Math.max(...scoreDist.map(s => s.count), 1);

  // Top genres from real watch history
  const topGenres = stats.top_genres || [];
  const maxGenrePct = topGenres[0]?.percentage || 1;

  return (
    <div className="fade-up">
      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontSize:26, fontWeight:800, color:"var(--text-primary)", marginBottom:4 }}>Your Anime Journey ✦</h1>
        <p style={{ color:"var(--text-muted)", fontSize:14 }}>Every episode you watched, every story you lived.</p>
      </div>

      {/* Big stat cards — all real data */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(190px,1fr))", gap:16, marginBottom:28 }}>
        {[
          { icon:"▶",  label:"Hours Watched",    value:`${stats.total_hours_watched}h`,              color:"#7c3aed" },
          { icon:"📅", label:"Episodes Watched", value:stats.total_episodes_watched.toLocaleString(), color:"#3b82f6" },
          { icon:"✓",  label:"Anime Completed",  value:stats.completed,                               color:"#10b981" },
          { icon:"⭐", label:"Average Score",    value: stats.mean_score ? `${stats.mean_score}/10` : "—", color:"#f59e0b" },
          { icon:"🔥", label:"Day Streak",       value:`${stats.current_streak_days} days`,           color:"#ef4444" },
        ].map(s => (
          <Card key={s.label} style={{ padding:"20px 22px", display:"flex", alignItems:"center", gap:16 }}>
            <div style={{ width:48,height:48,borderRadius:14,background:`${s.color}18`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0 }}>{s.icon}</div>
            <div>
              <div style={{ fontSize:11,color:"var(--text-muted)",fontWeight:700,marginBottom:2,textTransform:"uppercase",letterSpacing:.5 }}>{s.label}</div>
              <div style={{ fontSize:26,fontWeight:800,color:"var(--text-primary)",lineHeight:1 }}>{s.value}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 320px", gap:20, marginBottom:20 }}>
        {/* Monthly Activity — from WatchActivity table */}
        <Card style={{ padding:24 }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ fontSize:18 }}>📈</span>
              <span style={{ fontSize:16,fontWeight:800,color:"var(--text-primary)" }}>Watching Activity</span>
            </div>
            <span style={{ fontSize:11,color:"var(--text-muted)" }}>Last 12 months</span>
          </div>

          {activity.length === 0 ? (
            <div style={{ height:150, display:"flex", alignItems:"center", justifyContent:"center", color:"var(--text-muted)", fontSize:13 }}>
              No activity yet — start watching anime to see your chart!
            </div>
          ) : (
            <div style={{ position:"relative", height:190 }}>
              {/* Y axis labels */}
              <div style={{ position:"absolute", left:0, top:0, bottom:30, display:"flex", flexDirection:"column", justifyContent:"space-between" }}>
                {[maxEps, Math.round(maxEps*.66), Math.round(maxEps*.33), 0].map(v=>(
                  <span key={v} style={{ fontSize:10,color:"var(--text-muted)",width:28,textAlign:"right" }}>{v}</span>
                ))}
              </div>
              <svg style={{ position:"absolute",left:36,top:0,width:"calc(100% - 36px)",height:160 }} viewBox="0 0 520 160" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="aGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.2"/>
                    <stop offset="100%" stopColor="#7c3aed" stopOpacity="0"/>
                  </linearGradient>
                </defs>
                {[0,53,107,160].map(y=><line key={y} x1="0" y1={y} x2="520" y2={y} stroke="#f0ecff" strokeWidth="1"/>)}
                {last12.length > 0 && (() => {
                  const pts = last12.map((m,i) => {
                    const v = actMap[m]?.episodes || 0;
                    return `${i*47},${160-(v/maxEps)*140}`;
                  });
                  return <>
                    <path d={`M${pts[0]} ${pts.slice(1).map(p=>`L${p}`).join(" ")} L${(last12.length-1)*47},160 L0,160 Z`} fill="url(#aGrad)"/>
                    <polyline points={pts.join(" ")} fill="none" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    {last12.map((m,i) => {
                      const v = actMap[m]?.episodes || 0;
                      return <circle key={m} cx={i*47} cy={160-(v/maxEps)*140} r="4" fill="#7c3aed" stroke="#fff" strokeWidth="2">
                        <title>{m}: {v} episodes</title>
                      </circle>;
                    })}
                  </>;
                })()}
              </svg>
              <div style={{ position:"absolute",bottom:0,left:36,right:0,display:"flex",justifyContent:"space-between" }}>
                {last12.map(m=><span key={m} style={{ fontSize:9,color:"var(--text-muted)",fontWeight:600 }}>{m.slice(5)}</span>)}
              </div>
            </div>
          )}
        </Card>

        {/* Anime by Status — donut from real counts */}
        <Card style={{ padding:24 }}>
          <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:20 }}>
            <span style={{ fontSize:18 }}>✦</span>
            <span style={{ fontSize:16,fontWeight:800,color:"var(--text-primary)" }}>Anime by Status</span>
          </div>
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:16 }}>
            <div style={{ position:"relative", width:120, height:120 }}>
              <svg viewBox="0 0 120 120" width="120" height="120">
                {totalStatus === 0 ? (
                  <circle cx="60" cy="60" r="46" fill="none" stroke="var(--border)" strokeWidth="16"/>
                ) : (() => {
                  const circ = 2 * Math.PI * 46;
                  let offset = 0;
                  return statusList.map((s, i) => {
                    const dash = (s.pct / 100) * circ;
                    const el = <circle key={i} cx="60" cy="60" r="46" fill="none" stroke={s.color} strokeWidth="16"
                      strokeDasharray={`${dash} ${circ - dash}`} strokeDashoffset={-offset} transform="rotate(-90 60 60)"/>;
                    offset += dash;
                    return el;
                  });
                })()}
                <text x="60" y="56" textAnchor="middle" fontSize="18" fontWeight="800" fill="var(--text-primary)" fontFamily="Nunito">{totalStatus}</text>
                <text x="60" y="70" textAnchor="middle" fontSize="9" fill="var(--text-muted)" fontFamily="Nunito">Total</text>
              </svg>
            </div>
            <div style={{ width:"100%" }}>
              {statusList.map(s=>(
                <div key={s.label} style={{ display:"flex",alignItems:"center",gap:8,marginBottom:7 }}>
                  <div style={{ width:10,height:10,borderRadius:"50%",background:s.color,flexShrink:0 }}/>
                  <span style={{ fontSize:12,color:"var(--text-secondary)",flex:1,fontWeight:600 }}>{s.label}</span>
                  <span style={{ fontSize:12,fontWeight:800,color:"var(--text-primary)" }}>{s.val}</span>
                  <span style={{ fontSize:11,color:"var(--text-muted)" }}>({s.pct}%)</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Bottom row */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:20 }}>
        {/* Top Genres — from genre breakdown in stats */}
        <Card style={{ padding:24 }}>
          <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:20 }}>
            <span style={{ fontSize:18 }}>✦</span>
            <span style={{ fontSize:16,fontWeight:800,color:"var(--text-primary)" }}>Top Genres</span>
          </div>
          {topGenres.length === 0 ? (
            <div style={{ color:"var(--text-muted)", fontSize:13, textAlign:"center", padding:"20px 0" }}>Add anime to your list to see your genre breakdown</div>
          ) : topGenres.slice(0,5).map(g=>(
            <div key={g.genre} style={{ marginBottom:12 }}>
              <div style={{ display:"flex",justifyContent:"space-between",fontSize:13,fontWeight:600,color:"var(--text-secondary)",marginBottom:5 }}>
                <span>{g.genre}</span><span style={{ color:"var(--purple-600)" }}>{g.percentage}%</span>
              </div>
              <div style={{ background:"var(--purple-100)",borderRadius:99,height:6,overflow:"hidden" }}>
                <div style={{ height:"100%",width:`${g.percentage/maxGenrePct*100}%`,background:"linear-gradient(90deg,var(--purple-600),var(--purple-400))",borderRadius:99 }}/>
              </div>
            </div>
          ))}
        </Card>

        {/* Score Distribution — from real user ratings */}
        <Card style={{ padding:24 }}>
          <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:20 }}>
            <span style={{ fontSize:18 }}>📊</span>
            <span style={{ fontSize:16,fontWeight:800,color:"var(--text-primary)" }}>Score Distribution</span>
          </div>
          {scoreDist.every(s => s.count === 0) ? (
            <div style={{ color:"var(--text-muted)", fontSize:13, textAlign:"center", padding:"20px 0" }}>Rate anime to see your score distribution</div>
          ) : (
            <div style={{ display:"flex", alignItems:"flex-end", gap:8, height:120 }}>
              {scoreDist.map(s=>(
                <div key={s.range} style={{ flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4 }}>
                  {s.count > 0 && <span style={{ fontSize:10,fontWeight:800,color:"var(--text-primary)" }}>{s.count}</span>}
                  <div style={{ width:"100%",background:s.count===maxScore?"var(--purple-600)":s.count>maxScore*.5?"var(--purple-400)":"var(--purple-200)",borderRadius:"4px 4px 0 0",
                    height:`${Math.max((s.count/maxScore)*90,s.count>0?6:2)}px`}}/>
                  <span style={{ fontSize:9,color:"var(--text-muted)",fontWeight:600 }}>{s.range}</span>
                </div>
              ))}
            </div>
          )}
          <div style={{ fontSize:10,color:"var(--text-muted)",textAlign:"center",marginTop:8 }}>Your Personal Scores</div>
        </Card>

        {/* Quote card */}
        <Card style={{ padding:0,overflow:"hidden",position:"relative",minHeight:180,background:"linear-gradient(135deg,#f5f0ff,#ede9fe,#ddd6fe)" }}>
          <div style={{ position:"absolute",bottom:-20,right:-10,fontSize:120,opacity:.12 }}>🌸</div>
          <div style={{ position:"relative",zIndex:1,padding:28 }}>
            <div style={{ fontSize:32,color:"var(--purple-400)",marginBottom:12,lineHeight:1 }}>"</div>
            <p style={{ fontSize:16,fontWeight:700,color:"#3b0764",lineHeight:1.6,marginBottom:14 }}>
              The more anime you watch, the more stories live in you.
            </p>
            <span style={{ fontSize:12,color:"var(--purple-500)",fontWeight:700 }}>Keep discovering.</span>
          </div>
        </Card>
      </div>
    </div>
  );
}

function getLast12Months() {
  const months = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`);
  }
  return months;
}
