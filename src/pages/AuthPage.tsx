
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { SocialLoginButtons } from "@/components/auth/SocialLoginButtons";
import { useAuthPage } from "@/hooks/useAuthPage";

/**
 * Halaman autentikasi (login & register)
 */
export default function AuthPage() {
  const {
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
  } = useAuthPage();
  
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (isLoggedIn) {
      // Redirect admin to admin page, regular users to previous location or home
      const redirectPath = isAdmin ? "/admin" : from;
      navigate(redirectPath, { replace: true });
    }
  }, [isLoggedIn, isAdmin, navigate, from]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/20 py-6 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center">
          <div className="mx-auto flex justify-center mb-2">
            <span className="text-3xl font-bold text-primary mr-2">UMI</span>
            <span className="text-3xl font-bold text-secondary">Store</span>
          </div>
          <h2 className="mt-4 text-xl font-semibold text-gray-900">
            {isLogin ? "Masuk ke akun Anda" : "Buat akun baru"}
          </h2>
          <p className="mt-1 text-sm text-gray-600">
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
          <Alert variant="destructive" className="mt-3">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{loginError}</AlertDescription>
          </Alert>
        )}

        {/* Form Section - Either Login or Register */}
        <div className="mt-4">
          {isLogin ? (
            <LoginForm onSubmit={onLoginSubmit} isLoading={isLoading} />
          ) : (
            <RegisterForm onSubmit={onRegisterSubmit} isLoading={isLoading} />
          )}
          
          {/* Social Login Buttons */}
          <SocialLoginButtons 
            isLogin={isLogin} 
            isLoading={isLoading}
            onSocialLogin={handleSocialLogin}
          />
        </div>
      </div>
    </div>
  );
}
