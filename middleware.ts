import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { type NextRequest, NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher(["/admin(.*)"]);
const screenshotMode = process.env.SCREENSHOT_MODE === "true";

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

      await auth.protect();
    });

export default middleware;

/**
 * Configuración de rutas para el middleware.
 * Excluye assets estáticos y `_next`.
 */
export const config = {
  matcher: ["/((?!_next|.*\\..*).*)", "/(api|trpc)(.*)"],
};
