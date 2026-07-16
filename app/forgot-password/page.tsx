"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Mail, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForgotPasswordMutation } from "@/lib/api/authApi";

const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>({ resolver: zodResolver(forgotPasswordSchema) });

  const onSubmit = async (data: ForgotPasswordForm) => {
    try {
      await forgotPassword(data).unwrap();
      setSubmittedEmail(data.email);
      setSubmitted(true);
    } catch (err: unknown) {
      const msg =
        (err as { data?: { message?: string } })?.data?.message ??
        "Something went wrong. Please try again.";
      toast.error("Request failed", { description: msg });
    }
  };

  // ── Success state ────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Check your inbox
          </h1>
          <p className="text-sm text-muted-foreground mb-1">
            If an account exists for
          </p>
          <p className="text-sm font-semibold text-foreground mb-6">
            {submittedEmail}
          </p>
          <p className="text-xs text-muted-foreground mb-8">
            we&apos;ve sent a link to reset your password. The link expires in
            1 hour.
          </p>
          <Button asChild className="w-full">
            <Link href="/login">Back to Sign In</Link>
          </Button>
          <p className="text-xs text-muted-foreground mt-4">
            Didn&apos;t receive it? Check your spam folder, or{" "}
            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="text-primary hover:underline font-medium"
            >
              try another email
            </button>
            .
          </p>
        </div>
      </div>
    );
  }

  // ── Form ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex items-center gap-2.5 mb-2">
            <Image src="/logo-white-bg.svg" alt="Logo" width={180} height={180} />
          </Link>
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-3">
            <Mail className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            Forgot your password?
          </h1>
          <p className="text-sm text-muted-foreground mt-1 text-center">
            Enter your email and we&apos;ll send you a link to reset it.
          </p>
        </div>

        {/* Card */}
        <div className="border border-border rounded-2xl px-6 py-8">
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

            {/* Submit */}
            <Button type="submit" className="w-full h-10" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Sending link…
                </>
              ) : (
                "Send reset link"
              )}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Remembered your password?{" "}
          <Link
            href="/login"
            className="text-primary font-medium hover:underline"
          >
            Sign in
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
