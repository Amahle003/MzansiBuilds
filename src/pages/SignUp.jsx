import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useNavigate, Link } from "react-router-dom";

export default function SignUp() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("client");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (!fullName || !phone || !role || !email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        fullName,
        phone,
        role,
        email: user.email,
        createdAt: new Date().toISOString(),
      });

      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
      console.error("Signup error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>📝 Sign Up</h1>

      <form onSubmit={handleSignup}>
        <input
          type="text"
          placeholder="Enter full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />

        <br /><br />

        <input
          type="text"
          placeholder="Enter phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <br /><br />

        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="client">Client</option>
          <option value="worker">Worker</option>
        </select>

        <br /><br />

        <input
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <br /><br />

        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <br /><br />

        <input
          type="password"
          placeholder="Confirm password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <br /><br />

        <button type="submit" disabled={loading}>
          {loading ? "Creating account..." : "Sign Up"}
        </button>
      </form>

      {error && <p>{error}</p>}

      <p>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}