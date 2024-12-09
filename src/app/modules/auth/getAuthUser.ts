import { auth } from "@/auth";

export async function getAuthUser() {
  const session = await auth();
  const user = session?.user;
  return user;
}
