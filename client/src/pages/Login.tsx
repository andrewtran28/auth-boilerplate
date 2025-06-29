import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";

function Login() {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      await login(username, password);
      navigate("/");
    } catch (error: any) {
      console.error("Login error: ", error);
      setErrorMessage(error.response?.data?.message || "Login failed. Please try again.");
      setPassword("");
    }
  };

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

        <button type="submit">Log In</button>
      </form>
    </div>
  );
}

export default Login;
