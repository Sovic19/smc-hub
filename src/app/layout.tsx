import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { DataProvider } from "@/context/DataContext";
import { ToastProvider } from "@/context/ToastContext";
import { CurrentUserProvider } from "@/context/CurrentUserContext";
import { AppShell } from "@/components/layout/AppShell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SMC Hub",
  description: "Internal CRM and player management system for SMC Hockey Agency",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <CurrentUserProvider>
          <DataProvider>
            <ToastProvider>
              <AppShell>{children}</AppShell>
            </ToastProvider>
          </DataProvider>
        </CurrentUserProvider>
      </body>
    </html>
  );
}
