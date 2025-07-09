import { useState, FormEvent } from "react";
import { useAuth } from "../utils/AuthContext";

type LoginModalProps = {
  onClose: () => void;
  onError: (error: string) => void;
};

function LoginModal({ onClose, onError }: LoginModalProps) {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [disableSubmit, setDisableSubmit] = useState(false);

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setDisableSubmit(true);
      await login(username, password);
      onClose();
    } catch (error: any) {
      const message = error.response?.data?.message || "Login failed";
      onError(message);
    } finally {
      setDisableSubmit(false);
    }
  };

  return (
    <div className="login-modal">
      <div className="login-modal-content">
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            maxLength={30}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            maxLength={50}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" disabled={disableSubmit}>
            Log In
          </button>
          <button onClick={onClose} style={{ float: "right" }}>
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginModal;
