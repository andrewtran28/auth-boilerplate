import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";
import LoginModal from "./LoginModal";

function Header() {
  const { user, logout } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const navigate = useNavigate();

  const handleLoginButton = () => {
    // Redirects to /login if Log In button is pressed while modal is open
    if (showLoginModal) {
      setShowLoginModal(false);
      navigate("/login");
    } else {
      setShowLoginModal(true);
    }
  };

  //Redirects to /login with associated error message(s) if login via modal is unsuccessful
  const handleLoginError = (message: string) => {
    setShowLoginModal(false);
    navigate("/login", { state: { errorMessage: message } });
  };

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
            <button onClick={() => handleLoginButton()}>Log In</button>
            <Link to="/signup">
              <button>Sign Up</button>
            </Link>
          </>
        )}
      </div>
      {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} onError={handleLoginError} />}
    </header>
  );
}

export default Header;
