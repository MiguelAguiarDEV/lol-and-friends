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
        {screenshotMode ? children : <ClerkProvider>{children}</ClerkProvider>}
      </body>
    </html>
  );
}
