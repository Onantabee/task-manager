import { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";

const AuthContext = createContext();

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

const AuthProvider = ({ children }) => {
  const storedUser = JSON.parse(sessionStorage.getItem("user")) || {
    email: null,
    name: null,
    isLoggedIn: false,
    userRole: null,
    userData: null,
  };

  const [isLoggedIn, setIsLoggedIn] = useState(storedUser.isLoggedIn);
  const [userEmail, setUserEmail] = useState(storedUser.email);
  const [userName, setUserName] = useState(storedUser.name);
  const [userRole, setUserRole] = useState(storedUser.userRole);
  const [userData, setUserData] = useState(storedUser.userData);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      if (userEmail) {
        try {
          const response = await axios.get(
            `http://localhost:8080/users/${userEmail}`
          );
          setUserData(response.data);
          setUserName(response.data.name);
          setUserRole(response.data.userRole);

          const user = {
            email: userEmail,
            name: response.data.name,
            isLoggedIn: true,
            userRole: response.data.userRole,
            userData: response.data,
          };
          sessionStorage.setItem("user", JSON.stringify(user));
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };

    fetchUserData();
  }, [userEmail]);

  const login = (email, name) => {
    setIsLoggedIn(true);
    setUserEmail(email);
    setUserName(name);
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUserEmail(null);
    setUserName(null);
    setUserRole(null);
    setUserData(null);
    sessionStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider
      value={{
        userEmail,
        userName,
        isLoggedIn,
        userRole,
        userData,
        isAdmin: userRole === "ADMIN",
        searchTerm,
        setSearchTerm,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider, useAuth };
