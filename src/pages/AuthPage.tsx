import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Eye, EyeOff, LogIn, UserPlus, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User } from "@/lib/types";

// Login form schema with validation
const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

// Register form schema with validation
const registerSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  confirmPassword: z.string().min(6, "Password minimal 6 karakter"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Password tidak sama",
  path: ["confirmPassword"],
});

// Define API URL base - change this to your actual backend URL
const API_BASE_URL = "https://api.umistore.com"; // Change this to your actual backend URL

// Hardcoded admin account for demo
const ADMIN_CREDENTIALS = {
  email: "matdew444@outlook.com",
  password: "123098"
};

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoggedIn, isAdmin } = useAuth();

  // Get the redirect path from location state
  const from = location.state?.from?.pathname || "/";
  
  // Redirect if already logged in
  useEffect(() => {
    if (isLoggedIn) {
      // Redirect admin to admin page, regular users to previous location or home
      const redirectPath = isAdmin ? "/admin" : from;
      navigate(redirectPath, { replace: true });
    }
  }, [isLoggedIn, isAdmin, navigate, from]);

  // Initialize login form
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Initialize register form
  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Handle login form submission
  const onLoginSubmit = async (values: z.infer<typeof loginSchema>) => {
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
            role: "admin" as const // Use const assertion to ensure TypeScript treats this as "admin" literal type
          }
        };
        
        // Use the login function from AuthContext
        login(mockAdminResponse.token, mockAdminResponse.user);
        
        toast.success("Login berhasil sebagai Admin");
        navigate("/admin"); // Redirect to admin page
        return;
      }
    
      // For regular users, make API request (in a real implementation)
      // Replace with your API endpoint
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Login gagal");
      }
      
      // Use the login function from AuthContext
      login(data.token, data.user);
      
      toast.success("Login berhasil");
      navigate(from); // Redirect to previous page or homepage
    } catch (error) {
      console.error("Login error:", error);
      setLoginError(error instanceof Error ? error.message : "Email atau password salah");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle register form submission
  const onRegisterSubmit = async (values: z.infer<typeof registerSchema>) => {
    setIsLoading(true);
    
    try {
      // Replace with your API endpoint
      const response = await fetch(`${API_BASE_URL}/api/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          password: values.password,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Registrasi gagal");
      }
      
      toast.success("Registrasi berhasil");
      setIsLogin(true); // Switch to login form
    } catch (error) {
      console.error("Register error:", error);
      toast.error(error instanceof Error ? error.message : "Registrasi gagal");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle social login
  const handleSocialLogin = async (provider: string) => {
    setIsLoading(true);
    
    try {
      // Replace with your API endpoint
      const response = await fetch(`${API_BASE_URL}/api/auth/${provider}`, {
        method: "GET",
        credentials: "include",
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `Login dengan ${provider} gagal`);
      }
      
      // Use the login function from AuthContext
      login(data.token, data.user);
      
      toast.success(`Login dengan ${provider} berhasil`);
      navigate(from); // Redirect to previous page or homepage
    } catch (error) {
      console.error(`${provider} login error:`, error);
      toast.error(error instanceof Error ? error.message : `Login dengan ${provider} gagal`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/20 py-10 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto flex justify-center mb-2">
            <span className="text-4xl font-bold text-primary mr-2">UMI</span>
            <span className="text-4xl font-bold text-secondary">Store</span>
          </div>
          <h2 className="mt-6 text-2xl font-bold text-gray-900">
            {isLogin ? "Masuk ke akun Anda" : "Buat akun baru"}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isLogin ? (
              <>
                Belum punya akun?{" "}
                <button
                  type="button"
                  onClick={() => setIsLogin(false)}
                  className="font-medium text-primary hover:text-primary/90"
                >
                  Daftar sekarang
                </button>
              </>
            ) : (
              <>
                Sudah punya akun?{" "}
                <button
                  type="button"
                  onClick={() => setIsLogin(true)}
                  className="font-medium text-primary hover:text-primary/90"
                >
                  Masuk
                </button>
              </>
            )}
          </p>
        </div>

        {/* Social Login Buttons */}
        <div className="flex flex-col space-y-3">
          <Button
            variant="outline"
            type="button"
            disabled={isLoading}
            onClick={() => handleSocialLogin("google")}
            className="h-12"
          >
            {/* Replace with proper Google icon */}
            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M21.8055 10.0415H21V10H12V14H17.6515C16.827 16.3285 14.6115 18 12 18C8.6865 18 6 15.3135 6 12C6 8.6865 8.6865 6 12 6C13.5295 6 14.921 6.577 15.9805 7.5195L18.809 4.691C17.023 3.0265 14.634 2 12 2C6.4775 2 2 6.4775 2 12C2 17.5225 6.4775 22 12 22C17.5225 22 22 17.5225 22 12C22 11.3295 21.931 10.675 21.8055 10.0415Z"
                fill="#FFC107"
              />
              <path
                d="M3.15295 7.3455L6.43845 9.755C7.32745 7.554 9.48045 6 12 6C13.5295 6 14.921 6.577 15.9805 7.5195L18.809 4.691C17.023 3.0265 14.634 2 12 2C8.15895 2 4.82795 4.1685 3.15295 7.3455Z"
                fill="#FF3D00"
              />
              <path
                d="M12 22C14.583 22 16.93 21.0115 18.7045 19.404L15.6095 16.785C14.5718 17.5742 13.3038 18.0011 12 18C9.39903 18 7.19053 16.3415 6.35853 14.027L3.09753 16.5395C4.75253 19.778 8.11353 22 12 22Z"
                fill="#4CAF50"
              />
              <path
                d="M21.8055 10.0415H21V10H12V14H17.6515C17.2571 15.1082 16.5467 16.0766 15.608 16.7855L15.6095 16.7845L18.7045 19.4035C18.4855 19.6025 22 17 22 12C22 11.3295 21.931 10.675 21.8055 10.0415Z"
                fill="#1976D2"
              />
            </svg>
            Lanjutkan dengan Google
          </Button>

          <Button
            variant="outline"
            type="button"
            disabled={isLoading}
            onClick={() => handleSocialLogin("apple")}
            className="h-12"
          >
            {/* Apple icon */}
            <svg className="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16.5,3C14.76,3 13.09,4 12,4.67C10.91,4 9.24,3 7.5,3C4.42,3 2,5.41 2,8.5C2,12.27 5.4,15.36 10.55,20.03L12,21.35L13.45,20.03C18.6,15.36 22,12.27 22,8.5C22,5.41 19.58,3 16.5,3Z" />
            </svg>
            Lanjutkan dengan Apple
          </Button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-background px-2 text-muted-foreground">
              Atau {isLogin ? "masuk" : "daftar"} dengan email
            </span>
          </div>
        </div>

        {/* Display login error if any */}
        {loginError && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{loginError}</AlertDescription>
          </Alert>
        )}

        {/* Login Form */}
        {isLogin ? (
          <Form {...loginForm}>
            <form
              onSubmit={loginForm.handleSubmit(onLoginSubmit)}
              className="space-y-6"
            >
              <FormField
                control={loginForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="nama@email.com"
                        type="email"
                        autoComplete="email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={loginForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="Masukkan password"
                          type={showPassword ? "text" : "password"}
                          autoComplete="current-password"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center justify-end">
                <div className="text-sm">
                  <a
                    href="#"
                    className="font-medium text-primary hover:text-primary/90"
                  >
                    Lupa password?
                  </a>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-background border-t-transparent rounded-full"></div>
                    Memproses...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <LogIn className="mr-2 h-4 w-4" /> Masuk
                  </div>
                )}
              </Button>
            </form>
          </Form>
        ) : (
          /* Register Form */
          <Form {...registerForm}>
            <form
              onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
              className="space-y-6"
            >
              <FormField
                control={registerForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Lengkap</FormLabel>
                    <FormControl>
                      <Input placeholder="Nama lengkap" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={registerForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="nama@email.com"
                        type="email"
                        autoComplete="email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={registerForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="Buat password"
                          type={showPassword ? "text" : "password"}
                          autoComplete="new-password"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={registerForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Konfirmasi Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="Konfirmasi password"
                          type={showConfirmPassword ? "text" : "password"}
                          autoComplete="new-password"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full h-12"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-background border-t-transparent rounded-full"></div>
                    Memproses...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <UserPlus className="mr-2 h-4 w-4" /> Daftar
                  </div>
                )}
              </Button>
            </form>
          </Form>
        )}
      </div>
    </div>
  );
}
