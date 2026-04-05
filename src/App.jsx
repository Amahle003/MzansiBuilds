import { Routes, Route, Link, useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import CreateProject from "./pages/CreateProject";
import MyProjects from "./pages/MyProjects";
import ProtectedRoute from "./components/ProtectedRoute";
import AllProjects from "./pages/AllProjects";
import CelebrationWall from "./pages/CelebrationWall";

export default function App() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div>
      <nav style={navStyle}>
        <div style={brandStyle}>
          <Link to="/" style={brandLinkStyle}>
            🚀 MzansiBuilds
          </Link>
        </div>

        <div style={navLinksWrapperStyle}>
          {!user ? (
            <>
              <Link to="/login" style={navLinkStyle}>
                🔐 Login
              </Link>
              <Link to="/signup" style={navLinkStyle}>
                📝 Sign Up
              </Link>
            </>
          ) : (
            <>
              <Link to="/" style={navLinkStyle}>
                🏠 Home
              </Link>
              <Link to="/dashboard" style={navLinkStyle}>
                📊 Dashboard
              </Link>
              <Link to="/create-project" style={navLinkStyle}>
                🛠 Create Project
              </Link>
              <Link to="/my-projects" style={navLinkStyle}>
                📁 My Projects
              </Link>
              <Link to="/all-projects" style={navLinkStyle}>
                🌍 Live Feed
              </Link>
              <Link to="/celebration-wall" style={navLinkStyle}>
                🎉 Celebration Wall
              </Link>
              <button onClick={handleLogout} style={logoutButtonStyle}>
                🚪 Logout
              </button>
            </>
          )}
        </div>
      </nav>

      <main style={mainContentStyle}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-project"
            element={
              <ProtectedRoute>
                <CreateProject />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-projects"
            element={
              <ProtectedRoute>
                <MyProjects />
              </ProtectedRoute>
            }
          />
          <Route path="/all-projects" element={<AllProjects />} />
          <Route path="/celebration-wall" element={<CelebrationWall />} />
        </Routes>
      </main>
    </div>
  );
}

const navStyle = {
  background: "#111827",
  color: "#ffffff",
  padding: "16px 24px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "16px",
  flexWrap: "wrap",
  boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
};

const brandStyle = {
  display: "flex",
  alignItems: "center",
};

const brandLinkStyle = {
  color: "#ffffff",
  textDecoration: "none",
  fontSize: "22px",
  fontWeight: "700",
};

const navLinksWrapperStyle = {
  display: "flex",
  gap: "10px",
  alignItems: "center",
  flexWrap: "wrap",
};

const navLinkStyle = {
  color: "#ffffff",
  textDecoration: "none",
  padding: "8px 12px",
  borderRadius: "8px",
  background: "rgba(255,255,255,0.08)",
  fontWeight: "500",
};

const logoutButtonStyle = {
  padding: "8px 12px",
  borderRadius: "8px",
  border: "none",
  background: "#dc2626",
  color: "#ffffff",
  cursor: "pointer",
  fontWeight: "600",
};

const mainContentStyle = {
  minHeight: "calc(100vh - 80px)",
};