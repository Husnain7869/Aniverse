import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import AnimeCard from "../components/AnimeCard";
import { Skeleton, Card } from "../components/ui";
import { searchAnime, getTrending } from "../api/anilist";
import { useIsMobile } from "../hooks/useIsMobile";

const GENRES = ["Action","Adventure","Comedy","Drama","Fantasy","Horror","Mecha","Mystery","Romance","Sci-Fi","Slice of Life","Sports","Supernatural","Thriller","Psychological"];
const YEARS  = [2024,2023,2022,2021,2020,2019,2018,2017,2016];

const IcSearch = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
);

const IcSlidersH = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/>
    <circle cx="8" cy="6" r="2" fill="currentColor" stroke="none"/>
    <circle cx="16" cy="12" r="2" fill="currentColor" stroke="none"/>
    <circle cx="10" cy="18" r="2" fill="currentColor" stroke="none"/>
  </svg>
);

const IcTelescope = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--purple-300)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m10.065 12.493-6.18 1.318a.934.934 0 0 1-1.108-.702l-.537-2.15a1.07 1.07 0 0 1 .691-1.265l13.504-4.41"/>
    <path d="m13.56 11.747 4.332-.924"/><path d="m16 21-3.105-6.21"/>
    <path d="M16.485 5.94a2 2 0 0 1 1.455-2.425l1.09-.272a1 1 0 0 1 1.212.727l1.515 6.06a1 1 0 0 1-.727 1.213l-1.09.272a2 2 0 0 1-2.425-1.455z"/>
    <path d="m6.158 8.633 1.114 4.456"/><path d="m8 21 3.105-6.21"/>
    <circle cx="12" cy="21" r="1"/>
  </svg>
);

export default function Explore() {
  const isMobile = useIsMobile();
  const [params] = useSearchParams();
  const [search, setSearch] = useState(params.get("q") || "");
  const [query,  setQuery]  = useState(params.get("q") || "");
  const [genre,  setGenre]  = useState(null);
  const [year,   setYear]   = useState(null);
  const [status, setStatus] = useState(null);
  const [showFilters, setShowFilters] = useState(false); // mobile collapse

  useEffect(() => {
    const q = params.get("q") || "";
    setSearch(q); setQuery(q);
  }, [params]);

  const { data: results = [], isLoading } = useQuery({
    queryKey: ["explore", query, genre, year, status],
    queryFn: () => query || genre || year || status
      ? searchAnime(query || undefined, 1, genre, status, year)
      : getTrending(1),
  });

  const activeFilters = [genre, year, status].filter(Boolean).length;

  return (
    <div className="fade-up">

      {/* ── Header ── */}
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: isMobile ? 22 : 26, fontWeight: 800, color: "var(--text-primary)", marginBottom: 2 }}>
          Explore Anime
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Discover your next obsession</p>
      </div>

      {/* ── Search bar ── */}
      <div style={{ position: "relative", marginBottom: 14 }}>
        <span style={{
          position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)",
          color: "var(--text-muted)", display: "flex", pointerEvents: "none",
        }}>
          <IcSearch />
        </span>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === "Enter" && setQuery(search)}
          placeholder="Search by title, genre, studio…"
          style={{
            width: "100%", background: "var(--surface)", border: "2px solid var(--border)",
            borderRadius: 14, padding: isMobile ? "12px 100px 12px 44px" : "14px 110px 14px 46px",
            fontSize: isMobile ? 14 : 15, color: "var(--text-primary)", outline: "none",
            transition: "border-color .2s", boxSizing: "border-box",
          }}
          onFocus={e => e.target.style.borderColor = "var(--purple-400)"}
          onBlur={e => e.target.style.borderColor = "var(--border)"}
        />
        <button
          onClick={() => setQuery(search)}
          style={{
            position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
            padding: isMobile ? "7px 16px" : "9px 22px", fontSize: isMobile ? 13 : 14,
          }}
          className="btn-primary"
        >Search</button>
      </div>

      {/* ── Mobile: filter toggle button ── */}
      {isMobile && (
        <button
          onClick={() => setShowFilters(s => !s)}
          style={{
            display: "flex", alignItems: "center", gap: 7, marginBottom: 12,
            background: activeFilters > 0 ? "var(--purple-600)" : "var(--surface2)",
            color: activeFilters > 0 ? "#fff" : "var(--text-secondary)",
            border: activeFilters > 0 ? "none" : "1px solid var(--border)",
            borderRadius: 99, padding: "8px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer",
          }}
        >
          <IcSlidersH />
          Filters {activeFilters > 0 ? `(${activeFilters})` : ""}
          <span style={{ fontSize: 11 }}>{showFilters ? "▲" : "▼"}</span>
        </button>
      )}

      {/* ── Filters card ── */}
      {(!isMobile || showFilters) && (
        <Card style={{ padding: isMobile ? 14 : 20, marginBottom: 20 }}>
          <div style={{ display: "flex", gap: isMobile ? 12 : 20, flexDirection: isMobile ? "column" : "row", flexWrap: "wrap" }}>

            {/* Genre chips */}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: .5, marginBottom: 8 }}>Genre</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {GENRES.map(g => (
                  <button key={g} onClick={() => setGenre(genre === g ? null : g)} style={{
                    padding: "5px 12px", borderRadius: 99, fontSize: 12, fontWeight: 600,
                    cursor: "pointer", transition: "all .15s",
                    background: genre === g ? "var(--purple-600)" : "var(--surface2)",
                    color: genre === g ? "#fff" : "var(--text-secondary)",
                    border: genre === g ? "none" : "1px solid var(--border)",
                  }}>{g}</button>
                ))}
              </div>
            </div>

            {/* Year + Status — row on mobile too */}
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start", flexShrink: 0 }}>
              {[
                { label: "Year",   val: year,   set: v => setYear(v ? +v : null), opts: YEARS.map(y => ({ val: y, label: y })) },
                { label: "Status", val: status, set: setStatus, opts: [
                    { val: "RELEASING",        label: "Airing"    },
                    { val: "FINISHED",         label: "Finished"  },
                    { val: "NOT_YET_RELEASED", label: "Upcoming"  },
                  ]
                },
              ].map(f => (
                <div key={f.label}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: .5, marginBottom: 6 }}>{f.label}</div>
                  <select
                    value={f.val || ""}
                    onChange={e => f.set(e.target.value || null)}
                    style={{
                      background: "var(--surface2)", border: "1px solid var(--border)",
                      borderRadius: 10, padding: "8px 12px", fontSize: 13,
                      color: "var(--text-secondary)", cursor: "pointer", outline: "none",
                    }}
                  >
                    <option value="">Any</option>
                    {f.opts.map(o => <option key={o.val} value={o.val}>{o.label}</option>)}
                  </select>
                </div>
              ))}
            </div>

          </div>

          {/* Clear filters */}
          {activeFilters > 0 && (
            <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid var(--border)" }}>
              <button
                onClick={() => { setGenre(null); setYear(null); setStatus(null); }}
                style={{
                  fontSize: 12, fontWeight: 700, color: "var(--purple-600)",
                  background: "none", border: "none", cursor: "pointer", padding: 0,
                }}
              >
                ✕ Clear all filters
              </button>
            </div>
          )}
        </Card>
      )}

      {/* ── Results ── */}
      {isLoading ? (
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(auto-fill,minmax(175px,1fr))", gap: isMobile ? 10 : 18 }}>
          {[...Array(isMobile ? 6 : 15)].map((_, i) => <Skeleton key={i} height={isMobile ? 220 : 275} radius={14} />)}
        </div>
      ) : results.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}><IcTelescope /></div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)", marginBottom: 8 }}>No results found</div>
          <div style={{ color: "var(--text-muted)", fontSize: 14 }}>Try different keywords or remove some filters</div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(auto-fill,minmax(175px,1fr))", gap: isMobile ? 10 : 18 }}>
          {results.map(a => <AnimeCard key={a.id} anime={a} />)}
        </div>
      )}
    </div>
  );
}
