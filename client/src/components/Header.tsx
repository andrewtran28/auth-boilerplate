import { Link } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";

function Header() {
  const { user, logout } = useAuth();

  return (
    <header>
      <Link to="/">Home</Link>
      {user ? (
        <>
          <span>Hello, </span>
          <Link to={`/users`}>{user.username}</Link>
          <div>
            <Link to={`/users`}>
              <button>Your Account</button>
            </Link>
            <button onClick={logout}>Logout</button>
          </div>
        </>
      ) : (
        <>
          <Link to="/login">
            <button>Login</button>
          </Link>
          <Link to="/signup">
            <button>Sign Up</button>
          </Link>
        </>
      )}
    </header>
  );
}

export default Header;
