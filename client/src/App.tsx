import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./utils/AuthContext";
import Header from "./components/Header";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import UserPage from "./pages/UserPage";
import ErrorPage from "./pages/ErrorPage";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            <Route path="/user" element={<ProtectedRoute element={<UserPage />} />} />
            <Route path="*" element={<ErrorPage />} />
          </Routes>
        </main>
      </Router>
    </AuthProvider>
  );
}

export default App;
