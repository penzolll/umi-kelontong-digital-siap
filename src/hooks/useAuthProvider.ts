
import { useState, useEffect } from "react";
import { User } from "@/lib/types";
import { toast } from "sonner";
import { clearApiCache } from "@/lib/api";

// Authentication storage keys
const TOKEN_STORAGE_KEY = "auth-token";
const USER_STORAGE_KEY = "user";

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
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    const userStr = localStorage.getItem(USER_STORAGE_KEY);
    
    if (token && userStr) {
      try {
        const userData = JSON.parse(userStr);
        setUser(userData);
        setIsLoggedIn(true);
        setIsAdmin(userData.role === "admin");
      } catch (error) {
        console.error("Error parsing user data:", error);
        // Clear invalid data
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        localStorage.removeItem(USER_STORAGE_KEY);
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
    // Ensure role is set
    if (!userData.role) {
      userData.role = "customer";
    }

    // Store auth data
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
    
    // Update state
    setUser(userData);
    setIsLoggedIn(true);
    setIsAdmin(userData.role === "admin");
    
    // Clear API cache on login to ensure fresh data
    clearApiCache();
    
    toast.success(`Selamat datang, ${userData.name}`);
  };

  /**
   * Logout user dan menghapus data dari localStorage
   */
  const logout = () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem("cart");
    
    setUser(null);
    setIsLoggedIn(false);
    setIsAdmin(false);
    
    // Clear API cache on logout to ensure fresh data
    clearApiCache();
    
    toast.info("Anda telah keluar dari sistem");
  };

  useEffect(() => {
    // Check if user is already logged in on mount
    refreshUser();
  }, []);

  return { user, isLoggedIn, isAdmin, login, logout, refreshUser };
}
