import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const isLogin = localStorage.getItem("adminToken");

  return isLogin ? children : <Navigate to="/" />;
};

export default ProtectedRoute;