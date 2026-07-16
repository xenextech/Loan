"use client";
import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useResetPasswordMutation } from "@/lib/api/authApi";

// Mirrors the backend's ResetPasswordDto exactly (auth/dto/reset-password.dto.ts)
// so a request that passes client-side validation never gets rejected server-side.
const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(64, "Password must be at most 64 characters")
      .regex(/[a-z]/, "Must contain at least one lowercase letter")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number")
      .regex(/[@$!%*?&]/, "Must contain at least one special character (@$!%*?&)"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [done, setDone] = useState(false);

  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordForm>({ resolver: zodResolver(resetPasswordSchema) });

  const password = watch("password", "");

  const requirements = [
    { ok: password.length >= 8, label: "At least 8 characters" },
    { ok: /[a-z]/.test(password), label: "One lowercase letter" },
    { ok: /[A-Z]/.test(password), label: "One uppercase letter" },
    { ok: /[0-9]/.test(password), label: "One number" },
    { ok: /[@$!%*?&]/.test(password), label: "One special character (@$!%*?&)" },
  ];

  const onSubmit = async (data: ResetPasswordForm) => {
    try {
      await resetPassword({ token, password: data.password }).unwrap();
      setDone(true);
      toast.success("Password reset successful");
      setTimeout(() => router.push("/login"), 3000);
    } catch (err: unknown) {
      const msg =
        (err as { data?: { message?: string } })?.data?.message ??
        "This link has expired or has already been used.";
      toast.error("Reset failed", { description: msg });
    }
  };

  // ── No token ──────────────────────────────────────────────────────────────
  if (!token) {
    return (
      <div className="bg-card border border-border rounded-2xl p-8 shadow-sm text-center space-y-5">
        <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
          <XCircle className="w-7 h-7 text-destructive" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-foreground mb-1">
            Invalid Link
          </h1>
          <p className="text-sm text-muted-foreground">
            This reset link is missing a token. Please request a new one.
          </p>
        </div>
        <Link href="/forgot-password">
          <Button className="w-full">Request New Link</Button>
        </Link>
      </div>
    );
  }

  // ── Success ───────────────────────────────────────────────────────────────
  if (done) {
    return (
      <div className="bg-card border border-border rounded-2xl p-8 shadow-sm text-center space-y-5">
        <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-7 h-7 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-foreground mb-1">
            Password Reset!
          </h1>
          <p className="text-sm text-muted-foreground">
            Your password has been updated. Redirecting you to sign in…
          </p>
        </div>
        <Link href="/login">
          <Button className="w-full">Sign In Now</Button>
        </Link>
      </div>
    );
  }

  // ── Form ──────────────────────────────────────────────────────────────────
  return (
    <div className="bg-card border border-border rounded-2xl p-8 shadow-sm space-y-5">
      <div className="text-center">
        <h1 className="text-lg font-bold text-foreground mb-1">
          Set a new password
        </h1>
        <p className="text-sm text-muted-foreground">
          Choose a strong password for your account.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {/* New password */}
        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-sm font-medium">
            New password
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
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
            <p className="text-xs text-destructive">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm password */}
        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword" className="text-sm font-medium">
            Confirm new password
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirm ? "text" : "password"}
              autoComplete="new-password"
              placeholder="••••••••"
              className={`pr-10 ${errors.confirmPassword ? "border-destructive" : ""}`}
              {...register("confirmPassword")}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showConfirm ? "Hide password" : "Show password"}
            >
              {showConfirm ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-destructive">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Requirements hint */}
        <ul className="space-y-1">
          {requirements.map(({ ok, label }) => (
            <li
              key={label}
              className={`flex items-center gap-1.5 text-xs transition-colors ${ok ? "text-green-600" : "text-muted-foreground"}`}
            >
              <div className={`w-1 h-1 rounded-full ${ok ? "bg-green-500" : "bg-border"}`} />
              {label}
            </li>
          ))}
        </ul>

        {/* Submit */}
        <Button type="submit" className="w-full h-10" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Resetting…
            </>
          ) : (
            "Reset password"
          )}
        </Button>
      </form>
    </div>
  );
}

function ResetPasswordFallback() {
  return (
    <div className="bg-card border border-border rounded-2xl p-8 shadow-sm text-center space-y-5">
      <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
        <Loader2 className="w-7 h-7 text-primary animate-spin" />
      </div>
      <div>
        <h1 className="text-lg font-bold text-foreground mb-1">Loading…</h1>
        <p className="text-sm text-muted-foreground">Please wait a moment.</p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2.5 mb-2">
            <Image src="/logo-white-bg.svg" alt="Logo" width={180} height={180} />
          </Link>
        </div>

        <Suspense fallback={<ResetPasswordFallback />}>
          <ResetPasswordContent />
        </Suspense>
      </div>
    </div>
  );
}
