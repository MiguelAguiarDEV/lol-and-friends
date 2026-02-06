import { ClerkProvider } from "@clerk/nextjs";
import { auth, currentUser } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppNavbar } from "@/components/layout/app-navbar";
import { isAdminEmail } from "@/lib/auth/admin";
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const navigationState = await getNavigationState();

  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {enableClerk ? (
          <ClerkProvider>
            <AppNavbar {...navigationState} />
            {children}
          </ClerkProvider>
        ) : (
          <>
            <AppNavbar {...navigationState} />
            {children}
          </>
        )}
      </body>
    </html>
  );
}

async function getNavigationState() {
  if (!enableClerk) {
    return { isLoggedIn: false, isAdmin: false, email: undefined };
  }

  const { userId } = await auth();
  if (!userId) {
    return { isLoggedIn: false, isAdmin: false, email: undefined };
  }

  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress ?? undefined;
  return {
    isLoggedIn: true,
    isAdmin: isAdminEmail(email),
    email,
  };
}
