"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { GraduationCap, Loader2, ShieldX } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import CheckerSidebar from "@/components/checker/CheckerSidebar";

type Gate = "checking" | "denied" | "ok";

export default function CheckerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [gate, setGate] = useState<Gate>("checking");

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    const raw = localStorage.getItem("auth_user");

    if (!token || !raw) {
      toast.error("Please sign in to continue.");
      router.replace("/login");
      return;
    }

    try {
      const user = JSON.parse(raw);
      if (user?.role === "CHECKER" || user?.role === "CREDIT_MANAGER" || user?.role === "ADMIN") {
        setGate("ok");
      } else {
        setGate("denied");
        toast.error("Access denied", {
          description:
            "The checker portal is restricted to authorized staff only.",
          duration: 5000,
        });
      }
    } catch {
      toast.error("Session invalid. Please sign in again.");
      router.replace("/login");
    }
  }, [router]);

  if (gate === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-primary" />
          </div>
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          <p className="text-xs text-muted-foreground">Verifying access…</p>
        </div>
      </div>
    );
  }

  if (gate === "denied") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
        <div className="flex flex-col items-center gap-5 text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center">
            <ShieldX className="w-8 h-8 text-destructive" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground mb-1">
              Access Restricted
            </h1>
            <p className="text-sm text-muted-foreground">
              The checker portal is only accessible to authorized Unnati
              staff.
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/">
              <Button variant="outline" size="sm">
                Go Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-muted/30 min-h-screen lg:h-screen lg:overflow-hidden">
      <CheckerSidebar />
      <main className="flex-1 min-w-0 overflow-y-auto pt-14 lg:pt-0">
        {children}
      </main>
    </div>
  );
}
