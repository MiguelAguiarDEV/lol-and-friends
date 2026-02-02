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
        <a
          href="https://github.com/MiguelAguiarDEV/lol-and-friends/issues"
          target="_blank"
          rel="noreferrer"
          className="fixed bottom-4 right-4 z-50 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/95 px-3 py-2 text-xs font-semibold text-gray-900 shadow-sm transition hover:-translate-y-0.5 hover:border-gray-300 hover:bg-white hover:shadow-md active:translate-y-0 active:shadow-sm"
        >
          Feedback
          <span className="text-[10px] font-medium text-gray-500">Issues</span>
        </a>
      </body>
    </html>
  );
}
