import { createMiddlewareClient } from "@/lib/supabase/MiddlewareClient";
import createIntlMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { locales } from "./i18n";
import { INVITATION_TOKEN_KEY } from "./lib/util/invitation";

const handleI18nRouting = createIntlMiddleware({
  locales,
  defaultLocale: "en",
});

export async function middleware(request: NextRequest) {
  const res = handleI18nRouting(request);
  try {
    const { supabase, response } = createMiddlewareClient(request, res);

    // Refresh session if expired - required for Server Components
    // https://supabase.com/docs/guides/auth/auth-helpers/nextjs#managing-session-with-middleware
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user && request.nextUrl.pathname.startsWith("/dashboard")) {
      const requestUrl = new URL(request.url);
      const invitationToken = requestUrl.searchParams.get(INVITATION_TOKEN_KEY);
      if (invitationToken) {
        console.log(
          "Is not logged in, but has invitation token. Redirect to register with invite."
        );

        return NextResponse.redirect(
          new URL(
            `/auth/register?${INVITATION_TOKEN_KEY}=${invitationToken}`,
            request.url
          )
        );
      }

      // redirect to /login
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    return response;
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error with middleware: ", error.name, " ", error.message);
    } else {
      console.log("Error with middleware: ", error);
    }

    if (request.nextUrl.pathname.startsWith("/dashboard")) {
      // redirect to /login
      return NextResponse.redirect(new URL("/?unknown-error", request.url));
    }
    return res;
  }
}

export const config = {
  // Match only internationalized pathnames
  matcher: ["/", "/(de|en)/:path*", "/((?!_next|.*\\..*).*)"],
};
