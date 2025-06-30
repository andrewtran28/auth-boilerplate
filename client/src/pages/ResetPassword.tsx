import { useEffect, useState, FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../utils/axiosConfig";
import { useAuth } from "../utils/AuthContext";

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [username, setUsername] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | string[]>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      navigate("/user");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchUserFromToken = async () => {
      try {
        const response = await api.get(`/api/auth/reset-password/${token}`);
        setUsername(response.data.username);
      } catch (err: any) {
        setErrorMessage("Invalid or expired reset link.");
      }
    };

    if (token) {
      fetchUserFromToken();
    } else {
      setErrorMessage("Reset token is missing.");
    }
  }, [token]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    // if (newPassword !== confirmPassword) {
    //   return setErrorMessage("Passwords do not match.");
    // }

    try {
      const response = await api.post("/api/auth/reset-password", { token, newPassword, confirmPassword });

      setErrorMessage("");
      setSuccessMessage("Password updated successfully! Redirecting to login...");
      setTimeout(() => navigate("/login"), 5000);
    } catch (error: any) {
      console.error(error);

      const errors = error.response?.data?.errors;
      const message = error.response?.data?.message;

      if (Array.isArray(errors)) {
        setErrorMessage(errors);
      } else {
        setErrorMessage(message || "Failed to reset password.");
      }
    }
  };

  if (loading || user) return null;

  return (
    <div id="login">
      <h1 id="login-title">Reset Password</h1>

      <form onSubmit={handleSubmit}>
        <p>
          Resetting password for <strong>{username}</strong>
        </p>

        <label htmlFor="newPassword">New Password:</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          maxLength={50}
        />

        <label htmlFor="confirmPassword">Confirm New Password:</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          maxLength={50}
        />

        <button type="submit" disabled={successMessage}>
          Change Password
        </button>

        {errorMessage && (
          <ul className="error-message">
            {Array.isArray(errorMessage) ? (
              errorMessage.map((msg, idx) => <li key={idx}>{msg}</li>)
            ) : (
              <li>{errorMessage}</li>
            )}
          </ul>
        )}

        {successMessage && <p style={{ color: "green", marginTop: "10px" }}>{successMessage}</p>}
      </form>
    </div>
  );
}

export default ResetPassword;
