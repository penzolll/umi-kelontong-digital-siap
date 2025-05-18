
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { User } from "@/lib/types";
import { toast } from "sonner";
import { login as apiLogin, register as apiRegister, socialLogin } from "@/lib/api";
import type { LoginFormValues } from "@/components/auth/LoginForm";
import type { RegisterFormValues } from "@/components/auth/RegisterForm";

// Hardcoded admin account for demo
const ADMIN_CREDENTIALS = {
  email: "matdew444@outlook.com",
  password: "123098"
};

/**
 * Custom hook untuk mengelola state dan logika halaman Auth
 */
export function useAuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoggedIn, isAdmin } = useAuth();

  // Get the redirect path from location state
  const from = location.state?.from?.pathname || "/";

  /**
   * Handle login form submission
   */
  const onLoginSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    setLoginError("");
    
    try {
      // For demo purposes, check for admin credentials
      if (values.email === ADMIN_CREDENTIALS.email && 
          values.password === ADMIN_CREDENTIALS.password) {
        
        // Create mock admin login response with properly typed role
        const mockAdminResponse = {
          token: "admin-demo-token",
          user: {
            id: "admin-1",
            name: "Admin User",
            email: ADMIN_CREDENTIALS.email,
            role: "admin" as const
          }
        };
        
        // Use the login function from AuthContext
        login(mockAdminResponse.token, mockAdminResponse.user);
        
        toast.success("Login berhasil sebagai Admin");
        navigate("/admin");
        return;
      }
    
      // For regular users, use the apiLogin function from api.ts
      const response = await apiLogin(values.email, values.password);
      
      // Use the login function from AuthContext
      login(response.token, response.user);
      
      toast.success("Login berhasil");
      navigate(from);
    } catch (error) {
      console.error("Login error:", error);
      setLoginError(error instanceof Error ? error.message : "Email atau password salah");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle register form submission
   */
  const onRegisterSubmit = async (values: RegisterFormValues) => {
    setIsLoading(true);
    setLoginError("");
    
    try {
      // Use the apiRegister function from api.ts
      const response = await apiRegister({
        name: values.name,
        email: values.email,
        password: values.password,
      });
      
      toast.success("Registrasi berhasil! Silahkan login.");
      setIsLogin(true); // Switch to login form
    } catch (error) {
      console.error("Register error:", error);
      setLoginError(error instanceof Error ? error.message : "Registrasi gagal");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle social login
   */
  const handleSocialLogin = async (provider: string) => {
    setIsLoading(true);
    setLoginError("");
    
    try {
      // Use the socialLogin function from api.ts
      const response = await socialLogin(provider);
      
      // Use the login function from AuthContext
      login(response.token, response.user);
      
      toast.success(`Login dengan ${provider} berhasil`);
      
      // Redirect based on user role
      if (response.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate(from);
      }
    } catch (error) {
      console.error(`${provider} login error:`, error);
      setLoginError(error instanceof Error ? error.message : `Login dengan ${provider} gagal`);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLogin,
    setIsLogin,
    isLoading,
    loginError,
    setLoginError,
    onLoginSubmit,
    onRegisterSubmit,
    handleSocialLogin,
    isLoggedIn,
    isAdmin,
    from
  };
}
