import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function Dashboard() {
  const { user, logout } = useAuth();

  const [profile, setProfile] = useState({
    fullName: "",
    phone: "",
    role: "",
    email: "",
    uid: "",
    createdAt: "",
  });

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setProfile({
            fullName: docSnap.data().fullName || "",
            phone: docSnap.data().phone || "",
            role: docSnap.data().role || "",
            email: docSnap.data().email || user.email || "",
            uid: docSnap.data().uid || user.uid,
            createdAt: docSnap.data().createdAt || "",
          });
        } else {
          const newProfile = {
            fullName: user.displayName || "",
            phone: "",
            role: "",
            email: user.email || "",
            uid: user.uid,
            createdAt: new Date().toISOString(),
          };

          await setDoc(docRef, newProfile);
          setProfile(newProfile);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        setMessage("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleChange = (e) => {
    setProfile((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!user) {
      setMessage("No logged in user found.");
      return;
    }

    try {
      const docRef = doc(db, "users", user.uid);

      await setDoc(
        docRef,
        {
          fullName: profile.fullName,
          phone: profile.phone,
          role: profile.role,
          email: profile.email || user.email || "",
          uid: user.uid,
          createdAt: profile.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      setMessage("Profile updated successfully.");
      setEditMode(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage("Failed to update profile.");
    }
  };

  const formatDate = (value) => {
    if (!value) return "N/A";

    if (typeof value === "string") {
      return new Date(value).toLocaleString();
    }

    if (value?.toDate) {
      return value.toDate().toLocaleString();
    }

    return String(value);
  };

  return (
    <div>
      <h1>📊 Dashboard</h1>

      {loading ? (
        <p>Loading profile...</p>
      ) : (
        <>
          {message && <p>{message}</p>}

          {!editMode ? (
            <div>
              <p><strong>Full Name:</strong> {profile.fullName || "N/A"}</p>
              <p><strong>Email:</strong> {profile.email || "N/A"}</p>
              <p><strong>Phone:</strong> {profile.phone || "N/A"}</p>
              <p><strong>Role:</strong> {profile.role || "N/A"}</p>
              <p><strong>UID:</strong> {profile.uid || "N/A"}</p>
              <p><strong>Created At:</strong> {formatDate(profile.createdAt)}</p>

              <button onClick={() => setEditMode(true)}>Edit Profile</button>
              <button onClick={logout} style={{ marginLeft: "10px" }}>
                Logout
              </button>
            </div>
          ) : (
            <form onSubmit={handleUpdate}>
              <input
                type="text"
                name="fullName"
                placeholder="Full Name"
                value={profile.fullName}
                onChange={handleChange}
              />

              <br /><br />

              <input
                type="text"
                name="phone"
                placeholder="Phone Number"
                value={profile.phone}
                onChange={handleChange}
              />

              <br /><br />

              <select
                name="role"
                value={profile.role}
                onChange={handleChange}
              >
                <option value="">Select role</option>
                <option value="client">Client</option>
                <option value="worker">Worker</option>
              </select>

              <br /><br />

              <input
                type="email"
                value={profile.email}
                disabled
              />

              <br /><br />

              <button type="submit">Save Changes</button>
              <button
                type="button"
                onClick={() => setEditMode(false)}
                style={{ marginLeft: "10px" }}
              >
                Cancel
              </button>
            </form>
          )}
        </>
      )}
    </div>
  );
}