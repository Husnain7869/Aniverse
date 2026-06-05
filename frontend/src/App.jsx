import { Routes, Route, Navigate } from "react-router-dom";
import useAuthStore from "./store/authStore";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import MyList from "./pages/MyList";
import Explore from "./pages/Explore";
import AnimeDetails from "./pages/AnimeDetails";
import AIRecommend from "./pages/AIRecommend";
import Stats from "./pages/Stats";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";

function Layout({ children }) {
  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", display:"flex", flexDirection:"column" }}>
      <Navbar />
      <main style={{ flex:1, maxWidth:1900, width:"100%", margin:"0 auto", padding:"28px 32px", boxSizing:"border-box" }}>
        {children}
      </main>
    </div>
  );
}

function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login"    element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<PrivateRoute><Layout><Home /></Layout></PrivateRoute>} />
      <Route path="/list" element={<PrivateRoute><Layout><MyList /></Layout></PrivateRoute>} />
      <Route path="/explore" element={<PrivateRoute><Layout><Explore /></Layout></PrivateRoute>} />
      <Route path="/anime/:id" element={<PrivateRoute><Layout><AnimeDetails /></Layout></PrivateRoute>} />
      <Route path="/ai" element={<PrivateRoute><Layout><AIRecommend /></Layout></PrivateRoute>} />
      <Route path="/stats" element={<PrivateRoute><Layout><Stats /></Layout></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute><Layout><Profile /></Layout></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
