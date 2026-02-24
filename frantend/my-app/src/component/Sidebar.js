import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaBars, FaSignOutAlt, FaUserPlus, FaFileAlt, FaUser } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";

const Sidebar = () => {
  const [show, setShow] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");
  const isAdmin = Boolean(token);
  const isUser = Boolean(user);

  let userData = null;
  if (user) {
    try {
      userData = JSON.parse(user);
    } catch (e) {
      console.error("User parse error:", e);
    }
  }

  // ✅ FIXED: Page refresh safe auto-logout
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      const navigation = performance.getEntriesByType('navigation')[0];
      
      // Browser/Tab close pe sirf clear karo (reload pe nahi)
      if (navigation?.type !== 'reload') {
        localStorage.clear();
        console.log("🛑 Browser/Tab closed - Auto logout triggered!");
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
    window.location.reload();
  };

  if (!isAdmin && !isUser) {
    return null;
  }

  return (
    <>
      {/* MOBILE TOGGLE */}
      <button
        className="btn btn-light d-md-none position-fixed"
        style={{ top: "15px", left: "15px", zIndex: 1200 }}
        onClick={() => setShow(!show)}
      >
        <FaBars />
      </button>

      {/* SIDEBAR - SAME JSX */}
      <div
        className={`bg-dark text-white p-3 ${show ? "d-block" : "d-none"} d-md-block`}
        style={{
          width: "250px",
          height: "100vh",
          position: "fixed",
          top: 0,
          left: 0,
          overflowY: "auto",
          zIndex: 1100
        }}
      >
        <h4 className="text-center mb-4 text-info">
          {isAdmin ? "🛡️ Admin Panel" : "👤 User Panel"}
        </h4>

        {isUser && userData && (
          <div className="bg-secondary rounded p-3 mb-3">
            <div className="text-center">
              <FaUser className="mb-2" size={40} />
              <h6 className="mb-1">{userData.name || "User"}</h6>
              <small className="text-light">ID: {userData.memberId}</small>
              <br />
              <small className="text-light">📞 {userData.contact || "N/A"}</small>
            </div>
          </div>
        )}

        <ul className="nav flex-column">
          {isAdmin && (
            <li className="nav-item mb-2">
              <Link className="nav-link text-white" to="/add-member" onClick={() => setShow(false)}>
                <FaUserPlus className="me-2 text-success" /> Add Member
              </Link>
            </li>
          )}

          {isUser && (
            <li className="nav-item mb-2">
              <Link className="nav-link text-white" to="/personal-profile" onClick={() => setShow(false)}>
                <FaUser className="me-2 text-info" /> My Profile
              </Link>
            </li>
          )}

          <li className="nav-item mb-2">
            <Link className="nav-link text-white" to="/dro" onClick={() => setShow(false)}>
              <FaFileAlt className="me-2 text-warning" /> DRO
            </Link>
          </li>
        </ul>

        <button className="btn btn-danger w-100 mt-4" onClick={handleLogout}>
          <FaSignOutAlt className="me-2" /> Logout
        </button>
      </div>
    </>
  );
};

export default Sidebar;
