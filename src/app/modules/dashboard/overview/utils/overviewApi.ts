import {
  get7daysDataFromAllLive,
  getLiveDataRealtime,
  setStatsRealtime,
} from "@/lib/firebase/functions";

// export async function fetchOverviewData() {
//   const session = await auth();
//   const user = session?.user;
//   let data: any = null;
//   let table: any = null;

//   if (user && user.email) {
//     data = await get7daysDataFromAll(user.email, "analytics");
//     table = await getLiveData(user.email);
//     await setStats(user.email);
//   }

//   return { user, data, table };
// }

export function setupRealtimeDashboard(
  email: string,
  callback: (data: any) => void
) {
  const unsubscribes: (() => void)[] = [];

  try {
    // Setup real-time listeners
    const unsubscribe1 = get7daysDataFromAllLive(
      email,
      "analytics",
      (analyticsData) => {
        const unsubscribe2 = getLiveDataRealtime(email, (liveData) => {
          const unsubscribe3 = setStatsRealtime(email, (error) => {
            if (error) {
              console.error("Error updating stats:", error);
              return;
            }

            callback({
              data: analyticsData,
              table: liveData,
            });
          });
          unsubscribes.push(unsubscribe3);
        });
        unsubscribes.push(unsubscribe2);
      }
    );
    unsubscribes.push(unsubscribe1);

    // Return cleanup function
    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe());
    };
  } catch (error) {
    console.error("Error setting up dashboard listeners:", error);
    throw error;
  }
}
