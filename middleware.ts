import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/middleware';
import { getLogger } from '@/utils/logging/logger';

const logger = getLogger('middleware');

export async function middleware(req: NextRequest) {
  try {
    // This `try/catch` block is only here for the interactive tutorial.
    // Feel free to remove once you have Supabase connected.
    const { supabase, response } = createClient(req);

    // Refresh session if expired - required for Server Components
    // https://supabase.com/docs/guides/auth/auth-helpers/nextjs#managing-session-with-middleware
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const PUBLIC_PATHS = [
      '/login',
      '/logout',
      '/search',
      '/password',
      '/logo.svg',
      '/clap.svg',
      '/logo.svg',
      '/favicon.ico',
      '/_next/static',
      '/api/stripe/webhook',
      '/api/location-autocomplete',
    ];

    const isPublicPath =
      PUBLIC_PATHS.some(pathRoot => req.nextUrl.pathname.includes(pathRoot)) || req.nextUrl.pathname === '/';

    const protectedPath = !isPublicPath && req.nextUrl.pathname !== '/login';

    // If not logged in, you can only view public paths
    if (!session && protectedPath) {
      logger.info(`No session found, redirecting from ${req.url} to /login`);
      return NextResponse.redirect(`${req.nextUrl.origin}/login`);
    }

    // if (req.nextUrl.pathname === '/') {
    //   return NextResponse.redirect(`${req.nextUrl.origin}/search`);
    // }

    return response;
  } catch (e) {
    // If you are here, a Supabase client could not be created!
    // This is likely because you have not set up environment variables.
    // Check out http://localhost:3000 for Next Steps.
    return NextResponse.next({
      request: {
        headers: req.headers,
      },
    });
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
