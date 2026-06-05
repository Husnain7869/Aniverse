import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import useAuthStore from "../store/authStore";

const NAV = [
  { to: "/",        label: "Home"    },
  { to: "/explore", label: "Explore" },
  { to: "/list",    label: "My List" },
  { to: "/ai",      label: "AI Recs" },
  { to: "/stats",   label: "Stats"   },
];

const IconSearch = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
);
const IconBell = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);
const IconChevronDown = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 9 6 6 6-6"/>
  </svg>
);
const IconUser = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const IconLogOut = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);
const IconBarChart = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
  </svg>
);

// Shiori leaf logo (SVG, no emoji)
const ShioriLogo = () => (
  <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
    <path d="M16 4C10 4 5 9 5 16s5 12 11 12c1 0 2 0 3-.2C16 25 13 21 13 16c0-4 2-7.5 5-9.5C17.3 4.2 16.7 4 16 4z" fill="#c084fc"/>
    <path d="M19 6.5C23 8.5 26 12 26 16c0 6-5 11-11 11h-1c2 1 4 1.5 6 1.5 6.6 0 12-5.4 12-12 0-5.5-3.7-10.1-8.7-11.5L19 6.5z" fill="#a855f7"/>
    <path d="M13 16c0-4 2-7.5 5-9.5C16.5 9 15 12.2 15 16c0 4 1.5 7 4 9-1 .2-2 .2-3 .2C10 25.2 5 21 5 16c0-.2 0-.4 0-.6C8 17 10.5 17 13 16z" fill="#7c3aed"/>
  </svg>
);

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [showMenu, setShowMenu] = useState(false);

  const handleSearch = (e) => {
    if (e.key === "Enter" && query.trim()) {
      navigate(`/explore?q=${encodeURIComponent(query.trim())}`);
      setQuery("");
    }
  };

  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 200,
      background: "rgba(255,255,255,0.97)", backdropFilter: "blur(20px)",
      borderBottom: "1px solid #ece8fb",
      display: "flex", alignItems: "center",
      padding: "0 36px", height: 62, gap: 0,
    }}>

      {/* Logo */}
      <div
        onClick={() => navigate("/")}
        style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", marginRight: 36, flexShrink: 0 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 9,
          background: "linear-gradient(135deg,#c084fc,#7c3aed)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <ShioriLogo />
        </div>
        <span style={{ fontSize: 19, fontWeight: 800, color: "#1e1b4b", fontFamily: "'Playfair Display',serif", letterSpacing: "-0.3px" }}>
          Shiori
        </span>
      </div>

      {/* Nav links */}
      <nav style={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}>
        {NAV.map(({ to, label }) => (
          <NavLink key={to} to={to} end={to === "/"} style={({ isActive }) => ({
            display: "inline-flex", alignItems: "center",
            padding: "6px 15px", borderRadius: 99,
            fontSize: 14, fontWeight: isActive ? 700 : 500,
            textDecoration: "none", transition: "all .15s",
            color: isActive ? "#7c3aed" : "#6b7280",
            borderBottom: isActive ? "2px solid #7c3aed" : "2px solid transparent",
            borderRadius: 0, paddingBottom: 4, paddingTop: 4, marginRight: 4,
          })}>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Search bar */}
      <div style={{ position: "relative", marginRight: 14 }}>
        <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", display: "flex" }}>
          <IconSearch />
        </span>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleSearch}
          placeholder="Search anime, characters, studios..."
          style={{
            width: 280, background: "#f5f3ff", border: "1.5px solid #ece8fb",
            borderRadius: 99, padding: "8px 16px 8px 36px",
            fontSize: 13, color: "#1e1b4b", outline: "none",
          }}
        />
        <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", fontSize: 10, fontWeight: 600, background: "#ece8fb", borderRadius: 4, padding: "2px 5px", letterSpacing: 0.5 }}>
          ⌘K
        </span>
      </div>

      {/* Bell */}
      <div style={{ position: "relative", marginRight: 10, cursor: "pointer" }}>
        <div style={{
          width: 36, height: 36, borderRadius: "50%",
          background: "#f5f3ff", border: "1.5px solid #ece8fb",
          display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7280",
        }}>
          <IconBell />
        </div>
        <div style={{
          position: "absolute", top: 2, right: 2,
          width: 16, height: 16, background: "#9333ea", borderRadius: "50%",
          border: "2px solid #fff",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 9, color: "#fff", fontWeight: 800,
        }}>3</div>
      </div>

      {/* Avatar + dropdown toggle */}
      <div style={{ position: "relative" }}>
        <div
          onClick={() => setShowMenu(!showMenu)}
          style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            border: "2px solid #d8b4fe",
            background: "linear-gradient(135deg,#c084fc,#7c3aed)",
            display: "flex", alignItems: "center", justifyContent: "center",
            overflow: "hidden", color: "#fff",
          }}>
            {user?.avatar_url
              ? <img src={user.avatar_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="avatar" />
              : <IconUser />}
          </div>
          <span style={{ color: "#6b7280" }}><IconChevronDown /></span>
        </div>

        {showMenu && (
          <div style={{
            position: "absolute", right: 0, top: 48,
            background: "#fff", border: "1px solid #ece8fb",
            borderRadius: 14, boxShadow: "0 8px 32px rgba(124,58,237,0.13)",
            padding: 8, minWidth: 164, zIndex: 999,
          }}>
            {[
              { label: "Profile", path: "/profile", Icon: IconUser },
              { label: "Stats",   path: "/stats",   Icon: IconBarChart },
            ].map(({ label, path, Icon }) => (
              <div key={path}
                onClick={() => { navigate(path); setShowMenu(false); }}
                style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 13px", borderRadius: 8, fontSize: 13, fontWeight: 600, color: "#6b7280", cursor: "pointer" }}
                onMouseEnter={e => e.currentTarget.style.background = "#f5f3ff"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <Icon /> {label}
              </div>
            ))}
            <div style={{ height: 1, background: "#ece8fb", margin: "6px 0" }} />
            <div
              onClick={() => { logout(); navigate("/login"); setShowMenu(false); }}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 13px", borderRadius: 8, fontSize: 13, fontWeight: 600, color: "#ef4444", cursor: "pointer" }}
              onMouseEnter={e => e.currentTarget.style.background = "#fff5f5"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <IconLogOut /> Sign Out
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
