import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from '@/components/providers/auth-provider'
import { Header } from '@/components/ui/header'
import { PulsarFooter } from '@/components/pulsar-footer'
import { MobileBottomNav } from '@/components/mobile-bottom-nav'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pulsar Playgrounds",
  description: "Where Speed Meets Creativity - AI-powered creative platform for motorcycle enthusiasts",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <AuthProvider>
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <PulsarFooter />
          <MobileBottomNav />
        </AuthProvider>
      </body>
    </html>
  );
}
