import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    if (email && password) {
      localStorage.setItem("userEmail", email);
      navigate("/rooms");
    }
  };

  const handleSignup = () => {
    if (email && password) {
      localStorage.setItem("userEmail", email);
      localStorage.setItem(email + "_rooms", JSON.stringify([]));
      navigate("/rooms");
    }
  };

  return (
    <div className="auth-container">
      <h2>Login or Signup</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <button onClick={handleLogin}>Login</button>
      <button onClick={handleSignup}>Signup</button>
    </div>
  );
};

export default Auth;