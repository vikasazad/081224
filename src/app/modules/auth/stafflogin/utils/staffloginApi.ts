"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { findIfStaffLogin, findUserByEmail } from "@/lib/firebase/firestore";

export async function staffAuth({
  adminEmail,
  staffEmail,
  password,
}: {
  adminEmail: string;
  staffEmail: string;
  password: string;
}) {
  console.log("StaffLoginData", { adminEmail, staffEmail, password });
  const email = adminEmail;
  const sEmail = staffEmail;
  const pass = password;
  console.log("StaffLoginData", { email, sEmail, pass });

  if (!email || !staffEmail || !pass)
    throw new Error("Please provide all fields");

  const existingAdmin = await findUserByEmail(email);
  console.log("existingAdmin", existingAdmin);
  if (!existingAdmin) {
    return {
      error: true,
      message: "Couldn't find your Buildbility Account!",
    };
  }
  const isValidStaff = await findIfStaffLogin(email, sEmail);
  console.log("isValidStaff", isValidStaff);
  if (!isValidStaff) {
    return {
      error: true,
      message: "Couldn't find your Buildbility Account!",
    };
  }

  try {
    const response = await signIn("credentials", {
      email,
      staffEmail,
      password,
      redirectTo: "/staff",
    });
    console.log("response", response);
    return { error: false, message: "Login successful" };
  } catch (err) {
    console.log("err here also", err);

    if (err instanceof AuthError) {
      const { type, cause } = err as AuthError;
      switch (type) {
        case "CredentialsSignin":
          return {
            error: true,
            message: "Invalid credentials.",
          };
        case "CallbackRouteError":
          return {
            error: true,
            message: cause?.err?.toString(),
          };
        default:
          return {
            error: true,
            message: "Something went wrong.",
          };
      }
    }

    throw err;
  }
}
