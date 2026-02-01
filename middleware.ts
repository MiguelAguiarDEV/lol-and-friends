import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { type NextRequest, NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher(["/admin(.*)"]);
const screenshotMode = process.env.SCREENSHOT_MODE === "true";
const adminEmails = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

/**
 * Middleware de Clerk para proteger rutas admin y aplicar allowlist por email.
 * @param _req - NextRequest entrante (solo usado en modo screenshot).
 * @returns NextResponse o redirección.
 */
const middleware = screenshotMode
  ? (_req: NextRequest) => NextResponse.next()
  : clerkMiddleware(async (auth, req) => {
      if (!isProtectedRoute(req)) {
        return;
      }

      auth.protect();
      if (adminEmails.length === 0) {
        return;
      }

      const email = auth.sessionClaims?.email;
      const normalizedEmail =
        typeof email === "string" ? email.toLowerCase() : "";

      if (!normalizedEmail || !adminEmails.includes(normalizedEmail)) {
        return NextResponse.redirect(new URL("/", req.url));
      }
    });

export default middleware;

/**
 * Configuración de rutas para el middleware.
 * Excluye assets estáticos y `_next`.
 */
export const config = {
  matcher: ["/((?!_next|.*\\..*).*)", "/(api|trpc)(.*)"],
};
