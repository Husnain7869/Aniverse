import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import AnimeCard from "../components/AnimeCard";
import { Skeleton, Card } from "../components/ui";
import { searchAnime, getTrending } from "../api/anilist";

const GENRES = ["Action","Adventure","Comedy","Drama","Fantasy","Horror","Mecha","Mystery","Romance","Sci-Fi","Slice of Life","Sports","Supernatural","Thriller","Psychological"];
const YEARS  = [2024,2023,2022,2021,2020,2019,2018,2017,2016];

export default function Explore() {
  const [params] = useSearchParams();
  const [search, setSearch] = useState(params.get("q")||"");
  const [query, setQuery]   = useState(params.get("q")||"");
  const [genre, setGenre]   = useState(null);
  const [year, setYear]     = useState(null);
  const [status, setStatus] = useState(null);

  useEffect(()=>{ const q=params.get("q")||""; setSearch(q); setQuery(q); },[params]);

  const { data: results=[], isLoading } = useQuery({
    queryKey:["explore",query,genre,year,status],
    queryFn:()=> query||genre||year||status ? searchAnime(query||undefined,1,genre,status,year) : getTrending(1),
  });

  return (
    <div className="fade-up">
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:26, fontWeight:800, color:"var(--text-primary)", marginBottom:4 }}>Explore Anime</h1>
        <p style={{ color:"var(--text-muted)", fontSize:14 }}>Discover your next obsession</p>
      </div>

      {/* Search */}
      <div style={{ position:"relative", marginBottom:20 }}>
        <span style={{ position:"absolute", left:18, top:"50%", transform:"translateY(-50%)", fontSize:18, color:"var(--text-muted)", pointerEvents:"none" }}>🔍</span>
        <input value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>e.key==="Enter"&&setQuery(search)}
          placeholder="Search by title, genre, studio…"
          style={{ width:"100%", background:"var(--surface)", border:"2px solid var(--border)", borderRadius:16, padding:"16px 20px 16px 52px", fontSize:15, color:"var(--text-primary)", outline:"none", transition:"border-color .2s", boxShadow:"var(--shadow-sm)" }}
          onFocus={e=>e.target.style.borderColor="var(--purple-400)"}
          onBlur={e=>e.target.style.borderColor="var(--border)"} />
        <button onClick={()=>setQuery(search)}
          style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", padding:"9px 22px" }}
          className="btn-primary">Search</button>
      </div>

      {/* Filters */}
      <Card style={{ padding:20, marginBottom:24 }}>
        <div style={{ display:"flex", gap:20, flexWrap:"wrap" }}>
          {/* Genre */}
          <div style={{ flex:1 }}>
            <div style={{ fontSize:11, fontWeight:700, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:.5, marginBottom:10 }}>Genre</div>
            <div style={{ display:"flex", gap:7, flexWrap:"wrap" }}>
              {GENRES.map(g=>(
                <button key={g} onClick={()=>setGenre(genre===g?null:g)} style={{
                  padding:"5px 13px", borderRadius:99, fontSize:12, fontWeight:600, cursor:"pointer", transition:"all .15s",
                  background: genre===g?"var(--purple-600)":"var(--surface2)",
                  color: genre===g?"#fff":"var(--text-secondary)",
                  border: genre===g?"none":"1px solid var(--border)",
                }}>{g}</button>
              ))}
            </div>
          </div>
          {/* Year + Status */}
          <div style={{ display:"flex", gap:16, alignItems:"flex-start" }}>
            {[
              { label:"Year", val:year, set:v=>setYear(v?+v:null), opts:YEARS.map(y=>({val:y,label:y})) },
              { label:"Status", val:status, set:setStatus, opts:[{val:"RELEASING",label:"Airing"},{val:"FINISHED",label:"Finished"},{val:"NOT_YET_RELEASED",label:"Upcoming"}] },
            ].map(f=>(
              <div key={f.label}>
                <div style={{ fontSize:11, fontWeight:700, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:.5, marginBottom:8 }}>{f.label}</div>
                <select value={f.val||""} onChange={e=>f.set(e.target.value||null)}
                  style={{ background:"var(--surface2)", border:"1px solid var(--border)", borderRadius:10, padding:"8px 14px", fontSize:13, color:"var(--text-secondary)", cursor:"pointer", outline:"none" }}>
                  <option value="">Any</option>
                  {f.opts.map(o=><option key={o.val} value={o.val}>{o.label}</option>)}
                </select>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Results */}
      {isLoading ? (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(195px,1fr))", gap:18 }}>
          {[...Array(15)].map((_,i)=><Skeleton key={i} height={275} radius={14} />)}
        </div>
      ) : results.length===0 ? (
        <div style={{ textAlign:"center", padding:"60px 0" }}>
          <div style={{ fontSize:52, marginBottom:16 }}>🔭</div>
          <div style={{ fontSize:18, fontWeight:800, color:"var(--text-primary)", marginBottom:8 }}>No results found</div>
          <div style={{ color:"var(--text-muted)" }}>Try different keywords or remove some filters</div>
        </div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(195px,1fr))", gap:18 }}>
          {results.map(a=><AnimeCard key={a.id} anime={a} />)}
        </div>
      )}
    </div>
  );
}
