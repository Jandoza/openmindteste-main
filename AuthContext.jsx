import React, { createContext, useState, useContext, useEffect } from "react";
import api from "../services/api";
import { initSocket, disconnectSocket } from "../services/socket";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);

        // Inicializar socket
        initSocket(token);
      } catch (error) {
        console.error("Auth check failed:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  };

  const login = async (email, password, userType) => {
    try {
      const response = await api.post("/auth/login", {
        email,
        password,
        userType,
      });

      const { user: userData, token } = response.data.data;

      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", token);

      // Inicializar socket
      initSocket(token);

      return true;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const register = async (formData) => {
    try {
      const response = await api.post("/auth/register", formData);

      const { user: userData, token } = response.data.data;

      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", token);

      // Inicializar socket
      initSocket(token);

      return true;
    } catch (error) {
      console.error("Register error:", error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    // Desconectar socket
    disconnectSocket();
  };

  const updateUser = (updatedUserData) => {
    setUser(updatedUserData);
    localStorage.setItem("user", JSON.stringify(updatedUserData));
  };

  const value = {
    user,
    login,
    register,
    logout,
    updateUser,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
