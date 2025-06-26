import { Link } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";

const Home = () => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ textAlign: "center", marginTop: "2rem" }}>
      {user ? (
        <>
          <h1>Welcome back, {user.username}!</h1>
          <p>You are successfully logged in.</p>
        </>
      ) : (
        <>
          <p>
            Please <Link to="/login">Log In</Link> or <Link to="/signup">Sign Up</Link> to continue.
          </p>
        </>
      )}
    </div>
  );
};

export default Home;
