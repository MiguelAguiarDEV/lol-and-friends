import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const screenshotMode = process.env.SCREENSHOT_MODE === "true";
const hasClerkKey = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
const enableClerk = !screenshotMode && hasClerkKey;

export const metadata: Metadata = {
  title: "Reto LoL",
  description: "Reto LoL con amigos — tabla pública y panel de gestión",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {enableClerk ? <ClerkProvider>{children}</ClerkProvider> : children}
      </body>
    </html>
  );
}
