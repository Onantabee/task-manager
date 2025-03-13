import React, { createContext, useState, useEffect, useContext } from "react"; // Add useContext here

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Retrieve user data from sessionStorage on initial load
  const storedUser = JSON.parse(sessionStorage.getItem("user")) || {
    email: null,
    name: null,
    isLoggedIn: false,
  };

  const [isLoggedIn, setIsLoggedIn] = useState(storedUser.isLoggedIn);
  const [userEmail, setUserEmail] = useState(storedUser.email);
  const [userName, setUserName] = useState(storedUser.name);

  // Save user data to sessionStorage whenever it changes
  useEffect(() => {
    const user = {
      email: userEmail,
      name: userName,
      isLoggedIn: isLoggedIn,
    };
    sessionStorage.setItem("user", JSON.stringify(user));
  }, [userEmail, userName, isLoggedIn]);

  const login = (email, name) => {
    setIsLoggedIn(true);
    setUserEmail(email);
    setUserName(name);
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUserEmail(null);
    setUserName(null);
    sessionStorage.removeItem("user"); // Clear user data on logout
  };

  return (
    <AuthContext.Provider value={{ userEmail, userName, isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Export the useAuth hook with useContext
export const useAuth = () => useContext(AuthContext);