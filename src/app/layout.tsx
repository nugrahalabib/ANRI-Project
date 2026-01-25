import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

export const metadata: Metadata = {
  title: "ANRI - Sovereign Risk Intelligence Platform",
  description: "Enterprise-grade AI monitoring and risk intelligence system for the National Archives of the Republic of Indonesia",
  keywords: ["ANRI", "Risk Intelligence", "Document Tracking", "Security", "Compliance"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

