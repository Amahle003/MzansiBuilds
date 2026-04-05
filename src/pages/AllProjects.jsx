import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  addDoc,
  serverTimestamp,
  where,
  getDocs,
} from "firebase/firestore";
import { db, auth } from "../firebase";

export default function AllProjects() {
  const [projects, setProjects] = useState([]);
  const [commentsByProject, setCommentsByProject] = useState({});
  const [requestsByProject, setRequestsByProject] = useState({});
  const [loading, setLoading] = useState(true);
  const [commentInputs, setCommentInputs] = useState({});

  useEffect(() => {
    const q = query(collection(db, "projects"), orderBy("createdAt", "desc"));

    const unsubscribeProjects = onSnapshot(
      q,
      (snapshot) => {
        const projectList = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));
        setProjects(projectList);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching projects:", error);
        setLoading(false);
      }
    );

    const unsubscribeComments = onSnapshot(
      query(collection(db, "comments"), orderBy("createdAt", "asc")),
      (snapshot) => {
        const groupedComments = {};

        snapshot.docs.forEach((docSnap) => {
          const comment = {
            id: docSnap.id,
            ...docSnap.data(),
          };

          if (!groupedComments[comment.projectId]) {
            groupedComments[comment.projectId] = [];
          }

          groupedComments[comment.projectId].push(comment);
        });

        setCommentsByProject(groupedComments);
      },
      (error) => {
        console.error("Error fetching comments:", error);
      }
    );

    const unsubscribeRequests = onSnapshot(
      query(
        collection(db, "collaborationRequests"),
        orderBy("createdAt", "asc")
      ),
      (snapshot) => {
        const groupedRequests = {};

        snapshot.docs.forEach((docSnap) => {
          const request = {
            id: docSnap.id,
            ...docSnap.data(),
          };

          if (!groupedRequests[request.projectId]) {
            groupedRequests[request.projectId] = [];
          }

          groupedRequests[request.projectId].push(request);
        });

        setRequestsByProject(groupedRequests);
      },
      (error) => {
        console.error("Error fetching collaboration requests:", error);
      }
    );

    return () => {
      unsubscribeProjects();
      unsubscribeComments();
      unsubscribeRequests();
    };
  }, []);

  const addComment = async (projectId) => {
    const text = commentInputs[projectId]?.trim();
    if (!text) return;

    try {
      const user = auth.currentUser;
      if (!user) {
        alert("You must be logged in to comment.");
        return;
      }

      await addDoc(collection(db, "comments"), {
        projectId,
        text,
        userId: user.uid,
        userEmail: user.email,
        createdAt: serverTimestamp(),
      });

      setCommentInputs((prev) => ({
        ...prev,
        [projectId]: "",
      }));
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const raiseHand = async (project) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        alert("You must be logged in to request collaboration.");
        return;
      }

      if (user.uid === project.userId) {
        alert("You cannot raise your hand on your own project.");
        return;
      }

      const existingQuery = query(
        collection(db, "collaborationRequests"),
        where("projectId", "==", project.id),
        where("requesterId", "==", user.uid)
      );

      const existingSnapshot = await getDocs(existingQuery);

      if (!existingSnapshot.empty) {
        alert("You have already raised your hand for this project.");
        return;
      }

      await addDoc(collection(db, "collaborationRequests"), {
        projectId: project.id,
        ownerId: project.userId,
        requesterId: user.uid,
        requesterEmail: user.email,
        createdAt: serverTimestamp(),
      });

      alert("Collaboration request sent!");
    } catch (error) {
      console.error("Error sending collaboration request:", error);
    }
  };

  if (loading) {
    return (
      <div style={pageWrapperStyle}>
        <p style={infoTextStyle}>Loading live feed...</p>
      </div>
    );
  }

  return (
    <div style={pageWrapperStyle}>
      <h1 style={titleStyle}>🌍 Live Feed</h1>
      <p style={subtitleStyle}>
        See what other developers are building in public.
      </p>

      {projects.length === 0 ? (
        <div style={cardStyle}>
          <p style={infoTextStyle}>No projects available yet.</p>
        </div>
      ) : (
        projects.map((project) => {
          const isOwner = auth.currentUser?.uid === project.userId;
          const projectComments = commentsByProject[project.id] || [];
          const projectRequests = requestsByProject[project.id] || [];
          const hasRaisedHand = projectRequests.some(
            (request) => request.requesterId === auth.currentUser?.uid
          );

          return (
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

              <div style={metaGridStyle}>
                <div style={metaItemStyle}>
                  <span style={metaLabelStyle}>Developer</span>
                  <span style={metaValueStyle}>
                    {project.userEmail || "Unknown"}
                    {isOwner && (
                      <span style={{ color: "#16a34a", fontWeight: "700" }}>
                        {" "}
                        (You)
                      </span>
                    )}
                  </span>
                </div>

                <div style={metaItemStyle}>
                  <span style={metaLabelStyle}>Stage</span>
                  <span style={badgeStyle}>{project.stage || "Not set"}</span>
                </div>

                <div style={metaItemStyle}>
                  <span style={metaLabelStyle}>Support Needed</span>
                  <span style={metaValueStyle}>{project.support || "None"}</span>
                </div>

                <div style={metaItemStyle}>
                  <span style={metaLabelStyle}>Progress</span>
                  <span style={metaValueStyle}>{project.progress || 0}%</span>
                </div>
              </div>

              <div style={progressTrackStyle}>
                <div style={progressFillStyle(project.progress || 0)} />
              </div>

              <div style={sectionStyle}>
                <h3 style={sectionTitleStyle}>📌 Milestones</h3>
                {project.milestones && project.milestones.length > 0 ? (
                  <ul style={listStyle}>
                    {project.milestones.map((milestone) => (
                      <li key={milestone.id} style={listItemStyle}>
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

              <hr style={dividerStyle} />

              <div style={sectionStyle}>
                <h3 style={sectionTitleStyle}>🤝 Collaboration</h3>

                {isOwner ? (
                  <p style={mutedTextStyle}>This is your project.</p>
                ) : (
                  <button
                    onClick={() => raiseHand(project)}
                    disabled={hasRaisedHand}
                    style={{
                      ...primaryButtonStyle,
                      background: hasRaisedHand ? "#9ca3af" : "#2563eb",
                      cursor: hasRaisedHand ? "not-allowed" : "pointer",
                    }}
                  >
                    {hasRaisedHand ? "Hand Raised" : "Raise Hand to Collaborate"}
                  </button>
                )}

                <p style={{ marginTop: "14px", marginBottom: "10px" }}>
                  <strong>Interested Developers:</strong> {projectRequests.length}
                </p>

                {projectRequests.length > 0 ? (
                  <ul style={listStyle}>
                    {projectRequests.map((request) => (
                      <li key={request.id} style={listItemStyle}>
                        {request.requesterEmail}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={mutedTextStyle}>No collaboration requests yet.</p>
                )}
              </div>

              <hr style={dividerStyle} />

              <div style={sectionStyle}>
                <h3 style={sectionTitleStyle}>💬 Comments</h3>

                <div style={commentInputRowStyle}>
                  <input
                    type="text"
                    placeholder="Write a comment"
                    value={commentInputs[project.id] || ""}
                    onChange={(e) =>
                      setCommentInputs((prev) => ({
                        ...prev,
                        [project.id]: e.target.value,
                      }))
                    }
                    style={inputStyle}
                  />
                  <button
                    onClick={() => addComment(project.id)}
                    style={successButtonStyle}
                  >
                    Add Comment
                  </button>
                </div>

                {projectComments.length > 0 ? (
                  <ul style={listStyle}>
                    {projectComments.map((comment) => (
                      <li key={comment.id} style={commentItemStyle}>
                        <strong>{comment.userEmail}</strong>
                        <p style={{ margin: "6px 0", color: "#111827" }}>
                          {comment.text}
                        </p>
                        <small style={smallTextStyle}>
                          {comment.createdAt?.toDate
                            ? comment.createdAt.toDate().toLocaleString()
                            : "Just now"}
                        </small>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={mutedTextStyle}>No comments yet.</p>
                )}
              </div>
            </div>
          );
        })
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

const metaGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "14px",
  marginBottom: "16px",
};

const metaItemStyle = {
  background: "#f9fafb",
  border: "1px solid #e5e7eb",
  borderRadius: "12px",
  padding: "14px",
};

const metaLabelStyle = {
  display: "block",
  fontSize: "12px",
  fontWeight: "700",
  color: "#6b7280",
  marginBottom: "8px",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

const metaValueStyle = {
  fontSize: "14px",
  color: "#111827",
  fontWeight: "500",
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

const progressTrackStyle = {
  background: "#e5e7eb",
  height: "12px",
  borderRadius: "999px",
  overflow: "hidden",
  marginBottom: "20px",
};

const progressFillStyle = (value) => ({
  width: `${value || 0}%`,
  height: "100%",
  background: value === 100 ? "#16a34a" : "#2563eb",
});

const sectionStyle = {
  marginTop: "8px",
};

const sectionTitleStyle = {
  marginBottom: "12px",
  color: "#111827",
  fontSize: "18px",
};

const dividerStyle = {
  margin: "22px 0",
  border: "none",
  borderTop: "1px solid #e5e7eb",
};

const listStyle = {
  paddingLeft: "20px",
  margin: 0,
};

const listItemStyle = {
  marginBottom: "10px",
  color: "#111827",
};

const commentItemStyle = {
  marginBottom: "14px",
  background: "#f9fafb",
  border: "1px solid #e5e7eb",
  borderRadius: "12px",
  padding: "12px",
  listStyle: "none",
};

const smallTextStyle = {
  display: "block",
  color: "#6b7280",
  marginTop: "4px",
};

const mutedTextStyle = {
  color: "#6b7280",
};

const commentInputRowStyle = {
  display: "flex",
  gap: "10px",
  marginBottom: "14px",
  flexWrap: "wrap",
};

const inputStyle = {
  flex: "1",
  minWidth: "220px",
  padding: "12px 14px",
  borderRadius: "10px",
  border: "1px solid #d1d5db",
  fontSize: "14px",
  boxSizing: "border-box",
};

const primaryButtonStyle = {
  padding: "10px 16px",
  borderRadius: "10px",
  border: "none",
  color: "#ffffff",
  fontWeight: "600",
};

const successButtonStyle = {
  padding: "10px 16px",
  borderRadius: "10px",
  border: "none",
  background: "#16a34a",
  color: "#ffffff",
  cursor: "pointer",
  fontWeight: "600",
};