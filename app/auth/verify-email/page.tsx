"use client";
import { Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { GraduationCap, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVerifyEmailQuery } from "@/lib/api/authApi";
import Image from "next/image";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";

  const { isLoading, isSuccess, isError, error } = useVerifyEmailQuery(token, {
    skip: !token,
  });

  useEffect(() => {
    if (!isSuccess) return;
    const t = setTimeout(() => router.push("/login"), 3500);
    return () => clearTimeout(t);
  }, [isSuccess, router]);

  return (
    <div className="bg-card border border-border rounded-2xl p-8 shadow-sm text-center space-y-5">
      {/* No token */}
      {!token && (
        <>
          <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
            <XCircle className="w-7 h-7 text-destructive" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground mb-1">
              Invalid Link
            </h1>
            <p className="text-sm text-muted-foreground">
              This verification link is missing a token. Please use the link
              sent to your email.
            </p>
          </div>
          <Link href="/register">
            <Button className="w-full">Back to Register</Button>
          </Link>
        </>
      )}

      {/* Loading */}
      {token && isLoading && (
        <>
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <Loader2 className="w-7 h-7 text-primary animate-spin" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground mb-1">
              Verifying your email…
            </h1>
            <p className="text-sm text-muted-foreground">
              Please wait a moment.
            </p>
          </div>
        </>
      )}

      {/* Success */}
      {isSuccess && (
        <>
          <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-7 h-7 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground mb-1">
              Email Verified!
            </h1>
            <p className="text-sm text-muted-foreground">
              Your email has been confirmed. Redirecting you to sign in…
            </p>
          </div>
          <Link href="/login">
            <Button className="w-full">Sign In Now</Button>
          </Link>
        </>
      )}

      {/* Error */}
      {isError && (
        <>
          <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
            <XCircle className="w-7 h-7 text-destructive" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground mb-1">
              Verification Failed
            </h1>
            <p className="text-sm text-muted-foreground">
              {(error as { data?: { message?: string } })?.data?.message ??
                "This link has expired or has already been used."}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Link href="/register">
              <Button className="w-full">Create a New Account</Button>
            </Link>
            <Link href="/login">
              <Button variant="ghost" className="w-full">
                Sign In
              </Button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

function VerifyEmailFallback() {
  return (
    <div className="bg-card border border-border rounded-2xl p-8 shadow-sm text-center space-y-5">
      <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
        <Loader2 className="w-7 h-7 text-primary animate-spin" />
      </div>
      <div>
        <h1 className="text-lg font-bold text-foreground mb-1">
          Verifying your email…
        </h1>
        <p className="text-sm text-muted-foreground">Please wait a moment.</p>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex justify-center mb-8">
           <Link href="/" className="flex items-center gap-2.5 mb-2">
              <Image src="/logo-white-bg.svg" alt="Logo" width={180} height={180} />
          </Link>
        </div>

        <Suspense fallback={<VerifyEmailFallback />}>
          <VerifyEmailContent />
        </Suspense>
      </div>
    </div>
  );
}
