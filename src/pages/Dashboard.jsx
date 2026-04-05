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
    <div style={pageWrapperStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>📊 Dashboard</h1>
        <p style={subtitleStyle}>
          Manage your profile and keep your account information up to date.
        </p>

        {loading ? (
          <p style={infoTextStyle}>Loading profile...</p>
        ) : (
          <>
            {message && (
              <p
                style={{
                  ...messageStyle,
                  color: message.includes("Failed") ? "#dc2626" : "#16a34a",
                  background: message.includes("Failed") ? "#fef2f2" : "#f0fdf4",
                  border: message.includes("Failed")
                    ? "1px solid #fecaca"
                    : "1px solid #bbf7d0",
                }}
              >
                {message}
              </p>
            )}

            {!editMode ? (
              <div>
                <div style={profileGridStyle}>
                  <div style={profileItemStyle}>
                    <span style={labelStyle}>Full Name</span>
                    <span style={valueStyle}>{profile.fullName || "N/A"}</span>
                  </div>

                  <div style={profileItemStyle}>
                    <span style={labelStyle}>Email</span>
                    <span style={valueStyle}>{profile.email || "N/A"}</span>
                  </div>

                  <div style={profileItemStyle}>
                    <span style={labelStyle}>Phone</span>
                    <span style={valueStyle}>{profile.phone || "N/A"}</span>
                  </div>

                  <div style={profileItemStyle}>
                    <span style={labelStyle}>Role</span>
                    <span style={valueStyle}>{profile.role || "N/A"}</span>
                  </div>

                  <div style={profileItemStyle}>
                    <span style={labelStyle}>UID</span>
                    <span style={smallValueStyle}>{profile.uid || "N/A"}</span>
                  </div>

                  <div style={profileItemStyle}>
                    <span style={labelStyle}>Created At</span>
                    <span style={valueStyle}>{formatDate(profile.createdAt)}</span>
                  </div>
                </div>

                <div style={buttonRowStyle}>
                  <button
                    onClick={() => setEditMode(true)}
                    style={primaryButtonStyle}
                  >
                    ✏️ Edit Profile
                  </button>

                  <button onClick={logout} style={dangerButtonStyle}>
                    🚪 Logout
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleUpdate}>
                <div style={fieldGroupStyle}>
                  <label style={labelStyle}>Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Full Name"
                    value={profile.fullName}
                    onChange={handleChange}
                    style={inputStyle}
                  />
                </div>

                <div style={fieldGroupStyle}>
                  <label style={labelStyle}>Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    placeholder="Phone Number"
                    value={profile.phone}
                    onChange={handleChange}
                    style={inputStyle}
                  />
                </div>

                <div style={fieldGroupStyle}>
                  <label style={labelStyle}>Role</label>
                  <select
                    name="role"
                    value={profile.role}
                    onChange={handleChange}
                    style={selectStyle}
                  >
                    <option value="">Select role</option>
                    <option value="client">Client</option>
                    <option value="worker">Worker</option>
                  </select>
                </div>

                <div style={fieldGroupStyle}>
                  <label style={labelStyle}>Email</label>
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    style={{ ...inputStyle, background: "#f3f4f6", cursor: "not-allowed" }}
                  />
                </div>

                <div style={buttonRowStyle}>
                  <button type="submit" style={primaryButtonStyle}>
                    💾 Save Changes
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditMode(false)}
                    style={secondaryButtonStyle}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const pageWrapperStyle = {
  maxWidth: "950px",
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

const infoTextStyle = {
  color: "#4b5563",
  fontSize: "15px",
};

const messageStyle = {
  padding: "12px 14px",
  borderRadius: "10px",
  marginBottom: "20px",
  fontWeight: "500",
};

const profileGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: "16px",
};

const profileItemStyle = {
  background: "#f9fafb",
  border: "1px solid #e5e7eb",
  borderRadius: "14px",
  padding: "16px",
};

const labelStyle = {
  display: "block",
  fontSize: "13px",
  fontWeight: "700",
  color: "#6b7280",
  marginBottom: "8px",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

const valueStyle = {
  color: "#111827",
  fontWeight: "500",
  fontSize: "15px",
};

const smallValueStyle = {
  color: "#111827",
  fontWeight: "500",
  fontSize: "13px",
  wordBreak: "break-all",
};

const fieldGroupStyle = {
  marginBottom: "18px",
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

const buttonRowStyle = {
  display: "flex",
  gap: "12px",
  flexWrap: "wrap",
  marginTop: "24px",
};

const primaryButtonStyle = {
  padding: "12px 18px",
  borderRadius: "10px",
  border: "none",
  background: "#2563eb",
  color: "#ffffff",
  cursor: "pointer",
  fontWeight: "600",
  fontSize: "14px",
};

const secondaryButtonStyle = {
  padding: "12px 18px",
  borderRadius: "10px",
  border: "1px solid #d1d5db",
  background: "#ffffff",
  color: "#111827",
  cursor: "pointer",
  fontWeight: "600",
  fontSize: "14px",
};

const dangerButtonStyle = {
  padding: "12px 18px",
  borderRadius: "10px",
  border: "none",
  background: "#dc2626",
  color: "#ffffff",
  cursor: "pointer",
  fontWeight: "600",
  fontSize: "14px",
};