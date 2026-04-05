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
    return (
      <div style={pageWrapperStyle}>
        <p style={infoTextStyle}>Loading your projects...</p>
      </div>
    );
  }

  return (
    <div style={pageWrapperStyle}>
      <h1 style={titleStyle}>📁 My Projects</h1>
      <p style={subtitleStyle}>
        Manage your projects, update progress, and track milestones.
      </p>

      {projects.length === 0 ? (
        <div style={cardStyle}>
          <p style={infoTextStyle}>No projects found.</p>
        </div>
      ) : (
        projects.map((project) => (
          <div key={project.id} style={cardStyle}>
            <div style={headerRowStyle}>
              <div>
                <h2 style={projectTitleStyle}>{project.title}</h2>
                <p style={projectDescriptionStyle}>{project.description}</p>
              </div>

              {project.isCompleted && (
                <span
                  style={{
                    ...badgeStyle,
                    background: "#dcfce7",
                    color: "#166534",
                  }}
                >
                  🎉 Completed
                </span>
              )}
            </div>

            <div style={editGridStyle}>
              <div style={fieldGroupStyle}>
                <label style={labelStyle}>Stage</label>
                <select
                  value={project.stage || ""}
                  onChange={(e) =>
                    updateProjectField(project.id, "stage", e.target.value)
                  }
                  style={selectStyle}
                >
                  <option value="Idea">Idea</option>
                  <option value="Planning">Planning</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Testing">Testing</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div style={fieldGroupStyle}>
                <label style={labelStyle}>Support Needed</label>
                <input
                  type="text"
                  value={project.support || ""}
                  onChange={(e) =>
                    updateProjectField(project.id, "support", e.target.value)
                  }
                  placeholder="e.g. UI help, backend support"
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ marginTop: "12px", marginBottom: "20px" }}>
              <p style={{ marginBottom: "8px" }}>
                <strong>Progress:</strong> {project.progress || 0}%
              </p>

              <div style={progressTrackStyle}>
                <div style={progressFillStyle(project.progress || 0)} />
              </div>
            </div>

            <div style={sectionStyle}>
              <h3 style={sectionTitleStyle}>📌 Milestones</h3>

              <div style={milestoneInputRowStyle}>
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
                  style={inputStyle}
                />
                <button
                  onClick={() => addMilestone(project.id)}
                  style={primaryButtonStyle}
                >
                  Add Milestone
                </button>
              </div>

              {project.milestones && project.milestones.length > 0 ? (
                <ul style={listStyle}>
                  {project.milestones.map((milestone) => (
                    <li key={milestone.id} style={milestoneItemStyle}>
                      <label style={checkboxLabelStyle}>
                        <input
                          type="checkbox"
                          checked={milestone.completed}
                          onChange={() =>
                            toggleMilestone(project.id, milestone.id)
                          }
                        />
                        <span
                          style={{
                            textDecoration: milestone.completed
                              ? "line-through"
                              : "none",
                            color: milestone.completed ? "#6b7280" : "#111827",
                          }}
                        >
                          {milestone.text}
                        </span>
                      </label>

                      {milestone.completed && milestone.achievedAt && (
                        <small style={smallTextStyle}>
                          Achieved:{" "}
                          {new Date(milestone.achievedAt).toLocaleString()}
                        </small>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={mutedTextStyle}>No milestones yet.</p>
              )}
            </div>

            {project.isCompleted && (
              <p style={successTextStyle}>✅ Project completed successfully!</p>
            )}
          </div>
        ))
      )}
    </div>
  );
}

const pageWrapperStyle = {
  maxWidth: "1000px",
  margin: "0 auto",
  padding: "32px 20px",
};

const cardStyle = {
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: "18px",
  padding: "24px",
  marginBottom: "24px",
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

const infoTextStyle = {
  color: "#4b5563",
  fontSize: "15px",
};

const headerRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "12px",
  flexWrap: "wrap",
  marginBottom: "18px",
};

const projectTitleStyle = {
  margin: "0 0 8px 0",
  fontSize: "24px",
  color: "#111827",
};

const projectDescriptionStyle = {
  margin: 0,
  color: "#4b5563",
  lineHeight: "1.5",
};

const badgeStyle = {
  display: "inline-block",
  padding: "6px 10px",
  borderRadius: "999px",
  background: "#eef2ff",
  color: "#3730a3",
  fontSize: "12px",
  fontWeight: "600",
};

const editGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: "16px",
  marginBottom: "8px",
};

const fieldGroupStyle = {
  marginBottom: "4px",
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

const selectStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: "10px",
  border: "1px solid #d1d5db",
  fontSize: "14px",
  boxSizing: "border-box",
  background: "#ffffff",
};

const progressTrackStyle = {
  background: "#e5e7eb",
  height: "12px",
  borderRadius: "999px",
  overflow: "hidden",
};

const progressFillStyle = (value) => ({
  width: `${value || 0}%`,
  height: "100%",
  background: value === 100 ? "#16a34a" : "#2563eb",
});

const sectionStyle = {
  marginTop: "10px",
};

const sectionTitleStyle = {
  marginBottom: "12px",
  color: "#111827",
  fontSize: "18px",
};

const milestoneInputRowStyle = {
  display: "flex",
  gap: "10px",
  marginBottom: "14px",
  flexWrap: "wrap",
};

const primaryButtonStyle = {
  padding: "10px 16px",
  borderRadius: "10px",
  border: "none",
  background: "#2563eb",
  color: "#ffffff",
  cursor: "pointer",
  fontWeight: "600",
};

const listStyle = {
  paddingLeft: "20px",
  margin: 0,
};

const milestoneItemStyle = {
  marginBottom: "12px",
  color: "#111827",
};

const checkboxLabelStyle = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
};

const smallTextStyle = {
  display: "block",
  color: "#6b7280",
  marginTop: "4px",
};

const mutedTextStyle = {
  color: "#6b7280",
};

const successTextStyle = {
  marginTop: "18px",
  color: "#16a34a",
  fontWeight: "700",
};