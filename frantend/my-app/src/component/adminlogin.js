import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaUserShield, FaUser, FaLock } from "react-icons/fa";

const API_URL = process.env.REACT_APP_API_URL || "https://drosystem-kjzk.onrender.com";

const Login = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Page load par check karo - agar already logged in hai to redirect
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const user = localStorage.getItem("user");
      const userToken = localStorage.getItem("userToken");
      
      if (token) {
        navigate("/add-member", { replace: true });
      } else if (user || userToken) {
        navigate("/dro", { replace: true });
      }
    };
    
    checkAuth();
  }, [navigate]);

  /* =====================================
     🔐 LOGIN HANDLER
  ===================================== */
  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      if (role === "admin") {
        // 👨‍💼 ADMIN LOGIN
        const res = await axios.post(
          `${API_URL}/api/admin/login`,
          { username, password }
        );

        localStorage.removeItem("user");
        localStorage.removeItem("userToken");
        localStorage.setItem("token", res.data.token);
        navigate("/add-member", { replace: true });
      } else {
        // 👤 USER LOGIN - ✅ Sirf user data, admin token clear
        localStorage.removeItem("token");
        const res = await axios.post(
          `${API_URL}/api/members/login`,
          {
            memberId: username,
            password,
          }
        );

        if (res.data.token) {
          localStorage.setItem("userToken", res.data.token);
        }
        if (res.data.member) {
          localStorage.setItem("user", JSON.stringify(res.data.member));
        }
        navigate("/dro", { replace: true });
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="row w-100 justify-content-center">
        <div className="col-11 col-sm-8 col-md-6 col-lg-4">
          <div className="card border-0 shadow-lg rounded-4">
            <div className="card-body p-4 p-md-5">
              {/* HEADER */}
              <div className="text-center mb-4">
                <div
                  className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                  style={{ width: 60, height: 60 }}
                >
                  {role === "admin" ? (
                    <FaUserShield size={28} />
                  ) : (
                    <FaUser size={28} />
                  )}
                </div>
                <h4 className="fw-bold mb-1">
                  {role === "admin" ? "Admin" : "User"} Login
                </h4>
                <small className="text-muted">
                  Sign in to access dashboard
                </small>
              </div>

              {/* ROLE SELECT */}
              <div className="mb-3 text-center">
                <select
                  className="form-select"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                </select>
              </div>

              {/* ERROR MESSAGE */}
              {message && (
                <div className="alert alert-danger text-center py-2">
                  {message}
                </div>
              )}

              {/* FORM */}
              <form onSubmit={handleLogin}>
                {/* USERNAME / MEMBER ID */}
                <div className="input-group mb-3">
                  <span className="input-group-text bg-light">
                    <FaUser className="text-secondary" />
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder={
                      role === "admin" ? "Username" : "Member ID"
                    }
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>

                {/* PASSWORD */}
                <div className="input-group mb-4">
                  <span className="input-group-text bg-light">
                    <FaLock className="text-secondary" />
                  </span>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                {/* SUBMIT */}
                <button
                  className="btn btn-primary w-100 py-2 fw-semibold"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Logging in...
                    </>
                  ) : (
                    "Login"
                  )}
                </button>
              </form>
            </div>
          </div>

          <p className="text-center text-muted mt-3 small">
            Created by Meet patel
          </p>

        </div>
      </div>
    </div>
  );
};

export default Login;