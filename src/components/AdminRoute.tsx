
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { toast } from "sonner";

interface AdminRouteProps {
  children?: React.ReactNode;
}

/**
 * Komponen untuk melindungi rute yang memerlukan akses admin
 * Pengguna yang belum login atau bukan admin akan diarahkan ke halaman yang sesuai
 */
export default function AdminRoute({ children }: AdminRouteProps) {
  const { isLoggedIn, isAdmin, refreshUser } = useAuth();
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

  if (!isAdmin) {
    // User is logged in but not an admin, redirect to home
    toast.error("Anda tidak memiliki akses ke halaman ini");
    return <Navigate to="/" replace />;
  }

  return <>{children || <Outlet />}</>;
}
