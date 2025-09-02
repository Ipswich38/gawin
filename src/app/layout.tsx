import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "../styles/accessibility.css";
// import { AuthProvider } from "@/contexts/AuthContext";
// import SystemStatusIndicator from "@/components/SystemStatusIndicator";

const inter = Inter({ 
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Gawin AI - Your Intelligent AI Assistant",
  description: "Advanced AI-powered chat assistant for coding, math, writing, learning, and creative projects",
  keywords: "AI assistant, chatbot, coding help, math solver, writing assistant, AI chat",
  authors: [{ name: "Gawin AI Team" }],
  robots: "index, follow",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        {/* TODO: Uncomment when contexts are properly configured */}
        {/* <AuthProvider> */}
          <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            {/* <SystemStatusIndicator /> */}
            <main className="relative">
              {children}
            </main>
          </div>
        {/* </AuthProvider> */}
      </body>
    </html>
  );
}
