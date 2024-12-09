"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { findUserByEmail } from "@/lib/firebase/firestore";

export async function LoginAuth(LoginData: {
  email: string;
  password: string;
}) {
  console.log("LoginData", LoginData);
  const email = LoginData.email;
  const password = LoginData.password;

  if (!email || !password) throw new Error("Please provide all fields");

  const existingUser = await findUserByEmail(email);
  // console.log("existingUser", existingUser);
  if (!existingUser) {
    return {
      error: true,
      message: "Couldn't find your Buildbility Account!",
    };
  }

  //   if (findUser.type === "special") {
  //     const existingAdmin = await findUserByEmail(findUser.firstEmail);
  //     if (!existingAdmin) {
  //       return {
  //         error: true,
  //         message: "Couldn't find your Buildbility Account!",
  //       };
  //     }
  //     const isValidStaff = await findIfStaffLogin(
  //       findUser.firstEmail,
  //       findUser.secondEmail
  //     );
  //     if (!isValidStaff) {
  //       return {
  //         error: true,
  //         message: "Couldn't find your Buildbility Account!",
  //       };
  //     }
  //     defaultRoute = "/staff";
  //   }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/dashboard",
    });
    return { error: false, message: "Login successful" };
  } catch (err) {
    if (err instanceof AuthError) {
      console.log("ERRORERROR", err);
      switch (err.type) {
        case "CredentialsSignin":
          return {
            error: true,
            message: "Invalid Credentials!",
          };
        case "CallbackRouteError":
          return {
            error: true,
            message: "Invalid Credentials!",
          };
        default:
          return {
            error: true,
            message: "Something went wrong!",
          };
      }
    }

    throw err;
  }
}
