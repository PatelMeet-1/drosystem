import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./component/Sidebar";
import AddMember from "./component/AddMember";
import Dro from "./component/Dro";
import Login from "./component/adminlogin";
import ProtectedRoute from "./component/ProtectedRoute";

const PageWrapper = ({ children }) => {
  // 🔹 Role Based Logic
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");
  const isAdmin = !!token;
  const isUser = !!user && !token;
  const hasAccess = isAdmin || isUser;

  return (
    <ProtectedRoute>
      <div className="d-flex min-vh-100">
        {/* ✅ Sidebar - Role Based */}
        {hasAccess && <Sidebar />}

        {/* ✅ Spacer - Dynamic Width */}
        <div
          className="d-none d-md-block flex-shrink-0"
          style={{ width: hasAccess ? "250px" : "0" }}
        ></div>

        {/* ✅ Main Content */}
        <div className={`flex-grow-1 p-4 ${hasAccess ? "bg-light" : "bg-white"}`}>
          {children}
        </div>
      </div>
    </ProtectedRoute>
  );
};

const App = () => {
  return (
    <Router>
      <Routes>
        {/* 🔐 Public Login */}
        <Route path="/" element={<Login />} />

        {/* 🔐 Admin & User Protected Routes */}
        <Route
          path="/add-member"
          element={
            <PageWrapper>
              <AddMember />
            </PageWrapper>
          }
        />

        <Route
          path="/dro"
          element={
            <PageWrapper>
              <Dro />
            </PageWrapper>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
