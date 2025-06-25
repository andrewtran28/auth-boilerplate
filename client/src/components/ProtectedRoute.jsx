import { ReactElement } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";

const ProtectedRoute = (element) => {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  return user ? element : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
