import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";

async function fetchCovers() {
  const query = `query {
    frieren:   Media(id: 154587, type: ANIME) { coverImage { extraLarge } }
    yourName:  Media(id: 21519,  type: ANIME) { coverImage { extraLarge } }
    aot:       Media(id: 16498,  type: ANIME) { coverImage { extraLarge } }
    violet:    Media(id: 21827,  type: ANIME) { coverImage { extraLarge } }
  }`;
  try {
    const r = await fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ query }),
    });
    const { data } = await r.json();
    return {
      frieren: data?.frieren?.coverImage?.extraLarge,
      yourName: data?.yourName?.coverImage?.extraLarge,
      aot: data?.aot?.coverImage?.extraLarge,
      violet: data?.violet?.coverImage?.extraLarge,
    };
  } catch { return {}; }
}

const PETAL_CSS = `
  @keyframes petalDrift {
    0%   { transform: translateY(-40px) rotate(var(--r0)) scaleX(0.85); opacity:0; }
    8%   { opacity:1; }
    92%  { opacity:0.6; }
    100% { transform: translateY(108vh) rotate(var(--r1)) scaleX(0.85); opacity:0; }
  }
  .auth-petal { animation: petalDrift var(--dur) var(--delay) linear infinite; }
  .auth-input:focus { border-color: #7c3aed !important; box-shadow: 0 0 0 3px rgba(124,58,237,0.1) !important; }
  .auth-input { transition: border-color 0.2s, box-shadow 0.2s; }
  .auth-btn-primary:hover:not(:disabled) { filter: brightness(1.08); transform: translateY(-1px); box-shadow: 0 8px 32px rgba(124,58,237,0.45) !important; }
  .auth-btn-primary:disabled { opacity: 0.65; cursor: not-allowed; }
  .auth-btn-social:hover { border-color: #a855f7 !important; background: #faf5ff !important; }
`;

function Petals() {
  const items = Array.from({ length: 16 }, (_, i) => ({
    id: i,
    left: `${(i * 719 + 53) % 94 + 3}%`,
    dur: `${6 + (i * 137) % 5}s`,
    delay: `${((i * 83) % 60) / 10}s`,
    w: 11 + (i * 41) % 9,
    h: 7 + (i * 29) % 6,
    r0: (i * 67) % 360,
    r1: (i * 67) % 360 + 600,
    hue: 270 + (i * 11) % 50,
  }));
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
      {items.map(p => (
        <div key={p.id} className="auth-petal" style={{
          position: "absolute", left: p.left, top: 0,
          width: p.w, height: p.h,
          borderRadius: "50% 20% 50% 20%",
          background: `linear-gradient(135deg, hsla(${p.hue},75%,75%,0.8), hsla(${p.hue + 30},65%,68%,0.5))`,
          "--dur": p.dur, "--delay": p.delay, "--r0": `${p.r0}deg`, "--r1": `${p.r1}deg`,
        }} />
      ))}
    </div>
  );
}

function FloatingCard({ cover, title, style }) {
  return (
    <div style={{ position: "absolute", width: 130, borderRadius: 16, overflow: "hidden", boxShadow: "0 20px 50px rgba(109,40,217,0.25), 0 4px 16px rgba(0,0,0,0.15)", ...style }}>
      {cover
        ? <img src={cover} alt={title} style={{ width: "100%", aspectRatio: "2/3", objectFit: "cover", display: "block" }} />
        : <div style={{ width: "100%", aspectRatio: "2/3", background: "linear-gradient(135deg,#c4b5fd,#a78bfa)" }} />
      }
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent,rgba(0,0,0,0.75))", padding: "24px 8px 10px" }}>
        <div style={{ fontSize: 9, fontWeight: 800, color: "#fff", textAlign: "center", lineHeight: 1.3 }}>{title}</div>
      </div>
    </div>
  );
}

const IcLeaf = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
    <path d="M11 20A7 7 0 0 1 4 13c0-5 6-11 8-13 2 2 8 8 8 13a7 7 0 0 1-7 7z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M11 20v-9" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
const IcLogoLeaf = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M11 20A7 7 0 0 1 4 13c0-5 6-11 8-13 2 2 8 8 8 13a7 7 0 0 1-7 7z" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M11 20v-9" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
const IcMail = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 7L2 7" />
  </svg>
);
const IcLock = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);
const IcEye = ({ off }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {off
      ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></>
      : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>
    }
  </svg>
);
const IcArrow = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);
const IcDiscord = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="#5865F2">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
  </svg>
);

export default function Login() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [covers, setCovers] = useState({});
  const { login } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => { fetchCovers().then(setCovers); }, []);

  const submit = async (e) => {
    e.preventDefault(); setErr(""); setLoading(true);
    try { await login(email, pass); navigate("/"); }
    catch (e) { setErr(e.response?.data?.detail || "Invalid credentials. Please try again."); }
    finally { setLoading(false); }
  };

  const inputStyle = {
    width: "100%", border: "1.5px solid #e5e7eb", borderRadius: 12,
    padding: "12px 16px 12px 42px", fontSize: 14, color: "#1e1b4b",
    outline: "none", background: "#fff", boxSizing: "border-box",
    fontFamily: "'Nunito','Segoe UI',sans-serif", fontWeight: 600,
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#f5f0ff 0%,#ede8ff 40%,#e8e0ff 100%)", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden", fontFamily: "'Nunito','Segoe UI',sans-serif" }}>
      <style>{PETAL_CSS}</style>
      <Petals />

      <FloatingCard cover={covers.frieren} title="Frieren: Beyond Journey's End" style={{ left: "5%", top: "12%", transform: "rotate(-11deg)", zIndex: 2 }} />
      <FloatingCard cover={covers.yourName} title="Your Name." style={{ right: "4%", top: "6%", transform: "rotate(10deg)", zIndex: 2 }} />
      <FloatingCard cover={covers.aot} title="Attack on Titan" style={{ left: "3%", bottom: "8%", transform: "rotate(-7deg)", zIndex: 2 }} />
      <FloatingCard cover={covers.violet} title="Violet Evergarden" style={{ right: "3%", bottom: "5%", transform: "rotate(8deg)", zIndex: 2 }} />

      <div style={{ position: "absolute", top: 24, left: 32, display: "flex", alignItems: "center", gap: 8, zIndex: 10 }}>
        <IcLogoLeaf />
        <span style={{ fontSize: 19, fontWeight: 900, color: "#1e1b4b", letterSpacing: "-0.5px" }}>AniVerse</span>
      </div>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 20px 60px", position: "relative", zIndex: 5 }}>
        <div style={{ width: "100%", maxWidth: 420, background: "#fff", borderRadius: 28, padding: "40px 40px 36px", boxShadow: "0 24px 80px rgba(109,40,217,0.14), 0 4px 24px rgba(0,0,0,0.06)" }}>

          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 56, height: 56, background: "linear-gradient(135deg,#7c3aed,#a855f7)", borderRadius: 16, marginBottom: 16, boxShadow: "0 8px 24px rgba(124,58,237,0.35)" }}>
              <IcLeaf />
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 900, color: "#1e1b4b", marginBottom: 6, letterSpacing: "-0.3px" }}>Welcome back</h1>
            <p style={{ fontSize: 13.5, color: "#6b7280", fontWeight: 500 }}>Sign in to continue your anime journey.</p>
          </div>

          {err && (
            <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 10, padding: "10px 14px", color: "#991b1b", fontSize: 13, fontWeight: 600, marginBottom: 18 }}>{err}</div>
          )}

          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>

            <div>
              <label style={{ fontSize: 11, fontWeight: 800, color: "#374151", display: "block", marginBottom: 7, letterSpacing: "0.8px", textTransform: "uppercase" }}>Email</label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", display: "flex" }}><IcMail /></span>
                <input className="auth-input" type="email" placeholder="Enter your email" value={email}
                  onChange={e => setEmail(e.target.value)} required style={inputStyle} />
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
                <label style={{ fontSize: 11, fontWeight: 800, color: "#374151", letterSpacing: "0.8px", textTransform: "uppercase" }}>Password</label>
                <span style={{ fontSize: 12, color: "#7c3aed", fontWeight: 700, cursor: "pointer" }}>Forgot password?</span>
              </div>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", display: "flex" }}><IcLock /></span>
                <input className="auth-input" type={showPass ? "text" : "password"} placeholder="Enter your password" value={pass}
                  onChange={e => setPass(e.target.value)} required style={{ ...inputStyle, paddingRight: 44 }} />
                <button type="button" onClick={() => setShowPass(s => !s)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", display: "flex", padding: 0 }}>
                  <IcEye off={showPass} />
                </button>
              </div>
            </div>

            <button type="submit" className="auth-btn-primary" disabled={loading} style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              background: "linear-gradient(135deg,#7c3aed,#9333ea)", color: "#fff",
              border: "none", borderRadius: 14, padding: "14px", fontSize: 15, fontWeight: 800,
              cursor: "pointer", marginTop: 4, boxShadow: "0 6px 24px rgba(124,58,237,0.38)",
              transition: "filter 0.15s, transform 0.15s, box-shadow 0.15s",
            }}>
              {loading ? "Signing in…" : <><span>Sign In</span><IcArrow /></>}
            </button>
          </form>

          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "22px 0" }}>
            <div style={{ flex: 1, height: 1, background: "#f3f4f6" }} />
            <span style={{ fontSize: 12, color: "#9ca3af", fontWeight: 600 }}>or continue with</span>
            <div style={{ flex: 1, height: 1, background: "#f3f4f6" }} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <button className="auth-btn-social" style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: 12,
              padding: "11px 16px", fontSize: 14, fontWeight: 700, color: "#374151",
              cursor: "pointer", transition: "border-color 0.2s, background 0.2s",
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Google
            </button>
            <button className="auth-btn-social" style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: 12,
              padding: "11px 16px", fontSize: 14, fontWeight: 700, color: "#374151",
              cursor: "pointer", transition: "border-color 0.2s, background 0.2s",
            }}>
              <IcDiscord /> Discord
            </button>
          </div>

          <p style={{ textAlign: "center", marginTop: 24, fontSize: 13.5, color: "#6b7280", fontWeight: 500 }}>
            Don't have an account?{" "}
            <span onClick={() => navigate("/register")} style={{ color: "#7c3aed", fontWeight: 800, cursor: "pointer" }}>
              Sign up free →
            </span>
          </p>
        </div>
      </div>

      <div style={{ position: "relative", zIndex: 5, textAlign: "center", padding: "0 20px 24px", display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap" }}>
        <span style={{ fontSize: 12.5, color: "#9ca3af" }}>© 2026 AniVerse. All rights reserved.</span>
        <span style={{ color: "#d1d5db", margin: "0 16px" }}>|</span>
        <a href="#" style={{ fontSize: 12.5, color: "#9ca3af", textDecoration: "none", fontWeight: 600 }}
          onMouseEnter={e => e.target.style.color = "#7c3aed"} onMouseLeave={e => e.target.style.color = "#9ca3af"}>Privacy Policy</a>
        <span style={{ color: "#d1d5db", margin: "0 16px" }}>|</span>
        <a href="#" style={{ fontSize: 12.5, color: "#9ca3af", textDecoration: "none", fontWeight: 600 }}
          onMouseEnter={e => e.target.style.color = "#7c3aed"} onMouseLeave={e => e.target.style.color = "#9ca3af"}>Terms of Service</a>
      </div>
    </div>
  );
}
