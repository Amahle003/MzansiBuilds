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
    return <p>Loading live feed...</p>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>Live Feed</h2>
      <p>See what other developers are building in public.</p>

      {projects.length === 0 ? (
        <p>No projects available yet.</p>
      ) : (
        projects.map((project) => {
          const isOwner = auth.currentUser?.uid === project.userId;
          const projectComments = commentsByProject[project.id] || [];
          const projectRequests = requestsByProject[project.id] || [];
          const hasRaisedHand = projectRequests.some(
            (request) => request.requesterId === auth.currentUser?.uid
          );

          return (
            <div
              key={project.id}
              style={{
                border: "1px solid #ccc",
                borderRadius: "12px",
                padding: "16px",
                marginBottom: "20px",
                backgroundColor: "#fff",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              }}
            >
              <h3 style={{ marginBottom: "8px" }}>{project.title}</h3>
              <p style={{ color: "#555" }}>{project.description}</p>

              <p>
                <strong>Developer:</strong> {project.userEmail || "Unknown"}
                {isOwner && (
                  <span style={{ color: "green", fontWeight: "bold" }}>
                    {" "}
                    (You)
                  </span>
                )}
              </p>

              <p>
                <strong>Stage:</strong> {project.stage || "Not set"}
              </p>

              <p>
                <strong>Support Needed:</strong> {project.support || "None"}
              </p>

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
                />
              </div>

              <div style={{ marginTop: "12px" }}>
                <h4>Milestones</h4>
                {project.milestones && project.milestones.length > 0 ? (
                  <ul style={{ paddingLeft: "20px" }}>
                    {project.milestones.map((milestone) => (
                      <li key={milestone.id} style={{ marginBottom: "8px" }}>
                        <span
                          style={{
                            textDecoration: milestone.completed
                              ? "line-through"
                              : "none",
                            color: milestone.completed ? "gray" : "black",
                          }}
                        >
                          {milestone.text}
                        </span>

                        {milestone.completed && milestone.achievedAt && (
                          <small
                            style={{
                              display: "block",
                              color: "gray",
                              marginTop: "2px",
                            }}
                          >
                            Achieved:{" "}
                            {new Date(milestone.achievedAt).toLocaleString()}
                          </small>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ color: "#666" }}>No milestones yet.</p>
                )}
              </div>

              {project.isCompleted && (
                <p style={{ color: "green", fontWeight: "bold" }}>
                  🎉 Completed Project
                </p>
              )}

              <hr style={{ margin: "16px 0" }} />

              <div style={{ marginBottom: "16px" }}>
                <h4>Collaboration</h4>

                {isOwner ? (
                  <p style={{ color: "#666" }}>This is your project.</p>
                ) : (
                  <button
                    onClick={() => raiseHand(project)}
                    disabled={hasRaisedHand}
                    style={{
                      padding: "8px 14px",
                      border: "none",
                      borderRadius: "8px",
                      cursor: hasRaisedHand ? "not-allowed" : "pointer",
                      background: hasRaisedHand ? "#ccc" : "#2196f3",
                      color: "white",
                    }}
                  >
                    {hasRaisedHand ? "Hand Raised" : "Raise Hand to Collaborate"}
                  </button>
                )}

                <p style={{ marginTop: "10px" }}>
                  <strong>Interested Developers:</strong> {projectRequests.length}
                </p>

                {projectRequests.length > 0 ? (
                  <ul style={{ paddingLeft: "20px" }}>
                    {projectRequests.map((request) => (
                      <li key={request.id}>{request.requesterEmail}</li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ color: "#666" }}>
                    No collaboration requests yet.
                  </p>
                )}
              </div>

              <hr style={{ margin: "16px 0" }} />

              <div>
                <h4>Comments</h4>

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    marginBottom: "12px",
                    flexWrap: "wrap",
                  }}
                >
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
                    style={{
                      flex: "1",
                      minWidth: "220px",
                      padding: "8px",
                    }}
                  />
                  <button
                    onClick={() => addComment(project.id)}
                    style={{
                      padding: "8px 14px",
                      border: "none",
                      borderRadius: "8px",
                      background: "#4caf50",
                      color: "white",
                      cursor: "pointer",
                    }}
                  >
                    Add Comment
                  </button>
                </div>

                {projectComments.length > 0 ? (
                  <ul style={{ paddingLeft: "20px" }}>
                    {projectComments.map((comment) => (
                      <li key={comment.id} style={{ marginBottom: "10px" }}>
                        <strong>{comment.userEmail}:</strong> {comment.text}
                        <small
                          style={{
                            display: "block",
                            color: "gray",
                            marginTop: "2px",
                          }}
                        >
                          {comment.createdAt?.toDate
                            ? comment.createdAt.toDate().toLocaleString()
                            : "Just now"}
                        </small>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ color: "#666" }}>No comments yet.</p>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}