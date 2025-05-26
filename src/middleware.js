import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

// Define routes that don't require authentication
const publicRoutes = [
  "/api/auth/login",
  "/api/auth/signup",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/",
  "/about",
  "/contact",
];

// Define routes that require specific roles
const roleBasedRoutes = {
  admin: ["/admin", "/api/admin"],
  instructor: ["/instructor", "/api/instructor"],
  student: ["/student", "/api/student"],
};

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

  try {
    // Verify the token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "defaultJWTSecret"
    );

    // Check role-based access
    const userRole = decoded.role;
    let hasRoleAccess = true;

    for (const [role, routes] of Object.entries(roleBasedRoutes)) {
      const matchesRoleRoute = routes.some((route) =>
        pathname.startsWith(route)
      );

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
    response.headers.set("user-id", decoded._id);
    response.headers.set("user-email", decoded.email);
    response.headers.set("user-role", decoded.role);

    return response;
  } catch (error) {
    console.error("Token verification failed:", error);

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
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public/).*)"],
};
