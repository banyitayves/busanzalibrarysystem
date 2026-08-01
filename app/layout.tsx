import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import SearchBar from './components/SearchBar';

// Fonts disabled due to build environment network restrictions
// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

export const metadata: Metadata = {
  title: "GS Busanza Library Management System",
  description: "A streamlined library management system for cataloguing, borrowing, and administration",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <AuthProvider>
          <header className="border-b border-slate-200 bg-white/90 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/85">
            <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
              <div className="flex items-center gap-3 shrink-0">
                <img src="/gs-busanza-logo.svg" alt="GS Busanza logo" className="h-10 w-10 rounded-full border border-slate-200 bg-white p-1" />
                <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">GS Busanza</div>
              </div>
              <div className="flex-1">
                <SearchBar />
              </div>
            </div>
          </header>

          <main className="flex-1">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
