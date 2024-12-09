"use server";
import { auth } from "@/auth";
import { get7daysDataFromAll, getLiveData } from "@/lib/firebase/firestore";

export async function fetchOverviewData() {
  const session = await auth();
  const user = session?.user;
  let data: any = null;
  let table: any = null;

  if (user && user.email) {
    data = await get7daysDataFromAll(user.email, "analytics");
    table = await getLiveData(user.email);
  }

  return { user, data, table };
}
