import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/LogIn";
import Register from "./pages/Register";
import { useAuth } from "./AuthProvider";

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <Routes>
        {/* If the user is logged in, render Home, Logout, or any restricted page */}
        {user ? (
          <>
            <Route path="/" element={<Home />} />
            <Route path="/logout" element={<Navigate to="/login" />} />
          </>
        ) : (
          // If not logged in, render Login or Register pages
          <>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </>
        )}
        {/* Default route for logged-in users */}
        <Route path="*" element={<Navigate to={user ? "/" : "/login"} />} />
      </Routes>
    </>
  );
}

export default App;
