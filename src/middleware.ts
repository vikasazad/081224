// import { auth } from "./auth";
// import { routeGroups, apiauthPrefix } from "../routes";

// export default auth((req) => {
//   console.log("=========== Middleware Triggered ===========");
//   console.log("Request Auth:", req.auth);
//   const { nextUrl } = req;
//   const user = req.auth?.user;
//   const isLoggedIn = !!req.auth;
//   const newUser = user?.newUser;
//   const role = user?.role;
//   const path = nextUrl.pathname;

//   console.log("User Info:", { user, isLoggedIn, newUser, role });
//   console.log("Request Path:", path);

//   const {
//     publicRoutes,
//     authRoutes,
//     onboardingRoutes,
//     staffRoutes,
//     managerRoutes,
//   } = routeGroups;

//   // Function to handle role-based redirection
//   const handleRoleRedirection = () => {
//     console.log("Handling Role Redirection for Role:", role);

//     if (role === "admin") {
//       console.log("Redirecting to Admin Dashboard");
//       return Response.redirect(new URL("/dashboard", nextUrl));
//     } else if (role === "staff" && !staffRoutes.includes(path)) {
//       console.log("Redirecting to Staff Dashboard");
//       return Response.redirect(new URL("/staff", nextUrl));
//     } else if (role === "manager" && !managerRoutes.includes(path)) {
//       console.log("Redirecting to Manager/Staff Dashboard");
//       return Response.redirect(new URL("/staff", nextUrl)); // Same for staff and manager
//     }
//     console.log("No Redirection Required");
//   };

//   // Handle API auth routes first
//   if (path.startsWith(apiauthPrefix)) {
//     console.log("API Auth Route Detected. No redirection.");
//     return;
//   }

//   // Handle onboarding
//   if (isLoggedIn && newUser && !onboardingRoutes.includes(path)) {
//     console.log("New User Onboarding Required. Redirecting to Onboarding.");
//     return Response.redirect(new URL("/onboarding", nextUrl));
//   }

//   // Handle auth routes (login, register, etc.)
//   if (authRoutes.includes(path)) {
//     console.log("Auth Route Detected:", path);
//     if (isLoggedIn) {
//       console.log("Already Logged In. Redirecting based on Role.");
//       return handleRoleRedirection();
//     }
//     console.log("Not Logged In. Allowing Access to Auth Route.");
//     return;
//   }

//   // Handle general logged-in state for staff and manager
//   if (isLoggedIn) {
//     console.log("User is Logged In. Handling Role Redirection.");
//     return handleRoleRedirection();
//   }

//   // Redirect to login if not logged in and trying to access protected routes
//   if (!isLoggedIn && !publicRoutes.includes(path)) {
//     console.log(
//       "Not Logged In and Accessing Protected Route. Redirecting to Login."
//     );
//     return Response.redirect(new URL("/login", nextUrl));
//   }

//   console.log("No Redirection or Action Required.");
//   return;
// });

// // Matcher configuration for Next.js middleware
// export const config = {
//   matcher: [
//     "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
//     "/(api|trpc)(.*)",
//   ],
// };

import { auth } from "./auth";
import {
  publicRoutes,
  apiauthPrefix,
  authRoutes,
  staffRoutes,
  managerRoutes, // Assuming manager routes exist=
  onboardingRoutes,
} from "../routes";

export default auth((req) => {
  console.log("=============", req.auth);
  const { nextUrl } = req;
  const user = req.auth?.user;
  const isLoggedIn = !!req.auth;
  const newUser = user?.newUser;
  const role = user?.role;
  console.log("ROLEROLE", newUser, role);
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isApiAuthRoute = nextUrl.pathname.startsWith(apiauthPrefix);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);
  const isOnboardingRoute = onboardingRoutes.includes(nextUrl.pathname);
  const isStaffRoute = staffRoutes.includes(nextUrl.pathname);
  const isManagerRoute = managerRoutes.includes(nextUrl.pathname);

  if (isApiAuthRoute) return; //checked

  if (isAuthRoute) {
    if (isLoggedIn && newUser) {
      return Response.redirect(new URL("/onboarding", nextUrl)); //checked
    }
    if (isLoggedIn) {
      console.log("here1");
      if (role === "admin" || role === "manager") {
        console.log("here2");
        return Response.redirect(new URL("/dashboard", nextUrl)); // Admins can access the full app   // checked
      } else if (role === "staff") {
        // console.log("here3");
        if (!isStaffRoute) {
          return Response.redirect(new URL("/staff", nextUrl)); // Staff restricted to staff routes //checked
        }
      }
    }
    return;
  }

  if (isLoggedIn) {
    if (role === "staff") {
      if (!isStaffRoute) {
        return Response.redirect(new URL("/staff", nextUrl)); // Staff restricted to staff routes //checked
      }
    } else if (role === "manager") {
      if (!isManagerRoute) {
        return Response.redirect(new URL("/staff", nextUrl)); // Manager restricted to staff routes (same as staff in your case) //checked
      }
    }
  }

  if (isLoggedIn && newUser && !isOnboardingRoute) {
    //checked=
    return Response.redirect(new URL("/onboarding", nextUrl));
  }

  if (!isLoggedIn && !isPublicRoute) {
    return Response.redirect(new URL("/login", nextUrl)); //checked
  }

  return;
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
