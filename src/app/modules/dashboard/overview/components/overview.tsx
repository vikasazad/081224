"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import DashboardOverview from "@/components/dashboard-overview";
import { setupRealtimeDashboard } from "../utils/overviewApi";
import { useSession } from "next-auth/react";

const Overview = () => {
  const [info, setInfo] = useState<any>(null);
  const { data: session } = useSession();

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    if (session?.user?.email) {
      // Setup real-time listeners
      cleanup = setupRealtimeDashboard(session.user.email, (dashboardData) => {
        setInfo({
          user: session.user,
          data: dashboardData.data,
          table: dashboardData.table,
        });
      });
    }

    // Cleanup function to remove listeners when component unmounts
    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, [session]);

  return (
    <div>
      {info ? (
        <DashboardOverview
          user={info.user}
          data={info.data}
          table={info.table}
        />
      ) : (
        <div className="flex justify-center items-center h-screen">
          <Image
            src="/avatars/loader.svg"
            alt="Loading..."
            width={50}
            height={50}
            priority
          />
        </div>
      )}
    </div>
  );
};

export default Overview;
