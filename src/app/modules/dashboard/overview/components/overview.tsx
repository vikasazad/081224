// "use server";
// import { auth } from "@/auth";
// import DashboardOverview from "@/components/dashboard-overview";
// import { get7daysDataFromAll, getLiveData } from "@/lib/firebase/firestore";

// const overview = async () => {
//   const session = await auth();
//   const user = session?.user;
//   let data: any;
//   let table: any;
//   if (user) {
//     if (user.email) {
//       data = await get7daysDataFromAll(user?.email, "analytics");
//       table = await getLiveData(user?.email);
//     }
//   }

//   // console.log("@@@@@@@@@@@@@@@@@@@@@", user);
//   return (
//     <div>
//       <DashboardOverview user={user} data={data} table={table} />
//     </div>
//   );
// };

// export default overview;
"use client";
import React, { useEffect, useState } from "react";
import DashboardOverview from "@/components/dashboard-overview";
import { fetchOverviewData } from "../utils/overviewApi";

const Overview = () => {
  const [info, setInfo] = useState<any>(null);

  useEffect(() => {
    fetchOverviewData().then((data) => {
      setInfo(data); // Update state
    });
  }, []);

  return (
    <div>
      {info ? (
        <DashboardOverview
          user={info.user}
          data={info.data}
          table={info.table}
        />
      ) : (
        <p>Loading...</p> // Show a loading message or spinner
      )}
    </div>
  );
};

export default Overview;
