import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Outlet } from "react-router-dom";

import Sidebar from "./component/Sidebar";
import AddMember from "./component/AddMember";
import PersonalProfile from "./component/personalprofile";
import Dro from "./component/Dro";
import Login from "./component/adminlogin";

// 🔐 AUTH HELPERS - ✅ userToken bhi check karo
const isAdmin = () => Boolean(localStorage.getItem("token"));
const isUser  = () => Boolean(localStorage.getItem("user") || localStorage.getItem("userToken"));

// 📦 EK HI LAYOUT - Sidebar sirf ek baar, navigation par same sidebar (dusri nahi)
const ProtectedLayout = () => {
  return (
    <div className="d-flex min-vh-100">
      <Sidebar />
      <div className="d-none d-md-block" style={{ width: "250px" }} />
      <div className="flex-grow-1 p-4 bg-light">
        <Outlet />
      </div>
    </div>
  );
};

// 🚦 PROTECTED ROUTE (ONLY ONE)
const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  
  // ✅ Check authentication
  const admin = isAdmin();
  const user = isUser();
  
  if (admin || user) {
    return children;
  }
  
  // ✅ Agar logged in nahi hai, to login page par redirect
  return <Navigate to="/" state={{ from: location }} replace />;
};

// ✅ Login Route Protection - Agar already logged in hai to redirect
const PublicRoute = ({ children }) => {
  const admin = isAdmin();
  const user = isUser();
  
  if (admin) {
    return <Navigate to="/add-member" replace />;
  }
  
  if (user) {
    return <Navigate to="/dro" replace />;
  }
  
  return children;
};

const App = () => {
  return (
    <Router>
      <Routes>
        {/* PUBLIC - ✅ Login page ko bhi protect karo */}
        <Route 
          path="/" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />

        {/* PROTECTED - ek layout, ek sidebar, sirf content badalta hai */}
        <Route element={<ProtectedRoute><ProtectedLayout /></ProtectedRoute>}>
          <Route path="/add-member" element={<AddMember />} />
          <Route path="/personal-profile" element={<PersonalProfile />} />
          <Route path="/dro" element={<Dro />} />
        </Route>

        {/* FALLBACK */}
        <Route
          path="*"
          element={
            <Navigate
              to={
                isAdmin()
                  ? "/add-member"
                  : isUser()
                  ? "/dro"
                  : "/"
              }
              replace
            />
          }
        />
      </Routes>
    </Router>
  );
};

export default App;