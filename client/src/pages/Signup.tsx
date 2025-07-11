import { useState, useEffect, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";
import api from "../utils/axiosConfig";

function Signup() {
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | string[]>("");
  const [disableSubmit, setDisableSubmit] = useState(false);
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [revealPassword, setRevealPassword] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      navigate("/user");
    }
  }, [user, loading, navigate]);

  const handleSignup = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      setDisableSubmit(true);
      const response = await api.post("api/users", { username, password, confirmPassword, firstName, lastName, email });
      setSuccessMessage("Signup successful! Redirecting to login...");
      setErrorMessage("");
      setTimeout(() => navigate("/login"), 5000);
    } catch (error: any) {
      console.error("Signup error:", error);
      const backendErrors = error.response?.data?.errors;
      if (Array.isArray(backendErrors)) {
        setErrorMessage(backendErrors);
      } else {
        setErrorMessage([error.response?.data?.message || "Signup failed. Please try again."]);
      }
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } finally {
      setSuccessMessage("");
      setDisableSubmit(false);
    }
  };

  const toggleRevealPassword = () => {
    setRevealPassword(!revealPassword);
  };

  if (loading || user) return null;

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
          autoComplete="off"
          required
        />

        <label htmlFor="firstName">First Name: </label>
        <input
          type="text"
          id="firstName"
          value={firstName}
          maxLength={30}
          onChange={(e) => setFirstName(e.target.value)}
          autoComplete="off"
          required
        />

        <label htmlFor="lastName">Last Name: </label>
        <input
          type="text"
          id="lastName"
          value={lastName}
          maxLength={30}
          onChange={(e) => setLastName(e.target.value)}
          autoComplete="off"
          required
        />

        <label htmlFor="email">Email: </label>
        <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

        <label htmlFor="password">Password: </label>
        <div className="password-input">
          <input
            type={revealPassword ? "text" : "password"}
            id="password"
            value={password}
            maxLength={50}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="off"
            required
          />
          <button type="button" onClick={toggleRevealPassword}>
            {revealPassword ? "Hide" : "Reveal"}
          </button>
        </div>

        <label htmlFor="confirmPassword">Confirm Password: </label>
        <input
          type={revealPassword ? "text" : "password"}
          id="confirmPassword"
          value={confirmPassword}
          maxLength={50}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="off"
          required
        />

        {successMessage && <p style={{ color: "green", marginTop: "10px" }}>{successMessage}</p>}

        {errorMessage && (
          <ul className="error-message">
            {Array.isArray(errorMessage) ? (
              errorMessage.map((msg, idx) => <li key={idx}>{msg}</li>)
            ) : (
              <li>{errorMessage}</li>
            )}
          </ul>
        )}

        <button type="submit" disabled={successMessage}>
          Sign Up
        </button>
      </form>
    </div>
  );
}

export default Signup;
