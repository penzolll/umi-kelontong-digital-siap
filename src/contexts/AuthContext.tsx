
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@/lib/types";

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hardcoded admin account for demo purposes
const ADMIN_ACCOUNT = {
  email: "matdew444@outlook.com",
  password: "123098",
  id: "admin-1",
  name: "Admin User",
  role: "admin" as const
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    
    if (token && userStr) {
      try {
        const userData = JSON.parse(userStr);
        setUser(userData);
        setIsLoggedIn(true);
        setIsAdmin(userData.role === "admin");
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
  }, []);

  const login = (token: string, userData: User) => {
    // Check if this is the admin account (simplified for demo)
    if (userData.email === ADMIN_ACCOUNT.email) {
      userData = {
        ...userData,
        role: "admin",
        id: ADMIN_ACCOUNT.id,
        name: ADMIN_ACCOUNT.name
      };
    } else if (!userData.role) {
      userData.role = "customer";
    }

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    setIsLoggedIn(true);
    setIsAdmin(userData.role === "admin");
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setIsLoggedIn(false);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  return context;
}
