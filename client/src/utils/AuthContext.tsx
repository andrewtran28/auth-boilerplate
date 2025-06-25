import { createContext, useContext, useEffect, useState } from "react";
import axios from "./axiosConfig";

type User = {
  id: string;
  useranme: string;
  isAdmin: boolean;
};

type AuthContextType = {
  user: User | null;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);

  const getCurrentUser = async () => {
    try {
      const res = await axios.get("/api/auth");
      setUser(res.data.user);
    } catch (err) {
      setUser(null);
    }
  };

  const logout = async () => {
    try {
      await axios.delete("/api/auth");
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setUser(null);
    }
  };

  useEffect(() => {
    getCurrentUser();
  }, []);

  return <AuthContext.Provider value={{ user, logout }}>{children}</AuthContext.Provider>;
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export { AuthProvider, useAuth };
