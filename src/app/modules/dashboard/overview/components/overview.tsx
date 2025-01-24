"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
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
        <div className="flex justify-center items-center h-screen">
          <Image
            src="/avatars/loader.svg"
            alt="Loading..."
            width={50} // Specify width
            height={50} // Specify height
            priority // Ensures this image loads as soon as possible
          />
        </div>
      )}
    </div>
  );
};

export default Overview;
