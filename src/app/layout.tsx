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
  title: "KreativLoops AI - Advanced AI Education Platform",
  description: "Comprehensive AI-powered learning platform with coding, robotics, and tutoring tools",
  keywords: "AI education, coding bootcamp, robotics, tutoring, Singapore education",
  authors: [{ name: "KreativLoops AI Team" }],
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
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
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
