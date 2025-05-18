
import { createContext, useContext, ReactNode } from "react";
import { User } from "@/lib/types";
import { useAuthProvider } from "@/hooks/useAuthProvider";

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Provider untuk autentikasi aplikasi
 * @param {ReactNode} children - Child components
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const authValues = useAuthProvider();
  
  return (
    <AuthContext.Provider value={authValues}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook untuk mengakses konteks autentikasi
 * @returns {AuthContextType} Objek yang berisi state dan fungsi autentikasi
 */
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  return context;
}
