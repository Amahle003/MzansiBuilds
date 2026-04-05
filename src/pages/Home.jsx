import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div style={pageStyle}>
      <div style={heroCardStyle}>
        <h1 style={titleStyle}>🚀 MzansiBuilds</h1>

        <p style={subtitleStyle}>
          Build in public. Track milestones. Collaborate with developers.
          Celebrate finished projects.
        </p>

        <div style={buttonContainerStyle}>
          <Link to="/create-project">
            <button style={primaryButtonStyle}>🛠 Create Project</button>
          </Link>

          <Link to="/my-projects">
            <button style={secondaryButtonStyle}>📁 My Projects</button>
          </Link>

          <Link to="/all-projects">
            <button style={secondaryButtonStyle}>🌍 Live Feed</button>
          </Link>

          <Link to="/celebration-wall">
            <button style={secondaryButtonStyle}>🎉 Celebration Wall</button>
          </Link>
        </div>
      </div>

      {/* Feature section */}
      <div style={featureGridStyle}>
        <div style={featureCardStyle}>
          <h3>📊 Track Progress</h3>
          <p>Update milestones and monitor your project growth in real-time.</p>
        </div>

        <div style={featureCardStyle}>
          <h3>💬 Collaborate</h3>
          <p>Comment on projects and connect with other developers.</p>
        </div>

        <div style={featureCardStyle}>
          <h3>🎉 Celebrate</h3>
          <p>Showcase completed projects on the public celebration wall.</p>
        </div>
      </div>
    </div>
  );
}

/* Styles */

const pageStyle = {
  minHeight: "100vh",
  background: "linear-gradient(to bottom, #f3f4f6, #e5e7eb)",
  padding: "40px 20px",
};

const heroCardStyle = {
  maxWidth: "900px",
  margin: "0 auto",
  background: "#ffffff",
  borderRadius: "20px",
  padding: "40px 24px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
  textAlign: "center",
};

const titleStyle = {
  fontSize: "40px",
  marginBottom: "10px",
  color: "#111827",
};

const subtitleStyle = {
  fontSize: "18px",
  color: "#4b5563",
  marginBottom: "30px",
};

const buttonContainerStyle = {
  display: "flex",
  gap: "14px",
  justifyContent: "center",
  flexWrap: "wrap",
};

const primaryButtonStyle = {
  padding: "12px 18px",
  borderRadius: "10px",
  border: "none",
  background: "#2563eb",
  color: "white",
  cursor: "pointer",
  fontWeight: "600",
};

const secondaryButtonStyle = {
  padding: "12px 18px",
  borderRadius: "10px",
  border: "1px solid #d1d5db",
  background: "#ffffff",
  color: "#111827",
  cursor: "pointer",
  fontWeight: "600",
};

/* Feature section */

const featureGridStyle = {
  maxWidth: "1000px",
  margin: "40px auto 0",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
  gap: "20px",
};

const featureCardStyle = {
  background: "#ffffff",
  padding: "20px",
  borderRadius: "16px",
  boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
  textAlign: "center",
};