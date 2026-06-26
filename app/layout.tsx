import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import StoreProvider from "@/components/providers/StoreProvider";
import { Toaster } from "@/components/ui/sonner";
import ContactWidget from "@/components/ContactWidget";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GenZ Loan Edu Loan — Student Loans Made Simple",
  description:
    "Apply for an education loan in minutes. Fast approval, flexible repayment, and transparent terms. GenZ Loan Edu Loan — trusted by 18,000+ students.",
  keywords: [
    "education loan",
    "student loan",
    "Nepal",
    "education finance",
    "GenZ Loan",
  ],
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
        </StoreProvider>
      </body>
    </html>
  );
}
