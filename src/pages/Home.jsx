import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div style={{ padding: "20px" }}>
      <h1>🏠 Home Page</h1>

      <div style={{ marginTop: "20px" }}>
        <Link to="/my-projects">
          <button style={{
            padding: "10px 16px",
            borderRadius: "8px",
            border: "none",
            background: "#4caf50",
            color: "white",
            cursor: "pointer"
        }}>
  My Projects
</button>
        </Link>

        <Link to="/all-projects">
          <button>
            Live Feed
          </button>
        </Link>
      </div>
    </div>
  );
}