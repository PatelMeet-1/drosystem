import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaUserShield, FaUser, FaLock } from "react-icons/fa";

const Login = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState(""); // Admin username or User memberId
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("admin"); // default role
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      if (role === "admin") {
        // 👨‍💼 Admin login
        const res = await axios.post("https://drosystem-3.onrender.com/api/admin/login", {
          username,
          password,
        });
        localStorage.setItem("token", res.data.token);
        navigate("/add-member"); // ✅ Admin → Add Member
      } else {
        // 👤 User login - FIXED ROUTE
        const res = await axios.post("https://drosystem-3.onrender.com/api/members/login", {
          memberId: username,
          password,
        });
        localStorage.setItem("user", JSON.stringify(res.data.member));
        navigate("/dro"); // ✅ FIXED: /dro instead of /user-dashboard
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
              {/* Header */}
              <div className="text-center mb-4">
                <div
                  className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                  style={{ width: 60, height: 60 }}
                >
                  {role === "admin" ? <FaUserShield size={28} /> : <FaUser size={28} />}
                </div>
                <h4 className="fw-bold mb-1">{role === "admin" ? "Admin" : "User"} Login</h4>
                <small className="text-muted">Sign in to access dashboard</small>
              </div>

              {/* Role Selector */}
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

              {/* Error Message */}
              {message && <div className="alert alert-danger text-center py-2">{message}</div>}

              {/* Form */}
              <form onSubmit={handleLogin}>
                {/* Username / MemberID */}
                <div className="input-group mb-3">
                  <span className="input-group-text bg-light">
                    <FaUser className="text-secondary" />
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder={role === "admin" ? "Username" : "Member ID"}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>

                {/* Password */}
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

                {/* Submit Button */}
                <button className="btn btn-primary w-100 py-2 fw-semibold" disabled={loading}>
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
            © {new Date().getFullYear()} Panel
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
