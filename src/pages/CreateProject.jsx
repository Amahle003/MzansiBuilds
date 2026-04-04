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
    <div>
      <h1>🛠 Create Project</h1>

      <form onSubmit={handleCreateProject}>
        <input
          type="text"
          placeholder="Project title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <br /><br />

        <textarea
          placeholder="Project description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <br /><br />

        <input
          type="text"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

        <br /><br />

        <input
          type="number"
          placeholder="Budget"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
        />

        <br /><br />

        <label>Project Stage: </label>
        <select value={stage} onChange={(e) => setStage(e.target.value)}>
          <option value="Planning">Planning</option>
          <option value="In Progress">In Progress</option>
          <option value="On Hold">On Hold</option>
          <option value="Completed">Completed</option>
        </select>

        <br /><br />

        <label>Support Needed: </label>
        <select
          value={supportNeeded}
          onChange={(e) => setSupportNeeded(e.target.value)}
        >
          <option value="UI Designer">UI Designer</option>
          <option value="Backend Support">Backend Support</option>
          <option value="Frontend Support">Frontend Support</option>
          <option value="Deployment Support">Deployment Support</option>
          <option value="API Support">API Support</option>
          <option value="Multiple Services">Multiple Services</option>
        </select>

        <br /><br />

        <label>Progress (%): </label>
        <input
          type="number"
          min="0"
          max="100"
          value={progress}
          onChange={(e) => setProgress(e.target.value)}
        />

        <br /><br />

        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Project"}
        </button>
      </form>

      {error && <p>{error}</p>}
      {message && <p>{message}</p>}
    </div>
  );
}