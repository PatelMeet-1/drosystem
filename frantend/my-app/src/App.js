import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./component/Sidebar";
import AddMember from "./component/AddMember";
import PersonalProfile from "./component/personalprofile"; 
import Dro from "./component/Dro";
import Login from "./component/adminlogin";

const PageWrapper = ({ children }) => {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");
  const isAdmin = !!token;
  const isUser = !!user && !token;
  const hasAccess = isAdmin || isUser;

  return (
    <div className="d-flex min-vh-100">
      {hasAccess && <Sidebar />}
      <div className="d-none d-md-block flex-shrink-0" style={{ width: hasAccess ? "250px" : "0" }}></div>
      <div className={`flex-grow-1 p-4 ${hasAccess ? "bg-light" : "bg-white"}`}>
        {children}
      </div>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/add-member" element={<PageWrapper><AddMember /></PageWrapper>} />
        <Route path="/personal-profile" element={<PageWrapper><PersonalProfile /></PageWrapper>} />
        <Route path="/dro" element={<PageWrapper><Dro /></PageWrapper>} />
        <Route path="*" element={<Navigate to="/personal-profile" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
