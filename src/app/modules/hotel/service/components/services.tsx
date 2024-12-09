"use client";
import React, { useEffect, useState } from "react";
import {
  BedDouble,
  Binoculars,
  CarTaxiFront,
  Dumbbell,
  Printer,
  ShoppingBag,
} from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { MdSelfImprovement } from "react-icons/md";
import { MdOutlineDryCleaning } from "react-icons/md";
import RoomUpgrades from "./roomUpgrades";
import Wellness from "./wellness";
import Recreational from "./recreational";
import Transportation from "./transportation";
import PersonalShopping from "./personalshopping";
import Laundry from "./laundry";
import Tours from "./tours";
import Business from "./business";

const Service = ({ data }: { data: any }) => {
  const [serviceData, setServiceData] = useState<any>(true);
  const [categoryFlag, setCategoryFlag] = useState<boolean>(false);
  const [availableComponents, setAvailableComponent] = useState<any>();

  useEffect(() => {
    // getHotelData().then((data: any) => {
    //   console.log("HOTEL", data);
    //   setRoomData(data.rooms);
    // });
    setServiceData(data.services.categories);
  }, [data]);
  const availableServices = [
    {
      id: 1,
      name: "Room upgrades",
      icon: <BedDouble className="h-6 w-6 mr-2" />,
    },
    {
      id: 2,
      name: "Wellness",
      icon: <MdSelfImprovement className="h-6 w-6 mr-2" />,
    },
    {
      id: 3,
      name: "Recreational",
      icon: <Dumbbell className="h-6 w-6 mr-2" />,
    },
    {
      id: 4,
      name: "Transportation",
      icon: <CarTaxiFront className="h-6 w-6 mr-2" />,
    },
    {
      id: 5,
      name: "Personal Shopping",
      icon: <ShoppingBag className="h-6 w-6 mr-2" />,
    },
    {
      id: 6,
      name: "Laundry",
      icon: <MdOutlineDryCleaning className="h-6 w-6 mr-2" />,
    },
    { id: 7, name: "Tours", icon: <Binoculars className="h-6 w-6 mr-2" /> },
    { id: 8, name: "Business", icon: <Printer className="h-6 w-6 mr-2" /> },
  ];

  const components = [
    {
      id: "Room upgrades",
      component: <RoomUpgrades data={serviceData.roomUpgrades} />,
    },
    { id: "Wellness", component: <Wellness data={serviceData.wellness} /> },
    {
      id: "Recreational",
      component: <Recreational data={serviceData.recreational} />,
    },
    {
      id: "Transportation",
      component: <Transportation data={serviceData.transportation} />,
    },
    {
      id: "Personal Shopping",
      component: <PersonalShopping data={serviceData.personalshopping} />,
    },
    { id: "Laundry", component: <Laundry data={serviceData.laundry} /> },
    { id: "Tours", component: <Tours data={serviceData.tours} /> },
    { id: "Business", component: <Business data={serviceData.business} /> },
  ];

  const categoryClick = (data: any) => {
    console.log("first", data);
    if (data) {
      components.map((item: any, i: number) => {
        if (data === item.id) {
          setCategoryFlag(true);
          setAvailableComponent(components[i]);
        }
      });
    }
  };
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:px-8 py-4">
      {!categoryFlag && (
        <>
          {serviceData && (
            <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
              {availableServices.map((data: any, i: number) => (
                <Card
                  key={i}
                  onClick={() => categoryClick(data.name)}
                  className="cursor-pointer"
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-xl font-bold">
                      <div className="flex items-center justify-between">
                        {data.icon} {data.name}
                      </div>
                    </CardTitle>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
      {categoryFlag && <>{availableComponents.component}</>}
    </div>
  );
};

export default Service;
