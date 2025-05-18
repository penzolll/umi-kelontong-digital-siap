
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { toast } from "sonner";

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

/**
 * Komponen untuk melindungi rute yang memerlukan autentikasi
 * Pengguna yang belum login akan diarahkan ke halaman login
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isLoggedIn, refreshUser } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Refresh user data to ensure token hasn't expired
    refreshUser();
  }, [refreshUser]);

  if (!isLoggedIn) {
    // Show toast notification
    toast.error("Anda perlu login terlebih dahulu");
    
    // Redirect to login page but save the location they were trying to access
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children || <Outlet />}</>;
}
