import { Link } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";

const Home = () => {
  const { user } = useAuth();

  return (
    <>
      {user ? (
        <>
          <h1>
            Welcome back, {user.firstName} {user.lastName}!
          </h1>
          <hr />
          You are logged in as {user.username}.
        </>
      ) : (
        <>
          <h1>No user is currently logged in.</h1>
          <p>
            Please <Link to="/login">Log In</Link> or <Link to="/signup">Sign Up</Link> to continue.
          </p>
        </>
      )}
    </>
  );
};

export default Home;
