import { Link } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";

const UserPage = () => {
  const { user } = useAuth();

  return (
    <>
      {user ? (
        <>
          <h1>
            This is the User Page for {user.firstName} ({user.username})!
          </h1>
          <hr />
          <h2>User Information</h2>
          <ul>
            <li>Username: {user.username}</li>
            <li>
              Name: {user.firstName} {user.lastName}
            </li>
            <li>Email: {user.email}</li>
            <li>User ID: {user.id}</li>
            <li>Role: {user.isAdmin ? "Admin" : "User"}</li>
          </ul>
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

export default UserPage;
