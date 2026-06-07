import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getLists, updateEntry, deleteEntry } from "../api/backend";

// ── Icons (SVG, zero emojis) ─────────────────────────────────────────────────
const IPlay      = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>;
const ICheck     = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IBookmark  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>;
const IPause     = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>;
const IXCircle   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>;
const ILayers    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>;
const ISearch    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>;
const IPlus      = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>;
const IChevRight = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>;
const IDots      = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>;
const IStar      = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="#f59e0b" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>;
const ICalendar  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const ISparkle   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>;
const IEdit      = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const ITrash     = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>;

// ── Tab config ───────────────────────────────────────────────────────────────
const TABS = [
  { key: "all",           label: "All",           Icon: ILayers   },
  { key: "watching",      label: "Watching",      Icon: IPlay     },
  { key: "completed",     label: "Completed",     Icon: ICheck    },
  { key: "plan_to_watch", label: "Plan to Watch", Icon: IBookmark },
  { key: "on_hold",       label: "On Hold",       Icon: IPause    },
  { key: "dropped",       label: "Dropped",       Icon: IXCircle  },
];

// ── Stat card config ─────────────────────────────────────────────────────────
const STAT_CONFIG = [
  { key: "watching",      label: "Watching",      Icon: IPlay,     iconBg: "#ede9fe", iconColor: "#7c3aed", barColor: "#7c3aed" },
  { key: "completed",     label: "Completed",     Icon: ICheck,    iconBg: "#d1fae5", iconColor: "#059669", barColor: "#10b981" },
  { key: "plan_to_watch", label: "Plan to Watch", Icon: IBookmark, iconBg: "#fee2e2", iconColor: "#dc2626", barColor: "#ef4444" },
  { key: "on_hold",       label: "On Hold",       Icon: IPause,    iconBg: "#fef3c7", iconColor: "#d97706", barColor: "#f59e0b" },
  { key: "dropped",       label: "Dropped",       Icon: IXCircle,  iconBg: "#fee2e2", iconColor: "#dc2626", barColor: "#ef4444" },
  { key: "_total",        label: "Total Anime",   Icon: ILayers,   iconBg: "#ede9fe", iconColor: "#7c3aed", barColor: "#7c3aed" },
];

// ── Status badge ─────────────────────────────────────────────────────────────
const STATUS_STYLE = {
  watching:      { bg: "#ede9fe", color: "#6d28d9", label: "Watching"      },
  completed:     { bg: "#d1fae5", color: "#065f46", label: "Completed"     },
  plan_to_watch: { bg: "#fee2e2", color: "#991b1b", label: "Plan to Watch" },
  on_hold:       { bg: "#fef3c7", color: "#92400e", label: "On Hold"       },
  dropped:       { bg: "#fee2e2", color: "#991b1b", label: "Dropped"       },
};

function StatusPill({ status }) {
  const s = STATUS_STYLE[status] || STATUS_STYLE.watching;
  const IconMap = { watching: IPlay, completed: ICheck, plan_to_watch: IBookmark, on_hold: IPause, dropped: IXCircle };
  const Icon = IconMap[status] || IBookmark;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "4px 10px", borderRadius: 99,
      background: s.bg, color: s.color,
      fontSize: 11, fontWeight: 700,
    }}>
      <Icon /> {s.label}
    </span>
  );
}

// ── Anime Card ───────────────────────────────────────────────────────────────
function AnimeListCard({ entry, onNavigate, onDelete, onUpdate }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing]   = useState(false);
  const [prog, setProg]         = useState(entry.progress);
  const [status, setStatus]     = useState(entry.status);

  const total = entry.total_episodes || 13;
  const pct   = Math.min(100, Math.round((entry.progress / Math.max(total, 1)) * 100));
  const addedDate = entry.start_date ? new Date(entry.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Jun 2, 2026";

  const startEditing = () => {
    setProg(entry.progress);
    setStatus(entry.status);
    setEditing(true);
  };

  return (
    <div style={{
      background: "#fff",
      border: "1px solid #ede9fe",
      borderRadius: 18,
      overflow: "hidden",
      display: "flex",
      alignItems: "stretch",
      boxShadow: "0 2px 16px rgba(124,58,237,0.07)",
      transition: "box-shadow .2s, transform .2s",
      position: "relative",
    }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 6px 28px rgba(124,58,237,0.14)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 2px 16px rgba(124,58,237,0.07)"; e.currentTarget.style.transform = "none"; }}
    >
      {/* Bookmark icon top-left of image */}
      <div style={{ position: "relative", flexShrink: 0 }}>
        <div style={{
          width: 150, height: 200,
          background: "#e8e4f8",
          cursor: "pointer",
        }} onClick={onNavigate}>
          {entry.cover_image && (
            <img src={entry.cover_image} alt={entry.title}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          )}
        </div>
        {/* Bookmark overlay */}
        <div style={{
          position: "absolute", top: 10, left: 10,
          width: 28, height: 28, borderRadius: 7,
          background: "rgba(124,58,237,0.85)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#fff",
        }}>
          <IBookmark />
        </div>
      </div>

      {/* Left content */}
      <div style={{ flex: 1, padding: "20px 24px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        {/* Title row */}
        <div>
          <div style={{ cursor: "pointer" }} onClick={onNavigate}>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#1e1b4b", marginBottom: 3, letterSpacing: "-0.2px" }}>
              {entry.title}
            </div>
            {entry.title_japanese && (
              <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 10, fontWeight: 500 }}>
                {entry.title_japanese}
              </div>
            )}
          </div>
          <StatusPill status={entry.status} />
        </div>

        {/* Meta row */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 14 }}>
          {entry.year && (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#9ca3af", fontSize: 12, fontWeight: 500 }}>
                <ICalendar /> {entry.year}
              </div>
              <div style={{ width: 3, height: 3, borderRadius: "50%", background: "#d1d5db" }} />
            </>
          )}
          {entry.genres && (
            <div style={{ fontSize: 12, color: "#9ca3af", fontWeight: 500 }}>
              {Array.isArray(entry.genres) ? entry.genres.slice(0, 3).join(", ") : entry.genres}
            </div>
          )}
        </div>
      </div>

      {/* Divider */}
      <div style={{ width: 1, background: "#f3f0fb", alignSelf: "stretch", margin: "16px 0" }} />

      {/* Right panel */}
      <div style={{ width: 340, padding: "20px 24px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        {/* Episodes + progress */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 }}>Episodes</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
            {editing ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <select value={status} onChange={e => {
                    const nextStatus = e.target.value;
                    setStatus(nextStatus);
                    if (nextStatus === "completed") {
                      setProg(total);
                    }
                  }} style={{
                    background: "#f5f3ff", border: "1.5px solid #a78bfa", borderRadius: 8,
                    padding: "6px 10px", fontSize: 13, fontWeight: 600, color: "#1e1b4b",
                    outline: "none", cursor: "pointer", flex: 1, minWidth: 120
                  }}>
                    <option value="plan_to_watch">Plan to Watch</option>
                    <option value="watching">Watching</option>
                    <option value="completed">Completed</option>
                    <option value="on_hold">On Hold</option>
                    <option value="dropped">Dropped</option>
                  </select>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <input type="number" value={prog} onChange={e => {
                      const nextProg = +e.target.value;
                      setProg(nextProg);
                      if (nextProg >= total) {
                        setStatus("completed");
                      } else if (status === "completed" && nextProg < total) {
                        setStatus("watching");
                      }
                    }}
                      style={{ width: 56, background: "#f5f3ff", border: "1.5px solid #a78bfa", borderRadius: 8, padding: "4px 8px", fontSize: 16, fontWeight: 800, color: "#1e1b4b", outline: "none", textAlign: "center" }} />
                    <span style={{ fontSize: 12, color: "#9ca3af", fontWeight: 500 }}>/ {total}</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => { onUpdate({ progress: prog, status }); setEditing(false); }}
                    style={{ flex: 1, padding: "6px 12px", background: "linear-gradient(135deg,#9333ea,#7c3aed)", border: "none", borderRadius: 8, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", boxShadow: "0 2px 6px rgba(124,58,237,0.2)" }}>Save</button>
                  <button onClick={() => setEditing(false)}
                    style={{ padding: "6px 12px", background: "#f3f0fb", border: "none", borderRadius: 8, color: "#6b7280", fontSize: 12, cursor: "pointer" }}>Cancel</button>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "baseline", gap: 4, cursor: "pointer" }} onClick={startEditing}>
                <span style={{ fontSize: 26, fontWeight: 800, color: "#7c3aed", lineHeight: 1 }}>{entry.progress}</span>
                <span style={{ fontSize: 14, color: "#9ca3af", fontWeight: 500 }}>/ {total}</span>
              </div>
            )}
            {!editing && (
              <div style={{ flex: 1 }}>
                <div style={{ background: "#ede9fe", borderRadius: 99, height: 6, overflow: "hidden", marginBottom: 3 }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: "linear-gradient(90deg,#7c3aed,#a855f7)", borderRadius: 99, transition: "width .4s" }} />
                </div>
                <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600, textAlign: "right" }}>{pct}%</div>
              </div>
            )}
          </div>
        </div>

        {/* Added date + View Details */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 10, color: "#9ca3af", fontWeight: 600, marginBottom: 2 }}>Added on</div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#6b7280", fontSize: 12, fontWeight: 600 }}>
              <ICalendar /> {addedDate}
            </div>
          </div>
          <button onClick={onNavigate} style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            fontSize: 13, fontWeight: 700, color: "#7c3aed",
            background: "none", border: "none", cursor: "pointer",
          }}>
            View Details <IChevRight />
          </button>
        </div>
      </div>

      {/* Three-dot menu */}
      <div style={{ position: "absolute", top: 14, right: 14 }}>
        <button onClick={() => setMenuOpen(o => !o)} style={{
          width: 32, height: 32, borderRadius: 8, border: "none",
          background: menuOpen ? "#ede9fe" : "transparent",
          color: "#9ca3af", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <IDots />
        </button>
        {menuOpen && (
          <div style={{
            position: "absolute", right: 0, top: 36, zIndex: 50,
            background: "#fff", border: "1px solid #ede9fe", borderRadius: 12,
            boxShadow: "0 8px 32px rgba(124,58,237,0.14)", padding: 6, minWidth: 150,
          }}>
            {[
              { label: "Edit Progress", Icon: IEdit,  action: () => { startEditing(); setMenuOpen(false); }, color: "#6b7280" },
              { label: "View Details",  Icon: IChevRight, action: () => { onNavigate(); setMenuOpen(false); }, color: "#6b7280" },
              { label: "Remove",        Icon: ITrash, action: () => { onDelete(); setMenuOpen(false); }, color: "#ef4444" },
            ].map(({ label, Icon, action, color }) => (
              <div key={label} onClick={action} style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "9px 12px", borderRadius: 8,
                fontSize: 13, fontWeight: 600, color, cursor: "pointer",
              }}
                onMouseEnter={e => e.currentTarget.style.background = "#f5f3ff"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <Icon /> {label}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Empty state ──────────────────────────────────────────────────────────────
function EmptyListState({ onExplore }) {
  return (
    <div style={{
      background: "linear-gradient(135deg, #faf5ff 0%, #f3e8ff 50%, #ede9fe 100%)",
      border: "1px solid #e9d5ff", borderRadius: 20,
      padding: "48px 32px", textAlign: "center",
      display: "flex", flexDirection: "column", alignItems: "center", gap: 16,
    }}>
      {/* Decorative sparkles */}
      <div style={{ fontSize: 40, color: "#c4b5fd", marginBottom: 4 }}>
        <ISparkle />
      </div>
      <div style={{ fontSize: 20, fontWeight: 800, color: "#1e1b4b" }}>More anime to come!</div>
      <div style={{ fontSize: 14, color: "#9ca3af", maxWidth: 340 }}>
        Add more anime to your list and keep track of your journey.
      </div>
      <button onClick={onExplore} style={{
        display: "inline-flex", alignItems: "center", gap: 8,
        background: "linear-gradient(135deg,#9333ea,#7c3aed)",
        color: "#fff", border: "none", borderRadius: 99,
        padding: "11px 24px", fontSize: 14, fontWeight: 700,
        cursor: "pointer", boxShadow: "0 4px 14px rgba(124,58,237,0.35)",
        marginTop: 4,
      }}>
        <IPlus /> Add Anime
      </button>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function MyList() {
  const [tab, setTab]       = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort]     = useState("last_added");
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: list = [], isLoading } = useQuery({
    queryKey: ["list", tab],
    queryFn: () => getLists(tab === "all" ? null : tab),
  });

  const delMut = useMutation({
    mutationFn: deleteEntry,
    onSuccess: () => qc.invalidateQueries(["list"]),
  });
  const updMut = useMutation({
    mutationFn: ({ id, data }) => updateEntry(id, data),
    onSuccess: () => qc.invalidateQueries(["list"]),
  });

  const counts = list.reduce((a, e) => ({ ...a, [e.status]: (a[e.status] || 0) + 1 }), {});

  const filtered = list
    .filter(a => a.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === "title")    return a.title.localeCompare(b.title);
      if (sort === "score")    return (b.user_score || 0) - (a.user_score || 0);
      if (sort === "progress") return (b.progress || 0) - (a.progress || 0);
      return new Date(b.start_date || 0) - new Date(a.start_date || 0);
    });

  return (
    <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: 0 }}>

      {/* ── Hero header ── */}
      <div style={{
        position: "relative",
        borderRadius: 20,
        overflow: "hidden",
        background: "linear-gradient(135deg, #f5f0ff 0%, #ede9fe 60%, #ddd6fe 100%)",
        padding: "36px 36px 32px",
        marginBottom: 28,
        border: "1px solid #e9d5ff",
      }}>
        {/* Decorative bg art — faint anime lineart feel */}
        <div style={{
          position: "absolute", right: 0, top: 0, bottom: 0, width: "45%",
          background: "url('https://i.imgur.com/placeholder.png') right center/cover no-repeat",
          opacity: 0.07,
        }} />
        {/* Faint radial glow */}
        <div style={{
          position: "absolute", right: "10%", top: "50%", transform: "translateY(-50%)",
          width: 300, height: 300, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(167,139,250,0.25) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <div style={{ width: 3, height: 32, background: "linear-gradient(180deg,#9333ea,#7c3aed)", borderRadius: 99 }} />
              <h1 style={{ fontSize: 30, fontWeight: 800, color: "#1e1b4b", letterSpacing: "-0.3px" }}>
                My Anime List
              </h1>
              <ISparkle />
            </div>
            <p style={{ fontSize: 14, color: "#9ca3af", fontWeight: 500, marginLeft: 15 }}>
              Track every series, every episode, every memory.
            </p>
          </div>
          <button onClick={() => navigate("/explore")} style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "linear-gradient(135deg,#9333ea,#7c3aed)",
            color: "#fff", border: "none", borderRadius: 99,
            padding: "11px 22px", fontSize: 14, fontWeight: 700,
            cursor: "pointer", boxShadow: "0 4px 14px rgba(124,58,237,0.35)",
            flexShrink: 0,
          }}>
            <IPlus /> Add Anime
          </button>
        </div>

        {/* ── Stat cards ── */}
        <div style={{ display: "flex", gap: 12, marginTop: 24, flexWrap: "wrap", position: "relative", zIndex: 1 }}>
          {STAT_CONFIG.map(({ key, label, Icon, iconBg, iconColor, barColor }) => {
            const val = key === "_total" ? list.length : (counts[key] || 0);
            return (
              <div key={key} style={{
                flex: "1 1 130px",
                background: "rgba(255,255,255,0.85)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.9)",
                borderRadius: 16, padding: "14px 16px",
                boxShadow: "0 2px 12px rgba(124,58,237,0.07)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 10,
                    background: iconBg,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: iconColor, flexShrink: 0,
                  }}>
                    <Icon />
                  </div>
                  <span style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600 }}>{label}</span>
                </div>
                <div style={{ fontSize: 26, fontWeight: 800, color: "#1e1b4b", lineHeight: 1, marginBottom: 10 }}>{val}</div>
                <div style={{ height: 3, background: "#ede9fe", borderRadius: 99, overflow: "hidden" }}>
                  <div style={{ width: val > 0 ? "60%" : "0%", height: "100%", background: barColor, borderRadius: 99, transition: "width .5s" }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Filter tabs + sort + search ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {/* Pills */}
        <div style={{ display: "flex", gap: 6, flex: 1, flexWrap: "wrap" }}>
          {TABS.map(({ key, label, Icon }) => {
            const active = tab === key;
            return (
              <button key={key} onClick={() => setTab(key)} style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "7px 16px", borderRadius: 99,
                border: active ? "none" : "1px solid #ede9fe",
                background: active ? "#7c3aed" : "#fff",
                color: active ? "#fff" : "#6b7280",
                fontSize: 13, fontWeight: active ? 700 : 600,
                cursor: "pointer", boxShadow: active ? "0 3px 10px rgba(124,58,237,0.30)" : "0 1px 4px rgba(0,0,0,0.06)",
                transition: "all .15s",
              }}>
                <Icon /> {label}
              </button>
            );
          })}
        </div>

        {/* Sort */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 12, color: "#9ca3af", fontWeight: 600, whiteSpace: "nowrap" }}>Sort by</span>
          <select value={sort} onChange={e => setSort(e.target.value)} style={{
            background: "#fff", border: "1px solid #ede9fe", borderRadius: 10,
            padding: "7px 12px", fontSize: 13, fontWeight: 600, color: "#1e1b4b",
            outline: "none", cursor: "pointer",
          }}>
            <option value="last_added">Last Added</option>
            <option value="title">Title</option>
            <option value="score">Score</option>
            <option value="progress">Progress</option>
          </select>
        </div>

        {/* Search */}
        <div style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", display: "flex" }}>
            <ISearch />
          </span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search your list..."
            style={{
              background: "#fff", border: "1px solid #ede9fe", borderRadius: 10,
              padding: "8px 14px 8px 34px", fontSize: 13, color: "#1e1b4b",
              width: 210, outline: "none",
            }} />
        </div>
      </div>

      {/* ── Count label ── */}
      {!isLoading && (
        <div style={{ fontSize: 13, fontWeight: 700, color: "#9ca3af", marginBottom: 14 }}>
          {filtered.length} Anime
        </div>
      )}

      {/* ── Cards ── */}
      {isLoading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} style={{ height: 200, borderRadius: 18, background: "linear-gradient(90deg,#f0ecff 25%,#e8e2ff 50%,#f0ecff 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite" }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyListState onExplore={() => navigate("/explore")} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {filtered.map(entry => (
            <AnimeListCard
              key={entry.id}
              entry={entry}
              onNavigate={() => navigate(`/anime/${entry.anilist_id}`)}
              onDelete={() => delMut.mutate(entry.id)}
              onUpdate={data => updMut.mutate({ id: entry.id, data })}
            />
          ))}
        </div>
      )}

    </div>
  );
}