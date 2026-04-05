import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function CreateProject() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [budget, setBudget] = useState("");
  const [stage, setStage] = useState("Planning");
  const [supportNeeded, setSupportNeeded] = useState("Backend Support");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!title || !description || !location || !budget) {
      setError("Please fill in all fields.");
      return;
    }

    if (!user) {
      setError("You must be logged in to create a project.");
      return;
    }

    try {
      setLoading(true);

      await addDoc(collection(db, "projects"), {
        title,
        description,
        location,
        budget: Number(budget),
        stage,
        support: supportNeeded,
        progress: Number(progress),
        milestones: [],
        isCompleted: false,
        completedAt: null,
        userId: user.uid,
        userEmail: user.email,
        createdAt: serverTimestamp(),
      });

      setMessage("Project created successfully.");

      setTitle("");
      setDescription("");
      setLocation("");
      setBudget("");
      setStage("Planning");
      setSupportNeeded("Backend Support");
      setProgress(0);

      setTimeout(() => {
        navigate("/my-projects");
      }, 1000);
    } catch (err) {
      console.error("Create project error:", err);
      setError("Failed to create project.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={pageWrapperStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>🛠 Create Project</h1>
        <p style={subtitleStyle}>
          Start building in public by creating a new project.
        </p>

        <form onSubmit={handleCreateProject}>
          <div style={fieldGroupStyle}>
            <label style={labelStyle}>Project Title</label>
            <input
              type="text"
              placeholder="Enter project title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div style={fieldGroupStyle}>
            <label style={labelStyle}>Project Description</label>
            <textarea
              placeholder="Describe your project"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={textareaStyle}
            />
          </div>

          <div style={fieldGroupStyle}>
            <label style={labelStyle}>Location</label>
            <input
              type="text"
              placeholder="Enter location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div style={fieldGroupStyle}>
            <label style={labelStyle}>Budget</label>
            <input
              type="number"
              placeholder="Enter budget"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div style={fieldGroupStyle}>
            <label style={labelStyle}>Project Stage</label>
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value)}
              style={selectStyle}
            >
              <option value="Planning">Planning</option>
              <option value="In Progress">In Progress</option>
              <option value="On Hold">On Hold</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div style={fieldGroupStyle}>
            <label style={labelStyle}>Support Needed</label>
            <select
              value={supportNeeded}
              onChange={(e) => setSupportNeeded(e.target.value)}
              style={selectStyle}
            >
              <option value="UI Designer">UI Designer</option>
              <option value="Backend Support">Backend Support</option>
              <option value="Frontend Support">Frontend Support</option>
              <option value="Deployment Support">Deployment Support</option>
              <option value="API Support">API Support</option>
              <option value="Multiple Services">Multiple Services</option>
            </select>
          </div>

          <div style={fieldGroupStyle}>
            <label style={labelStyle}>Progress (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={progress}
              onChange={(e) => setProgress(e.target.value)}
              style={inputStyle}
            />
          </div>

          <button type="submit" disabled={loading} style={buttonStyle}>
            {loading ? "Creating..." : "🚀 Create Project"}
          </button>
        </form>

        {error && <p style={errorStyle}>{error}</p>}
        {message && <p style={successStyle}>{message}</p>}
      </div>
    </div>
  );
}

const pageWrapperStyle = {
  maxWidth: "900px",
  margin: "0 auto",
  padding: "32px 20px",
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

const textareaStyle = {
  width: "100%",
  minHeight: "120px",
  padding: "12px 14px",
  borderRadius: "10px",
  border: "1px solid #d1d5db",
  fontSize: "14px",
  boxSizing: "border-box",
  resize: "vertical",
};

const selectStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: "10px",
  border: "1px solid #d1d5db",
  fontSize: "14px",
  boxSizing: "border-box",
  background: "#ffffff",
};

const buttonStyle = {
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
  marginTop: "18px",
  color: "#dc2626",
  fontWeight: "500",
};

const successStyle = {
  marginTop: "18px",
  color: "#16a34a",
  fontWeight: "500",
};
