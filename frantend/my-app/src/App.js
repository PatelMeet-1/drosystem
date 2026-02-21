import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Sidebar from "./component/Sidebar";
import AddMember from "./component/AddMember";
import Dro from "./component/Dro";
import Login from "./component/adminlogin";

// 🔐 Auth Hook - Clean & Reliable
const useAuth = () => {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");
  return {
    isAdmin: !!token,
    isUser: !!user && !token,
    hasAccess: !!token || !!user,
    token,
    user: user ? JSON.parse(user) : null
  };
};

// 🔐 Protected Layout Component
const ProtectedLayout = ({ children }) => {
  const { hasAccess } = useAuth();
  const location = useLocation();

  // Redirect to login if no access
  if (!hasAccess) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return (
    <div className="d-flex min-vh-100">
      {/* ✅ Sidebar - Role Based */}
      <Sidebar />

      {/* ✅ Spacer - Dynamic Width */}
      <div className="d-none d-md-block flex-shrink-0" style={{ width: "250px" }}></div>

      {/* ✅ Main Content */}
      <div className="flex-grow-1 p-3 p-md-4 bg-light">
        {children}
      </div>
    </div>
  );
};

// 🔐 Individual Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { hasAccess } = useAuth();
  const location = useLocation();

  if (!hasAccess) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
};

const App = () => {
  return (
    <Router>
      <Routes>
        {/* 🔓 Public Login Route */}
        <Route path="/" element={<Login />} />

        {/* 🔐 Protected Routes with Layout */}
        <Route 
          path="/add-member" 
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <AddMember />
              </ProtectedLayout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/dro" 
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <Dro />
              </ProtectedLayout>
            </ProtectedRoute>
          } 
        />

        {/* 🔄 Redirect to DRO by default for logged users */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <Dro />
              </ProtectedLayout>
            </ProtectedRoute>
          } 
        />

        {/* 🔄 Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
