import { useState, useEffect, FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";
import api from "../utils/axiosConfig";

function ForgotPassword() {
  const [userInput, setUserInput] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate("/user");
    }
  }, [user, loading, navigate]);

  const handleForgotPassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      await api.post("/api/auth/forgot-password", { userInput });
      setSubmitted(true);
    } catch (error: any) {
      console.error("Password reset request error: ", error);
      setSubmitted(true);
    }
  };

  if (loading || user) return null;

  return (
    <div id="login">
      <h1 id="login-title">Forgot Password</h1>
      {submitted ? (
        <p>
          If an account with that username or email exists, a password reset link has been sent.
          <br />
          Return to <Link to="/">Home</Link>.
        </p>
      ) : (
        <form onSubmit={handleForgotPassword}>
          <label htmlFor="userInput">Username or Email</label>
          <input
            type="text"
            value={userInput}
            maxLength={254}
            onChange={(e) => setUserInput(e.target.value)}
            autoComplete="off"
            required
          />

          {errorMessage && (
            <p className="error-message" style={{ color: "red" }}>
              {errorMessage}
            </p>
          )}

          <button type="submit">Request Password Reset</button>
        </form>
      )}
    </div>
  );
}

export default ForgotPassword;
