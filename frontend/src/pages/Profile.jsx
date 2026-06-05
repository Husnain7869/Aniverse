import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, StatCard, Skeleton } from "../components/ui";
import { getAchievements, getStats, updateProfile } from "../api/backend";
import useAuthStore from "../store/authStore";

const ACH_META = { first_anime:{icon:"🌟",color:"#f59e0b"}, "100_episodes":{icon:"📺",color:"#7c3aed"}, "50_completed":{icon:"🏆",color:"#10b981"}, binge_watcher:{icon:"🎬",color:"#f472b6"} };

export default function Profile() {
  const { user, updateUser } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ username:user?.username||"", bio:user?.bio||"" });
  const qc = useQueryClient();

  const { data: achievements=[] } = useQuery({ queryKey:["achievements"], queryFn:getAchievements });
  const { data: stats } = useQuery({ queryKey:["stats"], queryFn:getStats });
  const updMut = useMutation({ mutationFn:()=>updateProfile({username:form.username,bio:form.bio}), onSuccess:(d)=>{updateUser(d);setEditing(false);} });

  return (
    <div className="fade-up">
      <h1 style={{ fontSize:26,fontWeight:800,color:"var(--text-primary)",marginBottom:24 }}>My Profile</h1>

      {/* Profile header */}
      <Card style={{ padding:32,marginBottom:20,display:"flex",gap:28,alignItems:"flex-start" }}>
        <div style={{ flexShrink:0 }}>
          <div style={{ width:96,height:96,borderRadius:"50%",background:"linear-gradient(135deg,var(--purple-400),var(--purple-700))",display:"flex",alignItems:"center",justifyContent:"center",fontSize:42,border:"4px solid var(--purple-100)",overflow:"hidden" }}>
            {user?.avatar_url?<img src={user.avatar_url} style={{ width:"100%",height:"100%",objectFit:"cover" }}/>:"🧑"}
          </div>
          <div style={{ textAlign:"center",marginTop:8,fontSize:12,fontWeight:700,color:"var(--purple-600)",background:"var(--purple-100)",padding:"3px 12px",borderRadius:99 }}>Level {user?.level||1}</div>
        </div>
        <div style={{ flex:1 }}>
          {editing ? (
            <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
              {[["Username",form.username,"username"],["Bio",form.bio,"bio"]].map(([label,val,key])=>(
                <div key={key}>
                  <label style={{ fontSize:11,fontWeight:700,color:"var(--text-muted)",display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:.5 }}>{label}</label>
                  {key==="bio"
                    ? <textarea value={val} onChange={e=>setForm({...form,[key]:e.target.value})} rows={3} style={{ width:"100%",background:"var(--surface2)",border:"1.5px solid var(--border)",borderRadius:10,padding:"10px 14px",fontSize:13,color:"var(--text-primary)",outline:"none",resize:"vertical" }}/>
                    : <input value={val} onChange={e=>setForm({...form,[key]:e.target.value})} style={{ width:"100%",background:"var(--surface2)",border:"1.5px solid var(--border)",borderRadius:10,padding:"10px 14px",fontSize:13,color:"var(--text-primary)",outline:"none" }}/>
                  }
                </div>
              ))}
              <div style={{ display:"flex",gap:10 }}>
                <button className="btn-primary" onClick={()=>updMut.mutate()} disabled={updMut.isPending}>{updMut.isPending?"Saving…":"Save Changes"}</button>
                <button className="btn-ghost" onClick={()=>setEditing(false)}>Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:6 }}>
                <h2 style={{ fontSize:22,fontWeight:800,color:"var(--text-primary)" }}>{user?.username||"User"}</h2>
                <button className="btn-ghost" onClick={()=>setEditing(true)} style={{ padding:"6px 16px",fontSize:12 }}>✎ Edit Profile</button>
              </div>
              <div style={{ fontSize:13,color:"var(--text-muted)",marginBottom:10 }}>{user?.email}</div>
              <div style={{ fontSize:14,color:"var(--text-secondary)",lineHeight:1.6 }}>{user?.bio||"No bio yet."}</div>
            </>
          )}
        </div>
      </Card>

      {/* Stats */}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:14,marginBottom:24 }}>
        {stats ? [
          { icon:"✓",  label:"Completed",      value:stats.completed,          color:"#10b981" },
          { icon:"▶",  label:"Watching",        value:stats.watching,           color:"#7c3aed" },
          { icon:"📺", label:"Episodes Watched",value:stats.total_episodes,     color:"#3b82f6" },
          { icon:"⭐", label:"Mean Score",      value:stats.mean_score?.toFixed(1)||"—", color:"#f59e0b" },
        ].map(s=><StatCard key={s.label} {...s}/>) : [...Array(4)].map((_,i)=><Skeleton key={i} height={90}/>)}
      </div>

      {/* Achievements */}
      <Card style={{ padding:24 }}>
        <div style={{ fontSize:18,fontWeight:800,color:"var(--text-primary)",marginBottom:20 }}>Achievements</div>
        {achievements.length===0 ? (
          <div style={{ textAlign:"center",padding:"30px 0",color:"var(--text-muted)" }}>
            <div style={{ fontSize:48,marginBottom:12 }}>🔒</div>
            <div style={{ fontSize:14 }}>Watch anime to unlock achievements!</div>
          </div>
        ) : (
          <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:14 }}>
            {achievements.map((a,i)=>{
              const m=ACH_META[a.badge]||{icon:"🏅",color:"#7c3aed"};
              return (
                <div key={i} style={{ background:`${m.color}0d`,border:`1px solid ${m.color}30`,borderRadius:14,padding:18,textAlign:"center" }}>
                  <div style={{ fontSize:36,marginBottom:8 }}>{m.icon}</div>
                  <div style={{ fontSize:13,fontWeight:800,color:"var(--text-primary)" }}>{a.title}</div>
                  <div style={{ fontSize:11,color:"var(--text-muted)",marginTop:4,lineHeight:1.4 }}>{a.description}</div>
                  <div style={{ fontSize:10,color:m.color,fontWeight:700,marginTop:8 }}>🗓 {new Date(a.unlocked_at).toLocaleDateString()}</div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
