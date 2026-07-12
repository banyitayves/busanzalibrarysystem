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
  title: "Library Management System",
  description: "A streamlined library management system for cataloguing, borrowing, and administration",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <header className="bg-white border-b">
            <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
              <div className="text-lg font-semibold">Library</div>
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
