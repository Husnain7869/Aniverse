import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";

export default function Login() {
  const [email, setEmail] = useState("");
  const [pass, setPass]   = useState("");
  const [err, setErr]     = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault(); setErr(""); setLoading(true);
    try { await login(email, pass); navigate("/"); }
    catch (e) { setErr(e.response?.data?.detail||"Invalid credentials"); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#faf5ff 0%,#f3e8ff 50%,#ede9fe 100%)", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ width:"100%", maxWidth:420 }}>
        {/* Logo */}
        <div style={{ textAlign:"center", marginBottom:36 }}>
          <div style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", width:60, height:60, background:"linear-gradient(135deg,#a855f7,#7c3aed)", borderRadius:18, fontSize:28, marginBottom:14, boxShadow:"0 8px 24px rgba(124,58,237,0.3)" }}>🌿</div>
          <div style={{ fontSize:28, fontWeight:800, color:"var(--text-primary)", fontFamily:"'Playfair Display',serif" }}>Shiori</div>
          <div style={{ fontSize:13, color:"var(--text-muted)", marginTop:4 }}>Your anime journey awaits</div>
        </div>

        <div style={{ background:"var(--surface)", borderRadius:24, padding:36, boxShadow:"0 8px 40px rgba(124,58,237,0.12)", border:"1px solid var(--border)" }}>
          <h2 style={{ fontSize:20, fontWeight:800, color:"var(--text-primary)", marginBottom:24 }}>Welcome back</h2>

          {err && <div style={{ background:"#fee2e2", border:"1px solid #fca5a5", borderRadius:10, padding:"10px 14px", color:"#991b1b", fontSize:13, fontWeight:600, marginBottom:18 }}>{err}</div>}

          <form onSubmit={submit} style={{ display:"flex", flexDirection:"column", gap:16 }}>
            {[["Email","email",email,setEmail],["Password","password",pass,setPass]].map(([label,type,val,set])=>(
              <div key={label}>
                <label style={{ fontSize:12, fontWeight:700, color:"var(--text-secondary)", display:"block", marginBottom:6, textTransform:"uppercase", letterSpacing:.5 }}>{label}</label>
                <input type={type} value={val} onChange={e=>set(e.target.value)} required
                  style={{ width:"100%", background:"var(--surface2)", border:"1.5px solid var(--border)", borderRadius:12, padding:"12px 16px", fontSize:14, color:"var(--text-primary)", outline:"none", transition:"border-color .2s" }}
                  onFocus={e=>e.target.style.borderColor="var(--purple-400)"}
                  onBlur={e=>e.target.style.borderColor="var(--border)"} />
              </div>
            ))}
            <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop:8, padding:"13px", justifyContent:"center", borderRadius:12, fontSize:15 }}>
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <p style={{ textAlign:"center", marginTop:22, fontSize:13, color:"var(--text-muted)" }}>
            No account?{" "}<Link to="/register" style={{ color:"var(--purple-600)", fontWeight:700 }}>Create one free →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
