import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "../components/ui";
import { getRecommendations } from "../api/backend";
import { getStats } from "../api/backend";
import useAuthStore from "../store/authStore";
import { useIsMobile } from "../hooks/useIsMobile";

const CHIPS = [
  "Recommend something based on my taste",
  "Dark psychological anime under 24 episodes",
  "Hidden gems I probably haven't seen",
  "Best anime similar to what I've completed",
  "What should I watch next?",
];

const INIT = [{
  role: "assistant",
  text: "Hey! 👋 I'm Shiori — your AI anime companion.\n\nI have full access to your watch history, ratings, and taste profile. Every recommendation I make is personalized to you.\n\nWhat are you in the mood for?",
}];

export default function AIRecommend() {
  const isMobile = useIsMobile();
  const [showSidebar, setShowSidebar] = useState(false); // mobile sidebar toggle
  const [messages, setMessages] = useState(INIT);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const { user } = useAuthStore();

  // Load real stats to show taste profile in sidebar
  const { data: stats } = useQuery({ queryKey:["stats"], queryFn:getStats });

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages, loading]);

  const send = async (text) => {
    if (!text.trim() || loading) return;
    const userMsg = { role:"user", text };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    // Build conversation history for the API (exclude init message)
    const history = messages
      .filter(m => m.role !== "assistant" || messages.indexOf(m) > 0)
      .map(m => ({ role: m.role === "user" ? "user" : "assistant", content: m.text }));

    try {
      const data = await getRecommendations(text, history);
      setMessages(prev => [...prev, { role:"assistant", text: data.response }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role:"assistant",
        text: "⚠️ Couldn't connect to the backend. Make sure the API server is running on port 8000.",
      }]);
    }
    setLoading(false);
  };

  const topGenres = stats?.top_genres?.slice(0, 5) || [];
  const maxGenrePct = topGenres[0]?.percentage || 1;

  return (
    <div className="fade-up" style={{ height: isMobile ? "auto" : "calc(100vh - 130px)", display: "flex", flexDirection: isMobile ? "column" : "row", gap: 20 }}>
      {/* Chat panel */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", background:"var(--surface)", border:"1px solid var(--border)", borderRadius:20, overflow:"hidden", boxShadow:"var(--shadow-card)", minHeight: isMobile ? "70vh" : "auto" }}>
        {/* Header */}
        <div style={{ padding:"18px 24px", borderBottom:"1px solid var(--border)", background:"linear-gradient(135deg,var(--purple-50),var(--surface))", display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:44,height:44,borderRadius:14,background:"linear-gradient(135deg,var(--purple-600),var(--purple-700))",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,boxShadow:"0 4px 12px rgba(124,58,237,0.3)" }}>✦</div>
          <div>
            <div style={{ fontSize:16,fontWeight:800,color:"var(--text-primary)" }}>Shiori AI</div>
            <div style={{ fontSize:12,color:"var(--text-muted)" }}>Personalized to your watch history</div>
          </div>
          <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:8 }}>
            {isMobile && (
              <button onClick={() => setShowSidebar(s => !s)} style={{
                fontSize:11, fontWeight:700, color:"var(--purple-600)",
                background:"var(--purple-50)", border:"1px solid var(--purple-200)",
                borderRadius:99, padding:"5px 12px", cursor:"pointer",
              }}>
                {showSidebar ? "Hide Stats" : "My Stats"}
              </button>
            )}
            {!isMobile && (
              <div style={{ fontSize:11, color:"var(--text-muted)", background:"var(--purple-50)", border:"1px solid var(--purple-200)", borderRadius:99, padding:"3px 10px" }}>
                {stats?.total_anime || 0} anime in context
              </div>
            )}
          </div>
        </div>

        {/* Suggestion chips */}
        <div style={{ padding:"12px 20px", borderBottom:"1px solid var(--border)", display:"flex", gap:7, flexWrap:"wrap" }}>
          {CHIPS.map(c=>(
            <button key={c} onClick={()=>send(c)} disabled={loading}
              style={{ padding:"5px 13px", borderRadius:99, fontSize:12, fontWeight:600, background:"var(--purple-50)", border:"1.5px solid var(--purple-200)", color:"var(--purple-700)", cursor:"pointer", transition:"all .15s" }}
              onMouseEnter={e=>{ e.currentTarget.style.background="var(--purple-100)"; }}
              onMouseLeave={e=>{ e.currentTarget.style.background="var(--purple-50)"; }}>
              {c}
            </button>
          ))}
        </div>

        {/* Messages */}
        <div style={{ flex:1, overflowY:"auto", padding:"20px 24px" }} className="no-scroll">
          {messages.map((m, i) => (
            <div key={i} style={{ display:"flex", marginBottom:18, justifyContent:m.role==="user"?"flex-end":"flex-start" }}>
              {m.role==="assistant" && (
                <div style={{ width:34,height:34,borderRadius:10,background:"linear-gradient(135deg,var(--purple-600),var(--purple-700))",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0,marginRight:10,alignSelf:"flex-end",boxShadow:"0 3px 10px rgba(124,58,237,0.25)" }}>✦</div>
              )}
              <div style={{
                maxWidth:"72%", padding:"13px 17px",
                borderRadius:m.role==="user"?"18px 18px 4px 18px":"4px 18px 18px 18px",
                background:m.role==="user"?"linear-gradient(135deg,var(--purple-600),var(--purple-700))":"var(--surface2)",
                color:m.role==="user"?"#fff":"var(--text-primary)",
                border:m.role==="assistant"?"1px solid var(--border)":"none",
                fontSize:13, lineHeight:1.75, fontWeight:500, whiteSpace:"pre-wrap",
                boxShadow:m.role==="user"?"0 4px 14px rgba(124,58,237,0.3)":"var(--shadow-sm)",
              }}>{m.text}</div>
            </div>
          ))}
          {loading && (
            <div style={{ display:"flex", marginBottom:18 }}>
              <div style={{ width:34,height:34,borderRadius:10,background:"linear-gradient(135deg,var(--purple-600),var(--purple-700))",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,marginRight:10,flexShrink:0 }}>✦</div>
              <div style={{ padding:"14px 18px",borderRadius:"4px 18px 18px 18px",background:"var(--surface2)",border:"1px solid var(--border)",display:"flex",gap:5,alignItems:"center" }}>
                {[0,1,2].map(i=>(
                  <div key={i} style={{ width:7,height:7,borderRadius:"50%",background:"var(--purple-500)",animation:`pulseDot .8s ${i*.2}s ease-in-out infinite` }}/>
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef}/>
        </div>

        {/* Input */}
        <div style={{ padding:"14px 20px", borderTop:"1px solid var(--border)" }}>
          <div style={{ display:"flex", gap:10, background:"var(--surface2)", border:"2px solid var(--border)", borderRadius:14, padding:"8px 8px 8px 18px" }}>
            <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send(input)}
              placeholder="Ask me anything — I know your watch history…" disabled={loading}
              style={{ flex:1,fontSize:13,color:"var(--text-primary)",background:"transparent",border:"none",outline:"none" }}/>
            <button onClick={()=>send(input)} disabled={loading||!input.trim()} className="btn-primary"
              style={{ padding:"9px 20px",opacity:(!input.trim()||loading)?0.5:1 }}>Send ↑</button>
          </div>
          <div style={{ fontSize:11,color:"var(--text-muted)",marginTop:6,paddingLeft:4 }}>
            💡 The AI knows your full watch history and will never recommend anime you've already seen.
          </div>
        </div>
      </div>

      {/* Right sidebar — hidden on mobile unless toggled */}
      {(!isMobile || showSidebar) && (
      <div style={{ width: isMobile ? "100%" : 260, display:"flex", flexDirection:"column", gap:16, overflowY:"auto" }} className="no-scroll">
        <Card style={{ padding:20 }}>
          <div style={{ fontSize:14,fontWeight:800,color:"var(--text-primary)",marginBottom:4 }}>Your Taste Profile</div>
          <div style={{ fontSize:11,color:"var(--text-muted)",marginBottom:14 }}>Based on {stats?.total_anime||0} anime in your list</div>
          {topGenres.length === 0 ? (
            <div style={{ fontSize:12,color:"var(--text-muted)",textAlign:"center",padding:"20px 0" }}>
              Add anime to build your taste profile
            </div>
          ) : topGenres.map(g=>(
            <div key={g.genre} style={{ marginBottom:10 }}>
              <div style={{ display:"flex",justifyContent:"space-between",fontSize:12,fontWeight:600,marginBottom:4 }}>
                <span style={{ color:"var(--text-secondary)" }}>{g.genre}</span>
                <span style={{ color:"var(--purple-600)" }}>{g.percentage}%</span>
              </div>
              <div style={{ background:"var(--surface2)",borderRadius:99,height:5,overflow:"hidden" }}>
                <div style={{ height:"100%",width:`${g.percentage/maxGenrePct*100}%`,background:"linear-gradient(90deg,var(--purple-600),var(--purple-400))",borderRadius:99 }}/>
              </div>
            </div>
          ))}
        </Card>

        {stats && (
          <Card style={{ padding:20 }}>
            <div style={{ fontSize:14,fontWeight:800,color:"var(--text-primary)",marginBottom:14 }}>Quick Stats</div>
            {[
              ["Completed",   stats.completed,    "#10b981"],
              ["Watching",    stats.watching,     "#7c3aed"],
              ["Mean Score",  stats.mean_score ? `${stats.mean_score}/10` : "—", "#f59e0b"],
              ["Episodes",    stats.total_episodes_watched, "#3b82f6"],
            ].map(([label, val, color]) => (
              <div key={label} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10 }}>
                <span style={{ fontSize:12,color:"var(--text-secondary)",fontWeight:600 }}>{label}</span>
                <span style={{ fontSize:14,fontWeight:800,color }}>{val}</span>
              </div>
            ))}
          </Card>
        )}

        <Card style={{ padding:20 }}>
          <div style={{ fontSize:14,fontWeight:800,color:"var(--text-primary)",marginBottom:14 }}>How It Works</div>
          {[
            ["📚","Your entire watch history is loaded into every request"],
            ["⭐","Your personal ratings shape the recommendations"],
            ["🚫","Already-seen anime are never recommended"],
            ["💬","Full conversation memory — I remember this chat"],
            ["🔄","Context updates when your list changes"],
          ].map(([icon,txt])=>(
            <div key={txt} style={{ display:"flex",gap:10,alignItems:"flex-start",marginBottom:10 }}>
              <div style={{ width:28,height:28,borderRadius:8,background:"var(--purple-100)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0 }}>{icon}</div>
              <span style={{ fontSize:11,color:"var(--text-secondary)",lineHeight:1.5,fontWeight:500,paddingTop:5 }}>{txt}</span>
            </div>
          ))}
        </Card>
      </div>
      )}
    </div>
  );
}
