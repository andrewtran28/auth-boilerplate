import { useState, useEffect, FormEvent } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [disableSubmit, setDisableSubmit] = useState(false);
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  useEffect(() => {
    if (!loading && user) {
      navigate(from, { replace: true });
    }
  }, [user, loading, navigate, from]);

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      setDisableSubmit(true);
      await login(username, password);
    } catch (error: any) {
      console.error("Login error: ", error);
      setErrorMessage(error.response?.data?.message || "Login failed. Please try again.");
      setPassword("");
    } finally {
      setDisableSubmit(false);
    }
  };

  if (loading || user) return null;

  return (
    <div id="login">
      <h1 id="login-title">Login</h1>
      <form onSubmit={handleLogin}>
        <label htmlFor="username">Username: </label>
        <input type="text" value={username} maxLength={25} onChange={(e) => setUsername(e.target.value)} required />

        <label htmlFor="password">Password: </label>
        <input type="password" value={password} maxLength={50} onChange={(e) => setPassword(e.target.value)} required />

        {errorMessage && (
          <p className="error-message" style={{ color: "red" }}>
            {errorMessage}
          </p>
        )}

        <button type="submit" disabled={disableSubmit}>
          Log In
        </button>
      </form>

      <p>
        Don't have an account? <Link to="/signup">Sign Up</Link>
      </p>
      <p>
        Forgot your password? <Link to="/forgot-password">Reset Password</Link>
      </p>
    </div>
  );
}

export default Login;
