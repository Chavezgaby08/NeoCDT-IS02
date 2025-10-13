import { createContext, useContext, useState } from "react";
import { loginUser } from "../api/authservice.js";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || null);

    const login = async (username, password) => {
        const res = await loginUser(username, password);
        if (res.success) {
            setUser(res.user);
            localStorage.setItem("user", JSON.stringify(res.user));
        }
        return res;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("user");
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
