import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthProvider";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login"); // Redirect to login page after logout
  };

  return (
    <nav className="bg-gray-800 p-4 text-white flex justify-between">
      <div className="flex items-center">
        <Link to="/" className="text-lg font-bold mr-4">
          Parking App
        </Link>
      </div>
      <div className="flex items-center space-x-4">
        {user ? (
          <>
            {/* Links visible when logged in */}
            <Link to="/" className="hover:text-gray-400">
              Home
            </Link>
            <button onClick={handleLogout} className="hover:text-gray-400">
              Logout
            </button>
          </>
        ) : (
          <>
            {/* Links visible when not logged in */}
            <Link to="/login" className="hover:text-gray-400">
              Login
            </Link>
            <Link to="/register" className="hover:text-gray-400">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
