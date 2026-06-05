import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AnimeCard from "../components/AnimeCard";
import { Badge, Card, Skeleton } from "../components/ui";
import { getAnimeDetails } from "../api/anilist";
import { addToList, getLists, upsertRating, getRatingFor } from "../api/backend";

const TABS = ["Overview","Characters","Staff","Related","Recommendations"];

function StarRating({ value, onChange, disabled }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display:"flex", gap:3 }}>
      {[...Array(10)].map((_,i)=>{
        const score = i + 1;
        return (
          <button key={score} disabled={disabled}
            onMouseEnter={()=>setHover(score)} onMouseLeave={()=>setHover(0)}
            onClick={()=>onChange(score)}
            style={{ background:"none", border:"none", cursor:"pointer", padding:1, fontSize:18,
              color:(hover||value) >= score ? "#f59e0b" : "var(--border)", transition:"color .1s" }}>
            ★
          </button>
        );
      })}
      {value && <span style={{ fontSize:12, color:"var(--text-muted)", marginLeft:6, alignSelf:"center" }}>{value}/10</span>}
    </div>
  );
}

export default function AnimeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState("Overview");
  const [status, setStatus] = useState("plan_to_watch");
  const qc = useQueryClient();

  const { data: anime, isLoading } = useQuery({ queryKey:["anime",id], queryFn:()=>getAnimeDetails(+id) });
  const { data: myList=[] } = useQuery({ queryKey:["list","all"], queryFn:()=>getLists() });
  const { data: myRating } = useQuery({ queryKey:["rating",id], queryFn:()=>getRatingFor(+id), retry:false });

  const inList = myList.some(e=>e.anilist_id===+id);

  const addMut = useMutation({
    mutationFn: () => addToList({
      anilist_id:  +id,
      title:       anime?.title?.romaji || anime?.title?.english || "",
      title_japanese: anime?.title?.native || "",
      cover_image: anime?.coverImage?.extraLarge || anime?.coverImage?.large || "",
      status,
      total_episodes: anime?.episodes || null,
      // Send genres and duration so stats are immediately accurate
      genres:      anime?.genres || [],
      avg_episode_duration: anime?.duration || 24,
    }),
    onSuccess: () => { qc.invalidateQueries(["list"]); qc.invalidateQueries(["stats"]); },
  });

  const rateMut = useMutation({
    mutationFn: (score) => upsertRating({ anilist_id: +id, score }),
    onSuccess: () => { qc.invalidateQueries(["rating",id]); qc.invalidateQueries(["stats"]); qc.invalidateQueries(["list"]); },
  });

  if (isLoading) return (
    <div className="fade-up">
      <Skeleton height={320} style={{ marginBottom:24,borderRadius:20 }}/>
      <Skeleton height={200}/>
    </div>
  );

  const title = anime?.title?.english || anime?.title?.romaji || "";
  const score = anime?.averageScore ? (anime.averageScore/10).toFixed(1) : "N/A";
  const studio = anime?.studios?.nodes?.find(s=>s.isAnimationStudio)?.name || anime?.studios?.nodes?.[0]?.name || "—";

  return (
    <div className="fade-up">
      {/* Banner */}
      <div style={{ borderRadius:20,overflow:"hidden",marginBottom:28,position:"relative",
        background:anime?.bannerImage?`url(${anime.bannerImage}) center/cover`:"linear-gradient(135deg,#ede9fe,#ddd6fe)",
        minHeight:300 }}>
        <div style={{ position:"absolute",inset:0,background:"linear-gradient(to right,rgba(248,247,255,0.97) 0%,rgba(248,247,255,0.88) 40%,rgba(248,247,255,0.1) 100%)"}}/>
        <div style={{ position:"relative",zIndex:1,padding:"36px 40px",display:"flex",gap:28,alignItems:"flex-end",minHeight:300 }}>
          <div style={{ width:140,height:200,borderRadius:14,overflow:"hidden",flexShrink:0,boxShadow:"var(--shadow-lg)",border:"3px solid rgba(255,255,255,0.8)" }}>
            {anime?.coverImage?.extraLarge && <img src={anime.coverImage.extraLarge} style={{ width:"100%",height:"100%",objectFit:"cover" }}/>}
          </div>
          <div style={{ flex:1 }}>
            {anime?.status && <div style={{ fontSize:11,fontWeight:700,color:"var(--purple-600)",textTransform:"uppercase",letterSpacing:1,marginBottom:6 }}>{anime.status.replace(/_/g," ")}</div>}
            <h1 style={{ fontSize:30,fontWeight:800,color:"var(--text-primary)",fontFamily:"'Playfair Display',serif",marginBottom:4,lineHeight:1.2 }}>{title}</h1>
            <div style={{ fontSize:14,color:"var(--text-muted)",marginBottom:14,fontStyle:"italic" }}>{anime?.title?.native}</div>
            <div style={{ display:"flex",gap:8,flexWrap:"wrap",marginBottom:16 }}>
              {anime?.genres?.slice(0,5).map(g=><Badge key={g}>{g}</Badge>)}
            </div>
            <div style={{ display:"flex",gap:24,marginBottom:16 }}>
              {[
                ["AniList Score", score],
                ["Episodes",      anime?.episodes||"?"],
                ["Duration",      anime?.duration?`${anime.duration}m`:"~24m"],
                ["Studio",        studio],
              ].map(([l,v])=>(
                <div key={l}>
                  <div style={{ fontSize:10,color:"var(--text-muted)",fontWeight:700,textTransform:"uppercase",letterSpacing:.5,marginBottom:2 }}>{l}</div>
                  <div style={{ fontSize:15,fontWeight:800,color:"var(--text-primary)" }}>{v}</div>
                </div>
              ))}
            </div>

            {/* Your personal rating */}
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:11,color:"var(--text-muted)",fontWeight:700,textTransform:"uppercase",letterSpacing:.5,marginBottom:6 }}>Your Rating</div>
              <StarRating value={myRating?.score||0} onChange={score=>rateMut.mutate(score)} disabled={rateMut.isPending}/>
            </div>

            <div style={{ display:"flex",gap:12,alignItems:"center" }}>
              {inList ? (
                <div style={{ padding:"10px 20px",background:"#d1fae5",border:"1px solid #6ee7b7",borderRadius:99,color:"#065f46",fontSize:13,fontWeight:700 }}>✓ In Your List</div>
              ) : (
                <>
                  <select value={status} onChange={e=>setStatus(e.target.value)}
                    style={{ background:"var(--surface)",border:"1.5px solid var(--border)",borderRadius:10,padding:"9px 14px",fontSize:13,color:"var(--text-secondary)",outline:"none",cursor:"pointer" }}>
                    {[["plan_to_watch","Plan to Watch"],["watching","Watching"],["completed","Completed"]].map(([v,l])=><option key={v} value={v}>{l}</option>)}
                  </select>
                  <button className="btn-primary" onClick={()=>addMut.mutate()} disabled={addMut.isPending}>
                    {addMut.isPending?"Adding…":"+ Add to List"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:"flex",gap:0,borderBottom:"2px solid var(--border)",marginBottom:24 }}>
        {TABS.map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{ padding:"11px 22px",background:"none",border:"none",
            borderBottom:tab===t?"2px solid var(--purple-600)":"2px solid transparent",marginBottom:-2,
            color:tab===t?"var(--purple-700)":"var(--text-muted)",fontWeight:tab===t?800:600,fontSize:14,cursor:"pointer" }}>{t}</button>
        ))}
      </div>

      {tab==="Overview" && (
        <Card style={{ padding:28,maxWidth:760 }}>
          <p style={{ fontSize:14,color:"var(--text-secondary)",lineHeight:1.9 }}>
            {anime?.description?.replace(/<[^>]+>/g,"")||"No description available."}
          </p>
        </Card>
      )}
      {tab==="Characters" && (
        <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:14 }}>
          {anime?.characters?.nodes?.map((c,i)=>(
            <Card key={i} style={{ padding:14,textAlign:"center" }}>
              <div style={{ width:65,height:65,borderRadius:"50%",overflow:"hidden",margin:"0 auto 10px",background:"var(--surface2)" }}>
                {c.image?.medium&&<img src={c.image.medium} style={{ width:"100%",height:"100%",objectFit:"cover" }}/>}
              </div>
              <div style={{ fontSize:12,fontWeight:700,color:"var(--text-primary)" }}>{c.name?.full}</div>
            </Card>
          ))}
        </div>
      )}
      {tab==="Staff" && (
        <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:14 }}>
          {anime?.staff?.nodes?.map((s,i)=>(
            <Card key={i} style={{ padding:14,textAlign:"center" }}>
              <div style={{ width:65,height:65,borderRadius:"50%",overflow:"hidden",margin:"0 auto 10px",background:"var(--surface2)" }}>
                {s.image?.medium&&<img src={s.image.medium} style={{ width:"100%",height:"100%",objectFit:"cover" }}/>}
              </div>
              <div style={{ fontSize:12,fontWeight:700,color:"var(--text-primary)" }}>{s.name?.full}</div>
              <div style={{ fontSize:10,color:"var(--purple-600)",fontWeight:600,marginTop:2 }}>{s.primaryOccupations?.[0]}</div>
            </Card>
          ))}
        </div>
      )}
      {tab==="Recommendations" && (
        <div style={{ display:"flex",gap:16,flexWrap:"wrap" }}>
          {anime?.recommendations?.nodes?.map((r,i)=>r.mediaRecommendation&&<AnimeCard key={i} anime={r.mediaRecommendation} size="sm"/>)}
        </div>
      )}
      {tab==="Related" && (
        <div style={{ display:"flex",gap:16,flexWrap:"wrap" }}>
          {anime?.relations?.nodes?.map((r,i)=>(
            <div key={i} style={{ textAlign:"center" }}>
              <AnimeCard anime={r} size="sm"/>
              <div style={{ fontSize:10,color:"var(--text-muted)",marginTop:6,fontWeight:600 }}>{r.format}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
