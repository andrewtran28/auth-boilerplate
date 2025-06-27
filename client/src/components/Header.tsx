import { Link } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";

function Header() {
  const { user, logout } = useAuth();

  return (
    <header>
      <Link to="/">Home</Link>
      <div>
        {user ? (
          <>
            <span>Hello, </span>
            <Link to="/user">{user.username}</Link>
            <div>
              <Link to="/user">
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
      </div>
    </header>
  );
}

export default Header;
