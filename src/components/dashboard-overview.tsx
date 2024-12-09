"use client";
import React, { useState, useEffect } from "react";
import {
  Hotel,
  Soup,
  TrendingUp,
  TrendingDown,
  HandPlatter,
  BadgeAlert,
} from "lucide-react";
import { ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { get7daysData } from "@/lib/firebase/firestore";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import OrderTable from "./dashboard-ordertable";
import StatsGrid from "./dashboard-statsgrid";
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});
const colors = [
  "#fdcb69",
  "#52c41a",
  "#13c2c2",
  "#ff4d4f",
  "#8c13c2",
  "#13225e",
];

const DashboardOverview = ({
  user,
  data,
  table,
}: {
  user: any;
  data: any;
  table: any;
}) => {
  console.log("YABLE", table);
  const [selectedChart, setSelectedChart] = useState("rooms");
  const [stepSize, setStepSize] = useState<any>();
  const [chartData, setChartData] = useState<any[]>([]);
  const [chartLabel, setChartLabel] = useState([]);
  const [chartOverview, setChartOverview] = useState<any>([]);
  useEffect(() => {
    if (data) {
      // console.log("=============", data);
      const selectedCategoryData = data.rooms;
      const initialSeries = Object.keys(selectedCategoryData)
        .filter((key) => !key.includes("Bookings"))
        .map((key, index) => ({
          name: key,
          type: "line",
          data: selectedCategoryData[key],
          color: colors[index % colors.length], // Cycle through the colors array
        }));
      setChartLabel(data.days);
      // console.log(selectedCategoryData);
      setChartData(initialSeries); // Set the initial series data in state
      setChartOverview(calculateTotalEarningsAndEffectivePercentageAll(data));
      setStepSize(calculateStepSize(selectedCategoryData));
    }
  }, [data]);

  const calculateTotalEarningsAndEffectivePercentageAll = (data: any) => {
    const result: any = {};

    for (const [categoryName, subCategories] of Object.entries(data).filter(
      ([key]) => key !== "days"
    )) {
      // Cast subCategories as an object so we can access its keys
      const subCategoriesTyped = subCategories as Record<string, any>;

      let overallTotalEarnings = 0;
      let totalBookings = 0;

      // Finding the length of daily earnings based on any subcategory that isn't bookings
      const earningsSubCategory = Object.keys(subCategoriesTyped).find(
        (key) => !key.includes("Bookings")
      );
      if (!earningsSubCategory) continue;

      const dailyEarnings = Array(
        subCategoriesTyped[earningsSubCategory].length
      ).fill(0);

      for (const [subCategoryName, values] of Object.entries(
        subCategoriesTyped
      )) {
        const valuesTyped = values as number[]; // Cast values to a number array

        // Separate earnings and bookings
        if (subCategoryName.includes("Bookings")) {
          const bookingsSum = valuesTyped.reduce(
            (sum, value) => sum + value,
            0
          );
          totalBookings += bookingsSum;
        } else {
          const earningsSum = valuesTyped.reduce(
            (sum, value) => sum + value,
            0
          );
          overallTotalEarnings += earningsSum;

          // Sum up the daily earnings for effective percentage calculation
          valuesTyped.forEach((value, index) => {
            dailyEarnings[index] += value;
          });
        }
      }

      // Adjust for any zero earnings days that cause NaN in the percentage calculation
      let effectivePercentage = 0;
      for (let i = 1; i < dailyEarnings.length; i++) {
        if (dailyEarnings[i - 1] !== 0) {
          const change =
            ((dailyEarnings[i] - dailyEarnings[i - 1]) / dailyEarnings[i - 1]) *
            100;
          effectivePercentage += change;
        }
      }

      const isPositive = effectivePercentage > 0;

      // Store the results for this category
      result[`overallTotalEarnings${categoryName}`] = overallTotalEarnings;
      result[`effectivePercentage${categoryName}`] = parseFloat(
        effectivePercentage.toFixed(2)
      );
      result[`isPositive${categoryName}`] = isPositive;
      result[`totalBooking${categoryName}`] = totalBookings;
    }

    return result;
  };

  const calculateStepSize = (selectedCategoryData: any) => {
    const allValues = Object.entries(selectedCategoryData)
      .filter(([key]) => key !== "days")
      .flatMap(([, values]) => values as number[]); // Omit the unused variable

    if (allValues.length === 0) return 0;

    const max = Math.max(...allValues);
    const min = Math.min(...allValues);
    const range = max - min;

    return Math.ceil(range / 10);
  };

  const handleTypeClicks = async (category: string) => {
    const data = await get7daysData(user.email, "analytics", category);
    console.log(data);
    setSelectedChart(category);
    const selectedCategoryData = data[category];
    const series = Object.keys(selectedCategoryData)
      .filter((key) => key !== "days")
      .filter((key) => !key.includes("Bookings"))
      .map((key, index) => {
        return {
          name: key,
          type: "line",
          data: selectedCategoryData[key],
          color: colors[index % colors.length],
        };
      });
    console.log("Generated Series:", series);
    setChartData(series);
    setStepSize(calculateStepSize(selectedCategoryData));
    console.log("DATA", data);
  };

  const options: ApexOptions = {
    chart: {
      type: "line",
      stacked: false,
      toolbar: {
        show: false,
      },
    },
    stroke: {
      curve: "smooth",
      width: 2,
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "40%",
        borderRadius: 5,
      },
    },
    legend: {
      show: true,
      markers: {
        size: 4,
      },
    },
    dataLabels: {
      enabled: false,
    },

    fill: {
      type: ["solid"],
    },
    labels: chartLabel,
    markers: {
      size: [4],
      colors: "#fff",
      strokeColors: [colors[0], colors[1], colors[2], colors[3]],
      hover: {
        size: 6,
      },
    },
    xaxis: {
      type: "category",
      labels: {
        style: {
          colors: "#888888",
          fontWeight: 500,
        },
      },
    },
    yaxis: {
      stepSize: stepSize,
      labels: {
        style: {
          colors: "#888888",
          fontWeight: 500,
        },
      },
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: function (y: any) {
          if (typeof y !== "undefined") {
            return y.toFixed(0) + " points"; // Returns a string
          }
          return ""; // Return an empty string instead of undefined
        },
      },
    },
  };

  const line = {
    series: chartData,
    options: options,
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:px-8 py-4">
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card
          onClick={() => handleTypeClicks("rooms")}
          className={
            selectedChart === "rooms"
              ? "bg-slate-100 cursor-pointer"
              : "cursor-pointer"
          }
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rooms</CardTitle>
            <Hotel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              &#8377; {chartOverview.overallTotalEarningsrooms}
            </div>
            <div className="text-lg font-medium">
              {chartOverview.totalBookingrooms}
              <span className="text-xs text-muted-foreground"> Bookings</span>
            </div>
            <div className="flex items-center">
              {chartOverview.isPositiverooms ? (
                <TrendingUp className="h-4 w-4 " color="rgb(82, 196, 26)" />
              ) : (
                <TrendingDown className="h-4 w-4 " color="red" />
              )}
              <span className="text-xs text-muted-foreground ml-1">
                {chartOverview.effectivePercentagerooms}% from last month
              </span>
            </div>
          </CardContent>
        </Card>
        <Card
          onClick={() => handleTypeClicks("food")}
          className={
            selectedChart === "food"
              ? "bg-slate-100 cursor-pointer  "
              : "cursor-pointer"
          }
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Food</CardTitle>
            <Soup className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              &#8377; {chartOverview.overallTotalEarningsfood}
            </div>
            <div className="text-lg font-medium">
              {chartOverview.totalBookingfood}
              <span className="text-xs text-muted-foreground"> Orders</span>
            </div>
            <div className="flex items-center">
              {chartOverview.isPositivefood ? (
                <TrendingUp className="h-4 w-4 " color="rgb(82, 196, 26)" />
              ) : (
                <TrendingDown className="h-4 w-4 " color="red" />
              )}
              <span className="text-xs text-muted-foreground ml-1">
                {chartOverview.effectivePercentagefood}% from last month
              </span>
            </div>
          </CardContent>
        </Card>
        <Card
          onClick={() => handleTypeClicks("services")}
          className={
            selectedChart === "services"
              ? "bg-slate-100 cursor-pointer "
              : " cursor-pointer "
          }
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Services</CardTitle>
            <HandPlatter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              &#8377; {chartOverview.overallTotalEarningsservices}
            </div>
            <div className="text-lg font-medium">
              {chartOverview.totalBookingservices}
              <span className="text-xs text-muted-foreground"> Requests</span>
            </div>
            <div className="flex items-center">
              {chartOverview.isPositiveservices ? (
                <TrendingUp className="h-4 w-4 " color="rgb(82, 196, 26)" />
              ) : (
                <TrendingDown className="h-4 w-4 " color="red" />
              )}
              <span className="text-xs text-muted-foreground ml-1">
                {chartOverview.effectivePercentageservices}% from last month
              </span>
            </div>
          </CardContent>
        </Card>
        <Card
          onClick={() => handleTypeClicks("issues")}
          className={
            selectedChart === "issues"
              ? "bg-slate-100 cursor-pointer"
              : " cursor-pointer"
          }
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Issues</CardTitle>
            <BadgeAlert className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              &#8377; {chartOverview.overallTotalEarningsissues}
            </div>
            <div className="text-lg font-medium">
              {chartOverview.totalBookingissues}
              <span className="text-xs text-muted-foreground"> Issues</span>
            </div>
            <div className="flex items-center">
              {chartOverview.isPositiveissues ? (
                <TrendingUp className="h-4 w-4 " color="rgb(82, 196, 26)" />
              ) : (
                <TrendingDown className="h-4 w-4 " color="red" />
              )}
              <span className="text-xs text-muted-foreground ml-1">
                {chartOverview.effectivePercentageissues}% since last hour
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="flex flex-col gap-4 md:flex-row md:gap-8">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
              <ReactApexChart
                options={line.options}
                series={line.series}
                type="area"
                height={270}
                width={"100%"}
              />
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <StatsGrid table={table} />
      </div>

      <div>
        <OrderTable data={table} />
      </div>
    </div>
  );
};

export default DashboardOverview;
