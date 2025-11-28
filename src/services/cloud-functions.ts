"use client";

import { getFunctions, httpsCallable } from "firebase/functions";
import { app } from "@/config/db/firebase";

const functions = getFunctions(app);

export async function callHelloWorld(name?: string) {
  const helloWorld = httpsCallable(functions, "helloWorld");
  const result = await helloWorld({ name });
  return result.data;
}
