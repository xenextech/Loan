import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

// Precached by the service worker at install time and served as the
// navigation fallback when a page request fails while offline — so it must
// stay fully static (no per-request data) and self-contained (no calls to
// the API host).
export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "You're offline — Edu Loan",
};

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <Image src="/icons/icon-192.png" alt="" width={64} height={64} className="rounded-2xl" />
      <h1 className="text-xl font-semibold text-foreground">You&apos;re offline</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        This page needs an internet connection. Loan applications, documents, and account
        data can&apos;t be loaded until you&apos;re back online.
      </p>
      <Link
        href="/"
        className="mt-2 inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/80"
      >
        Try again
      </Link>
    </div>
  );
}
