import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/axiosConfig";

function Signup() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    try {
      const response = await api.post("api/users", { username, password, confirmPassword, email });

      if (response.status === 200) {
        navigate("/login");
      }
    } catch (error: any) {
      console.error("Signup error: ", error);
      setErrorMessage(error.response?.data?.message || "Signup failed. Please try again.");
      setUsername("");
      setPassword("");
      setConfirmPassword("");
      setEmail("");
    }
  };

  return (
    <div id="login">
      <h1 id="login-title">Signup</h1>
      <form onSubmit={handleSignup}>
        <label htmlFor="username">Username: </label>
        <input
          type="text"
          id="username"
          value={username}
          maxLength={25}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <label htmlFor="email">Email: </label>
        <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

        <label htmlFor="password">Password: </label>
        <input
          type="password"
          id="password"
          value={password}
          maxLength={50}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <label htmlFor="confirmPassword">Confirm Password: </label>
        <input
          type="password"
          id="confirmPassword"
          value={confirmPassword}
          maxLength={50}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        {errorMessage && (
          <p className="error-message" style={{ color: "red" }}>
            {errorMessage}
          </p>
        )}

        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
}

export default Signup;
