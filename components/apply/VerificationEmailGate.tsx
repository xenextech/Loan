"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Mail, ShieldCheck } from "lucide-react";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface VerificationEmailGateProps {
  recipientLabel: string; // e.g. "Parent" or "College"
  verificationCode?: string;
  isLoading?: boolean;
  error?: string | null;
  onConfirm: (email: string) => void;
}

// Shown before any application detail is exposed — the recipient must
// confirm the email address that received the invitation. The backend is
// the actual authority (it validates the email against the invitation
// server-side); this is the "Continue" gate step from the spec, not a
// substitute for that check.
export default function VerificationEmailGate({
  recipientLabel,
  isLoading,
  error,
  onConfirm,
}: VerificationEmailGateProps) {
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);

  const trimmed = email.trim();
  const isValid = EMAIL_RE.test(trimmed);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!isValid || isLoading) return;
    onConfirm(trimmed.toLowerCase());
  };

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <Link href="/">
            <Image src="/logo-white-bg.svg" alt="Cliq Edu Loan" width={140} height={40} />
          </Link>
        </div>
        <Card className="shadow-sm">
          <CardContent className="p-6 space-y-5">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-lg font-bold text-foreground">Confirm Your Email</h1>
              <p className="text-sm text-muted-foreground">
                Please enter the email address that received this {recipientLabel}{" "}
                verification invitation.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="verify-email" className="text-xs">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="verify-email"
                    type="email"
                    autoFocus
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => setTouched(true)}
                    className="pl-9"
                  />
                </div>
                {touched && !isValid && (
                  <p className="text-xs text-destructive">Enter a valid email address.</p>
                )}
              </div>

              {error && (
                <p className="text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <Button type="submit" className="w-full gap-2" disabled={isLoading}>
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Continue
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
