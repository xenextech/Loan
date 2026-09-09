"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLoginMutation } from "@/lib/api/authApi";
import { useAppDispatch } from "@/lib/hooks";
import { setCredentials } from "@/lib/store/authSlice";
import { baseApi } from "@/lib/api/baseApi";
import Image from "next/image";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [showPassword, setShowPassword] = useState(false);

  const [login, { isLoading }] = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginForm) => {
    try {
      const result = await login(data).unwrap();

      // Persist token + user to localStorage and Redux
      localStorage.setItem("auth_token", result.accessToken);
      localStorage.setItem("auth_user", JSON.stringify(result.user));

      // Defense-in-depth: wipe any cached query responses from a previous
      // session on this tab (e.g. GET /permissions/me) before the new
      // user's data loads, in case something reached this point without
      // going through performLogout() first (see lib/auth/authActions.ts).
      dispatch(baseApi.util.resetApiState());
      dispatch(
        setCredentials({
          token: result.accessToken,
          user: result.user,
        }),
      );

      toast.success("Welcome back!", {
        description: `Signed in as ${result.user.email}`,
      });

      // Route based on role
      const destination =
        result.user.role === "ADMIN" ? "/admin" :
        result.user.role === "COLLEGE" ? "/college" :
        result.user.role === "INITIATOR" ? "/initiator" :
        result.user.role === "SUPPORTER" ? "/supporter" :
        result.user.role === "CHECKER" ? "/checker" :
        result.user.role === "APPROVER" ? "/approver" :
        result.user.role==="CREDIT_MANAGER" ? "/credit-manager" :
        "/dashboard";
      router.replace(destination);
    } catch (err: unknown) {
      const msg =
        (err as { data?: { message?: string } })?.data?.message ??
        "Invalid email or password.";
      toast.error("Sign in failed", { description: msg });
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex items-center gap-2.5 mb-2">
        <Image src="/logo-white-bg.svg" alt="Logo" width={180} height={180} />
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Sign in to continue your application
          </p>
        </div>

        {/* Card */}
        <div className="border border-border rounded-2xl  px-6 py-8">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5"
            noValidate
          >
            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium">
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className={errors.email ? "border-destructive" : ""}
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={`pr-10 ${errors.password ? "border-destructive" : ""}`}
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <Button type="submit" className="w-full h-10" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Signing in…
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="text-primary font-medium hover:underline"
          >
            Create a account
          </Link>
        </p>

        <p className="text-center mt-4">
          <Link
            href="/"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
