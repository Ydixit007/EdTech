import { NextResponse } from "next/server";

// Define routes that don't require authentication
const publicRoutes = [
  "/api/auth/login",
  "/api/auth/signup",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
  "/api/auth/verify",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/",
  "/about",
  "/contact",

  // "course routes",
  "/api/courses/online/all",
  "api/courses/online/:id",
];

// Define routes that require specific roles
const roleBasedRoutes = {
  admin: ["/admin", "/api/admin", "/api/courses/online/create"],
  instructor: ["/instructor", "/api/instructor"],
  student: ["/student", "/api/student"],
};

// Simple JWT decode function (without verification - just for parsing)
function parseJwt(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
}

// Check if token is expired
function isTokenExpired(decodedToken) {
  if (!decodedToken || !decodedToken.exp) {
    return true;
  }
  const currentTime = Math.floor(Date.now() / 1000);
  return decodedToken.exp < currentTime;
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and Next.js internals
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/static/") ||
    pathname.includes(".") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  // Check if the route is public
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Get token from header or cookie
  const token =
    request.headers.get("authorization")?.replace("Bearer ", "") ||
    request.cookies.get("auth-token")?.value;

  if (!token) {
    // Redirect to login for page routes
    if (!pathname.startsWith("/api/")) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Return 401 for API routes
    return NextResponse.json(
      {
        success: false,
        message: "Access denied. No token provided.",
      },
      { status: 401 }
    );
  }

  // Parse token (without verification - just for basic checks)
  const decodedToken = parseJwt(token);

  if (!decodedToken || isTokenExpired(decodedToken)) {
    // Handle expired or invalid tokens
    if (!pathname.startsWith("/api/")) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      loginUrl.searchParams.set("error", "session-expired");
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.json(
      {
        success: false,
        message: "Access denied. Invalid or expired token.",
      },
      { status: 401 }
    );
  }

  // Check role-based access
  const userRole = decodedToken.role;
  let hasRoleAccess = true;

  for (const [role, routes] of Object.entries(roleBasedRoutes)) {
    const matchesRoleRoute = routes.some((route) => pathname.startsWith(route));

    if (matchesRoleRoute && userRole !== role && userRole !== "admin") {
      hasRoleAccess = false;
      break;
    }
  }

  if (!hasRoleAccess) {
    // Redirect to unauthorized page for page routes
    if (!pathname.startsWith("/api/")) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    // Return 403 for API routes
    return NextResponse.json(
      {
        success: false,
        message: "Access denied. Insufficient permissions.",
      },
      { status: 403 }
    );
  }

  // Add user info to request headers for API routes
  const response = NextResponse.next();
  response.headers.set("x-user-id", decodedToken._id);
  response.headers.set("x-user-email", decodedToken.email);
  response.headers.set("x-user-role", decodedToken.role);
  response.headers.set("x-user-token", token);

  return response;
}

// Configure which routes the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
