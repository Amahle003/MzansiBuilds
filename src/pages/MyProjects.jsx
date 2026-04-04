import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db, auth } from "../firebase";

export default function MyProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [milestoneInputs, setMilestoneInputs] = useState({});

  useEffect(() => {
    fetchMyProjects();
  }, []);

  const fetchMyProjects = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const q = query(
        collection(db, "projects"),
        where("userId", "==", user.uid)
      );

      const snapshot = await getDocs(q);

      const projectList = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));

      setProjects(projectList);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = (milestones = []) => {
    if (milestones.length === 0) return 0;
    const completedCount = milestones.filter((m) => m.completed).length;
    return Math.round((completedCount / milestones.length) * 100);
  };

  const updateProjectField = async (projectId, field, value) => {
    try {
      const user = auth.currentUser;
      const project = projects.find((p) => p.id === projectId);

      if (!user || !project || project.userId !== user.uid) return;

      await updateDoc(doc(db, "projects", projectId), {
        [field]: value,
      });

      setProjects((prev) =>
        prev.map((p) =>
          p.id === projectId ? { ...p, [field]: value } : p
        )
      );
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
    }
  };

  const addMilestone = async (projectId) => {
    const text = milestoneInputs[projectId]?.trim();
    if (!text) return;

    try {
      const user = auth.currentUser;
      const project = projects.find((p) => p.id === projectId);

      if (!user || !project || project.userId !== user.uid) return;

      const newMilestone = {
        id: Date.now().toString(),
        text,
        completed: false,
        createdAt: new Date().toISOString(),
        achievedAt: null,
      };

      const updatedMilestones = [...(project.milestones || []), newMilestone];
      const newProgress = calculateProgress(updatedMilestones);
      const isNowCompleted = newProgress === 100;
      const updatedStage = isNowCompleted ? "Completed" : project.stage;

      await updateDoc(doc(db, "projects", projectId), {
        milestones: updatedMilestones,
        progress: newProgress,
        isCompleted: isNowCompleted,
        completedAt: isNowCompleted ? serverTimestamp() : null,
        stage: updatedStage,
      });

      setProjects((prev) =>
        prev.map((p) =>
          p.id === projectId
            ? {
                ...p,
                milestones: updatedMilestones,
                progress: newProgress,
                isCompleted: isNowCompleted,
                stage: updatedStage,
              }
            : p
        )
      );

      setMilestoneInputs((prev) => ({
        ...prev,
        [projectId]: "",
      }));
    } catch (error) {
      console.error("Error adding milestone:", error);
    }
  };

  const toggleMilestone = async (projectId, milestoneId) => {
    try {
      const user = auth.currentUser;
      const project = projects.find((p) => p.id === projectId);

      if (!user || !project || project.userId !== user.uid) return;

      const updatedMilestones = (project.milestones || []).map((milestone) =>
        milestone.id === milestoneId
          ? {
              ...milestone,
              completed: !milestone.completed,
              achievedAt: !milestone.completed
                ? new Date().toISOString()
                : null,
            }
          : milestone
      );

      const newProgress = calculateProgress(updatedMilestones);
      const isNowCompleted = newProgress === 100;
      const updatedStage = isNowCompleted ? "Completed" : project.stage;

      await updateDoc(doc(db, "projects", projectId), {
        milestones: updatedMilestones,
        progress: newProgress,
        isCompleted: isNowCompleted,
        completedAt: isNowCompleted ? serverTimestamp() : null,
        stage: updatedStage,
      });

      setProjects((prev) =>
        prev.map((p) =>
          p.id === projectId
            ? {
                ...p,
                milestones: updatedMilestones,
                progress: newProgress,
                isCompleted: isNowCompleted,
                stage: updatedStage,
              }
            : p
        )
      );
    } catch (error) {
      console.error("Error toggling milestone:", error);
    }
  };

  if (loading) {
    return <p>Loading your projects...</p>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>My Projects</h2>

      {projects.length === 0 ? (
        <p>No projects found.</p>
      ) : (
        projects.map((project) => (
          <div
            key={project.id}
            style={{
              border: "1px solid #ccc",
              borderRadius: "10px",
              padding: "16px",
              marginBottom: "20px",
            }}
          >
            <h3>{project.title}</h3>
            <p>{project.description}</p>

            <label>Stage: </label>
            <select
              value={project.stage || ""}
              onChange={(e) =>
                updateProjectField(project.id, "stage", e.target.value)
              }
            >
              <option value="Idea">Idea</option>
              <option value="Planning">Planning</option>
              <option value="In Progress">In Progress</option>
              <option value="Testing">Testing</option>
              <option value="Completed">Completed</option>
            </select>

            <br />
            <br />

            <label>Support Needed: </label>
            <input
              type="text"
              value={project.support || ""}
              onChange={(e) =>
                updateProjectField(project.id, "support", e.target.value.toString())
              }
              placeholder="e.g. UI help, backend support"
            />

            <br />
            <br />

            <p>
              <strong>Progress:</strong> {project.progress || 0}%
            </p>

            <div
              style={{
                background: "#eee",
                height: "12px",
                borderRadius: "6px",
                overflow: "hidden",
                marginBottom: "12px",
              }}
            >
              <div
                style={{
                  width: `${project.progress || 0}%`,
                  height: "100%",
                  background: "#4caf50",
                }}
              ></div>
            </div>

            <h4>Milestones</h4>

            <div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
              <input
                type="text"
                placeholder="Add a milestone"
                value={milestoneInputs[project.id] || ""}
                onChange={(e) =>
                  setMilestoneInputs((prev) => ({
                    ...prev,
                    [project.id]: e.target.value,
                  }))
                }
              />
              <button onClick={() => addMilestone(project.id)}>
                Add Milestone
              </button>
            </div>

            {project.milestones && project.milestones.length > 0 ? (
              <ul style={{ paddingLeft: "20px" }}>
                {project.milestones.map((milestone) => (
                  <li key={milestone.id} style={{ marginBottom: "8px" }}>
                    <label>
                      <input
                        type="checkbox"
                        checked={milestone.completed}
                        onChange={() =>
                          toggleMilestone(project.id, milestone.id)
                        }
                      />{" "}
                      <span
                        style={{
                          textDecoration: milestone.completed
                            ? "line-through"
                            : "none",
                        }}
                      >
                        {milestone.text}
                      </span>
                    </label>

                    {milestone.completed && milestone.achievedAt && (
                      <small style={{ display: "block", color: "gray" }}>
                        Achieved:{" "}
                        {new Date(milestone.achievedAt).toLocaleString()}
                      </small>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No milestones yet.</p>
            )}

            {project.isCompleted && (
              <p style={{ color: "green", fontWeight: "bold" }}>
                🎉 Project completed!
              </p>
            )}
          </div>
        ))
      )}
    </div>
  );
}