
import { useState, useEffect } from "react";
import { User } from "@/lib/types";
import { toast } from "sonner";

// Hardcoded admin account for demo purposes
const ADMIN_ACCOUNT = {
  email: "matdew444@outlook.com",
  password: "123098",
  id: "admin-1",
  name: "Admin User",
  role: "admin" as const
};

/**
 * Custom hook untuk menyediakan fungsionalitas autentikasi
 * @returns {Object} Objek yang berisi state dan fungsi autentikasi
 */
export function useAuthProvider() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  /**
   * Memperbarui data user dari localStorage
   */
  const refreshUser = () => {
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
        toast.error("Sesi login habis, silakan login kembali");
      }
    }
  };

  /**
   * Login user dan menyimpan data di localStorage
   * @param {string} token - Token autentikasi
   * @param {User} userData - Data user
   */
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
    toast.success(`Selamat datang, ${userData.name}`);
  };

  /**
   * Logout user dan menghapus data dari localStorage
   */
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("cart");
    setUser(null);
    setIsLoggedIn(false);
    setIsAdmin(false);
    toast.info("Anda telah keluar dari sistem");
  };

  useEffect(() => {
    // Check if user is already logged in on mount
    refreshUser();
  }, []);

  return { user, isLoggedIn, isAdmin, login, logout, refreshUser };
}
