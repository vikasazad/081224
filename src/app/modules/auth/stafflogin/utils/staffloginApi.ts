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
    await signIn("credentials", {
      email,
      staffEmail,
      password,
      redirectTo: "/staff",
    });
    return { error: false, message: "Login successful" };
  } catch (err) {
    if (err instanceof AuthError) {
      switch (err.type) {
        case "CredentialsSignin":
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
