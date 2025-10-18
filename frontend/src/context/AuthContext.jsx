import { createContext, useContext, useState, useEffect } from "react";
import { loginUser, registerUser, logoutUser } from "../api/authservice.js";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null,
  );
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, [token]);

  const login = async (email, password) => {
    const res = await loginUser(email, password);
    if (res.success) {
      setUser(res.user);
      setToken(res.token);
    }
    return res;
  };

  const register = async (userData) => {
    const res = await registerUser(userData);
    return res;
  };

  const logout = () => {
    logoutUser();
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
