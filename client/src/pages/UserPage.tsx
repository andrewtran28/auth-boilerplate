import { useState, useEffect, FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function UserPage() {
  const { user, logout } = useAuth();
  const [showDeleteForm, setShowDeleteForm] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [showChangePasswordForm, setShowChangePasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  const handleDeleteAccount = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!deletePassword) {
      setErrorMessage("Enter your password to delete the account.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/users`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password: deletePassword }),
      });

      const data = await response.json();

      if (response.ok) {
        logout();
        navigate("/");
      } else {
        setErrorMessage(data.message || "Failed to delete account");
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      setErrorMessage("An error occurred while deleting your account.");
    } finally {
      setDeletePassword("");
    }
  };

  const handleCancel = () => {
    setShowDeleteForm(false);
    setShowChangePasswordForm(false);
    setDeletePassword("");
    setErrorMessage("");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    setDeletePassword("");
  };

  const handleChangePassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (newPassword !== confirmNewPassword) {
      setErrorMessage("New passwords do not match.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/users`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.message || "Failed to change password.");
      } else {
        setSuccessMessage("Password updated successfully!");
        setTimeout(() => setSuccessMessage(""), 5000);
        setShowChangePasswordForm(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
      }
    } catch (err) {
      setErrorMessage("Current password is incorrect.");
    }
  };

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

          <div className="change-password-form">
            {!showChangePasswordForm && (
              <button onClick={() => setShowChangePasswordForm(true)}>Change Password</button>
            )}

            {showChangePasswordForm && (
              <form onSubmit={handleChangePassword}>
                <h2>Change Password</h2>
                <label>Current Password:</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
                <label>New Password:</label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                <label>Confirm New Password:</label>
                <input
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  required
                />
                <button type="submit">Submit</button>
                <button type="button" onClick={handleCancel}>
                  Cancel
                </button>
              </form>
            )}
          </div>

          <div className="delete-form">
            {!showDeleteForm && (
              <button className="danger" onClick={() => setShowDeleteForm(true)}>
                Delete Account
              </button>
            )}

            {showDeleteForm && (
              <>
                <hr />
                <form onSubmit={handleDeleteAccount}>
                  <h2 className="delete-confirm">Confirm Account Deletion</h2>
                  <div className="delete-cont">
                    <p>Enter your password to delete your account.</p>
                    <input
                      className="delete-input"
                      type="password"
                      placeholder="Your password"
                      value={deletePassword}
                      maxLength={50}
                      onChange={(e) => setDeletePassword(e.target.value)}
                      required
                    />
                    <div>
                      <button className="danger" type="submit">
                        Delete Account
                      </button>
                      <button type="button" onClick={handleCancel}>
                        Cancel
                      </button>
                    </div>
                  </div>
                </form>
              </>
            )}
          </div>

          {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
          {successMessage && <p style={{ color: "green", marginTop: "10px" }}>{successMessage}</p>}
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
}

export default UserPage;
