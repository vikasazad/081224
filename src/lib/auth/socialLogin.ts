"use server";
import { signIn, signOut } from "../../auth";

export async function signInWithGoogle() {
  await signIn("google");
}
export async function signInWithTwitter() {
  await signIn("twitter");
}
export async function signInWithFacebook() {
  await signIn("facebook");
}
export async function SignOut() {
  await signOut({ redirectTo: "/login" });
}
