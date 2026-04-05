import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);

      if (err.code === "auth/invalid-credential") {
        setError("Incorrect email or password.");
      } else if (err.code === "auth/user-not-found") {
        setError("No account found with this email.");
      } else if (err.code === "auth/wrong-password") {
        setError("Incorrect email or password.");
      } else if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else {
        setError("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={pageWrapperStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>🔐 Login</h1>
        <p style={subtitleStyle}>
          Welcome back. Sign in to continue building in public.
        </p>

        <form onSubmit={handleLogin}>
          <div style={fieldGroupStyle}>
            <label style={labelStyle}>Email Address</label>
            <input
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div style={fieldGroupStyle}>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
            />
          </div>

          <button type="submit" disabled={loading} style={primaryButtonStyle}>
            {loading ? "Logging in..." : "🚀 Login"}
          </button>
        </form>

        {error && <p style={errorStyle}>{error}</p>}

        <p style={footerTextStyle}>
          Don’t have an account?{" "}
          <Link to="/signup" style={linkStyle}>
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}

const pageWrapperStyle = {
  maxWidth: "520px",
  margin: "0 auto",
  padding: "40px 20px",
};

const cardStyle = {
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: "18px",
  padding: "28px",
  boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
};

const titleStyle = {
  fontSize: "30px",
  marginBottom: "8px",
  color: "#111827",
};

const subtitleStyle = {
  color: "#6b7280",
  marginBottom: "24px",
  fontSize: "15px",
};

const fieldGroupStyle = {
  marginBottom: "18px",
};

const labelStyle = {
  display: "block",
  marginBottom: "8px",
  fontWeight: "600",
  color: "#374151",
};

const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: "10px",
  border: "1px solid #d1d5db",
  fontSize: "14px",
  boxSizing: "border-box",
};

const primaryButtonStyle = {
  width: "100%",
  padding: "12px 18px",
  borderRadius: "10px",
  border: "none",
  background: "#2563eb",
  color: "#ffffff",
  cursor: "pointer",
  fontWeight: "600",
  fontSize: "14px",
};

const errorStyle = {
  marginTop: "16px",
  color: "#dc2626",
  fontWeight: "500",
  background: "#fef2f2",
  border: "1px solid #fecaca",
  padding: "12px",
  borderRadius: "10px",
};

const footerTextStyle = {
  marginTop: "20px",
  color: "#4b5563",
  textAlign: "center",
};

const linkStyle = {
  color: "#2563eb",
  textDecoration: "none",
  fontWeight: "600",
};