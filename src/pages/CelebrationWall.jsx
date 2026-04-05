import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase";
import {
  pageStyle,
  cardStyle,
  titleStyle,
  subtitleStyle,
  badgeStyle,
} from "../styles/ui";

export default function CelebrationWall() {
  const [completedProjects, setCompletedProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "projects"),
      where("isCompleted", "==", true),
      orderBy("completedAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const projects = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));

        setCompletedProjects(projects);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching celebration wall:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const formatDate = (value) => {
    if (!value) return "Recently";

    if (value?.toDate) {
      return value.toDate().toLocaleString();
    }

    if (typeof value === "string") {
      return new Date(value).toLocaleString();
    }

    return "Recently";
  };

  return (
    <div style={pageStyle}>
      <h1 style={titleStyle}>🎉 Celebration Wall</h1>
      <p style={subtitleStyle}>
        Developers who completed their projects and built in public.
      </p>

      {loading ? (
        <p>Loading celebration wall...</p>
      ) : completedProjects.length === 0 ? (
        <div style={cardStyle}>
          <p>No completed projects yet.</p>
        </div>
      ) : (
        completedProjects.map((project) => (
          <div
            key={project.id}
            style={{
              ...cardStyle,
              border: "2px solid #facc15",
              background: "linear-gradient(135deg, #fffbea 0%, #ffffff 100%)",
            }}
          >
            <div style={{ marginBottom: "12px" }}>
              <span
                style={{
                  ...badgeStyle,
                  background: "#dcfce7",
                  color: "#166534",
                }}
              >
                Completed Project
              </span>
            </div>

            <h2 style={{ marginTop: 0, marginBottom: "8px", color: "#111827" }}>
              {project.title}
            </h2>

            <p style={{ color: "#4b5563", marginBottom: "14px" }}>
              {project.description}
            </p>

            <p>
              <strong>Developer:</strong> {project.userEmail || "Unknown developer"}
            </p>

            <p>
              <strong>Stage:</strong> {project.stage || "Completed"}
            </p>

            <p>
              <strong>Support Needed:</strong> {project.support || "None"}
            </p>

            <p>
              <strong>Progress:</strong> {project.progress || 100}%
            </p>

            {project.location && (
              <p>
                <strong>Location:</strong> {project.location}
              </p>
            )}

            {project.budget !== undefined && project.budget !== null && (
              <p>
                <strong>Budget:</strong> {project.budget}
              </p>
            )}

            <p>
              <strong>Completed On:</strong> {formatDate(project.completedAt)}
            </p>

            {project.milestones && project.milestones.length > 0 && (
              <div style={{ marginTop: "14px" }}>
                <h4 style={{ marginBottom: "8px" }}>Milestones Achieved</h4>
                <ul style={{ paddingLeft: "20px", margin: 0 }}>
                  {project.milestones.map((milestone) => (
                    <li key={milestone.id} style={{ marginBottom: "8px" }}>
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

                      {milestone.completed && milestone.achievedAt && (
                        <small
                          style={{
                            display: "block",
                            color: "#6b7280",
                            marginTop: "2px",
                          }}
                        >
                          Achieved: {new Date(milestone.achievedAt).toLocaleString()}
                        </small>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <p
              style={{
                marginTop: "16px",
                color: "#16a34a",
                fontWeight: "700",
                fontSize: "16px",
              }}
            >
              ✅ Successfully Completed
            </p>
          </div>
        ))
      )}
    </div>
  );
}