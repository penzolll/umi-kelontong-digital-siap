
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface AdminRouteProps {
  children?: React.ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const { isLoggedIn, isAdmin } = useAuth();
  const location = useLocation();

  if (!isLoggedIn) {
    // Redirect to login page but save the location they were trying to access
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    // User is logged in but not an admin, redirect to home
    return <Navigate to="/" replace />;
  }

  return <>{children || <Outlet />}</>;
}
