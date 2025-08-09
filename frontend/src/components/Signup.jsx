import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const handleSignup = async () => {
    setError("");
    if (!name || !email || !password || password !== confirm) {
      setError("Please fill all fields and confirm your password.");
      return;
    }
    try {
      const res = await fetch(`${backendUrl}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("userName", name);
        localStorage.setItem("userEmail", email);
        navigate("/home");
      } else {
        setError(data.error || "Signup failed");
      }
    } catch {
      setError("Network error");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Signup</h2>
        <input type="text" placeholder="Enter your name" value={name} onChange={e => setName(e.target.value)} />
        <input type="email" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} />
        <input type="password" placeholder="Create a password" value={password} onChange={e => setPassword(e.target.value)} />
        <input type="password" placeholder="Confirm your password" value={confirm} onChange={e => setConfirm(e.target.value)} />
        {error && <p style={{ color: "red", marginBottom: "1rem" }}>{error}</p>}
        <button onClick={handleSignup} disabled={!name || !email || !password || password !== confirm}>
          Signup
        </button>
        <p>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;