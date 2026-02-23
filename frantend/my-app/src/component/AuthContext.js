import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Page load पर check
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    
    if (token) {
      setIsAuthenticated(true);
      setIsAdmin(true);
    } else if (user) {
      setIsAuthenticated(true);
      setIsAdmin(false);
    }
  }, []);

  const login = (data, isAdminUser) => {
    if (isAdminUser) {
      localStorage.setItem("token", data.token);
      setIsAuthenticated(true);
      setIsAdmin(true);
    } else {
      localStorage.setItem("user", JSON.stringify(data));
      setIsAuthenticated(true);
      setIsAdmin(false);
    }
  };

  const logout = () => {
    localStorage.clear();
    setIsAuthenticated(false);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      isAdmin, 
      login, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
