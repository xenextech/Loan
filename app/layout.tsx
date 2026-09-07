import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import StoreProvider from "@/components/providers/StoreProvider";
import { Toaster } from "@/components/ui/sonner";
import ContactWidget from "@/components/ContactWidget";
import ServiceWorkerRegistration from "@/components/pwa/ServiceWorkerRegistration";
import InstallPrompt from "@/components/pwa/InstallPrompt";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Unnati Edu Loan — Student Loans Made Simple",
  description:
    "Apply for an education loan in minutes. Fast approval, flexible repayment, and transparent terms. Unnati Edu Loan — trusted by 18,000+ students.",
  keywords: [
    "education loan",
    "student loan",
    "Nepal",
    "education finance",
    "Unnati",
  ],
  applicationName: "Edu Loan",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Edu Loan",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Lets fixed/absolute elements read env(safe-area-inset-*) so standalone
  // mode on iOS doesn't tuck content under the notch/home indicator.
  viewportFit: "cover",
  themeColor: "#15C35B",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <StoreProvider>
          {children}
          <Toaster richColors position="top-right" />
          <ContactWidget />
          <InstallPrompt />
          <ServiceWorkerRegistration />
        </StoreProvider>
      </body>
    </html>
  );
}
