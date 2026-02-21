import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaBars, FaSignOutAlt, FaUserPlus, FaFileAlt } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";

const Sidebar = () => {
  const [show, setShow] = useState(false);
  const navigate = useNavigate();

  // 🔹 Get role directly from localStorage - FIXED LOGIC
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");
  const isAdmin = !!token;  // Admin if token exists
  const isUser = !!user && !token;  // User if user exists but no token

  // 🔹 Get user name
  let userName = "User";
  if (token) {
    try {
      const adminData = JSON.parse(token);
      userName = adminData.name || adminData.username || "Admin";
    } catch {
      userName = "Admin";
    }
  } else if (user) {
    try {
      const userData = JSON.parse(user);
      userName = userData.name || userData.username || "User";
    } catch {
      userName = "User";
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <>
      {/* 🔹 TOGGLE BUTTON (ONLY MOBILE) */}
      <button
        className="btn btn-light d-md-none position-fixed"
        style={{ top: "15px", left: "15px", zIndex: 1200 }}
        onClick={() => setShow(!show)}
      >
        <FaBars />
      </button>

      {/* 🔹 SIDEBAR */}
      <div
        className={`
          bg-dark text-white p-3
          ${show ? "d-block" : "d-none"}
          d-md-block
        `}
        style={{
          width: "250px",
          height: "100vh",
          position: "fixed",
          top: 0,
          left: 0,
          overflowY: "auto",
          zIndex: 1100,
        }}
      >
        {/* 🔹 USER NAME - TOP */}
        <div className="text-center mb-4 p-3">
          <h5 className="mb-0 text-white-50">{userName}</h5>
        </div>

        <h4 className="text-center mb-4 text-info">
          {isAdmin ? "Admin Panel" : isUser ? "User Panel" : ""}
        </h4>

        <ul className="nav flex-column">
          {/* 🔹 ADMIN ONLY - Add Member */}
          {isAdmin && (
            <li className="nav-item mb-2">
              <Link
                className="nav-link text-white"
                to="/add-member"
                onClick={() => setShow(false)}
              >
                <FaUserPlus className="me-2 text-success" />
                Add Member
              </Link>
            </li>
          )}

          {/* 🔹 DRO - VISIBLE TO BOTH Admin & User */}
          {(isAdmin || isUser) && (
            <li className="nav-item mb-2">
              <Link
                className="nav-link text-white"
                to="/dro"
                onClick={() => setShow(false)}
              >
                <FaFileAlt className="me-2 text-warning" />
                DRO
              </Link>
            </li>
          )}
        </ul>

        {(isAdmin || isUser) && (
          <button className="btn btn-danger w-100 mt-4" onClick={handleLogout}>
            <FaSignOutAlt className="me-2" />
            Logout
          </button>
        )}
      </div>
    </>
  );
};

export default Sidebar;
