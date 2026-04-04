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

export default function App() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div>
      <nav style={{ padding: "10px", display: "flex", gap: "10px" }}>
        <Link to="/">Home</Link>

        {!user ? (
          <>
            <Link to="/login">Login</Link>
            <Link to="/signup">Sign Up</Link>
          </>
        ) : (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/create-project">Create Project</Link>
            <Link to="/my-projects">My Projects</Link>
            <button onClick={handleLogout}>Logout</button>
          </>
        )}
      </nav>

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
      </Routes>
    </div>
  );
}