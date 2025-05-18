import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Eye, EyeOff, LogIn, UserPlus, AlertCircle, WhatsApp } from "lucide-react";
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
import { login as apiLogin, register as apiRegister, socialLogin } from "@/lib/api";

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

  // Handle register form submission
  const onRegisterSubmit = async (values: z.infer<typeof registerSchema>) => {
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
      // Pre-fill the login form with the registered email
      loginForm.setValue("email", values.email);
    } catch (error) {
      console.error("Register error:", error);
      setLoginError(error instanceof Error ? error.message : "Registrasi gagal");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle social login
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
  
  // Function to render login form
  const renderLoginForm = () => (
    <Form {...loginForm}>
      <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
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

        <Button type="submit" className="w-full h-12" disabled={isLoading}>
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
  );
  
  // Function to render register form
  const renderRegisterForm = () => (
    <Form {...registerForm}>
      <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-6">
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

        <Button type="submit" className="w-full h-12" disabled={isLoading}>
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
  );
  
  // Function to render social login buttons
  const renderSocialButtons = () => (
    <div className="flex flex-col space-y-3 mt-6">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-background px-2 text-muted-foreground">
            Atau {isLogin ? "masuk" : "daftar"} dengan
          </span>
        </div>
      </div>
      
      <Button
        variant="outline"
        type="button"
        disabled={isLoading}
        onClick={() => handleSocialLogin("google")}
        className="h-12"
      >
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
        onClick={() => handleSocialLogin("whatsapp")}
        className="h-12"
      >
        {/* Custom WhatsApp icon since it's not available in lucide-react */}
        <svg 
          className="mr-2 h-5 w-5 text-green-500" 
          fill="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
          />
        </svg>
        Lanjutkan dengan WhatsApp
      </Button>
    </div>
  );

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
                  onClick={() => {
                    setIsLogin(false);
                    setLoginError("");
                  }}
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
                  onClick={() => {
                    setIsLogin(true);
                    setLoginError("");
                  }}
                  className="font-medium text-primary hover:text-primary/90"
                >
                  Masuk
                </button>
              </>
            )}
          </p>
        </div>

        {/* Display login error if any */}
        {loginError && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{loginError}</AlertDescription>
          </Alert>
        )}

        {/* Form Section - Either Login or Register */}
        <div className="mt-8">
          {isLogin ? renderLoginForm() : renderRegisterForm()}
        </div>
        
        {/* Social Login Buttons - Now positioned after the form */}
        {renderSocialButtons()}
      </div>
    </div>
  );
}
