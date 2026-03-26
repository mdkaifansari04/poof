"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/poof/logo";
import { GlassCard } from "@/components/poof/glass-card";
import { AnimatedBackground } from "@/components/poof/animated-background";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Loader2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Mock validation
    if (!email || !password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    setLoading(false);
    setSuccess(true);

    // Redirect after success animation
    setTimeout(() => {
      router.push("/dashboard");
    }, 1000);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    // Simulate OAuth redirect
    await new Promise((resolve) => setTimeout(resolve, 1000));
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-poof-base flex items-center justify-center p-4">
      <AnimatedBackground />

      <div className="relative z-10 w-full max-w-md">
        <GlassCard className="p-8" hover={false}>
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Logo size="lg" />
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="font-heading font-extrabold text-3xl text-white mb-2">
              Welcome back.
            </h1>
            <p className="text-poof-mist text-sm">Good to see you again.</p>
          </div>

          {/* Google OAuth */}
          <Button
            type="button"
            variant="outline"
            className="w-full text-white hover:text-gray-100 border-0 btn-press mb-6"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </Button>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-transparent text-poof-mist">or</span>
            </div>
          </div>

          {/* Login form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm text-poof-mist">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={cn(
                  "bg-white/5 border-white/10 text-white placeholder:text-poof-mist/50 focus-ring",
                  error && !email && "border-red-500 shake",
                )}
                disabled={loading || success}
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm text-poof-mist">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className={cn(
                    "bg-white/5 border-white/10 text-white placeholder:text-poof-mist/50 pr-10 focus-ring",
                    error && !password && "border-red-500 shake",
                  )}
                  disabled={loading || success}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-poof-mist hover:text-white transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember me & Forgot password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) =>
                    setRememberMe(checked as boolean)
                  }
                  className="border-white/20 data-[state=checked]:bg-poof-accent data-[state=checked]:border-poof-accent"
                />
                <label
                  htmlFor="remember"
                  className="text-sm text-poof-mist cursor-pointer"
                >
                  Remember me
                </label>
              </div>
              <Link
                href="/forgot-password"
                className="text-sm text-poof-violet hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            {/* Error message */}
            {error && (
              <div className="text-red-400 text-sm animate-fade-up">
                {error}
              </div>
            )}

            {/* Submit button */}
            <Button
              type="submit"
              className={cn(
                "w-full btn-press transition-all duration-300",
                success
                  ? "bg-poof-mint hover:bg-poof-mint"
                  : "bg-poof-accent hover:bg-poof-accent/90",
              )}
              disabled={loading || success}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Logging in...
                </>
              ) : success ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Success!
                </>
              ) : (
                "Log in"
              )}
            </Button>
          </form>

          {/* Magic link option */}
          <div className="mt-4 text-center">
            <Link
              href="/magic-link"
              className="text-sm text-poof-mist hover:text-poof-violet transition-colors"
            >
              Prefer a magic link?
            </Link>
          </div>

          {/* Sign up link */}
          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <p className="text-sm text-poof-mist">
              {"Don't have an account? "}
              <Link
                href="/signup"
                className="text-poof-violet hover:underline inline-flex items-center gap-1 group"
              >
                Sign up
                <span className="transition-transform group-hover:translate-x-0.5">
                  &rarr;
                </span>
              </Link>
            </p>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
