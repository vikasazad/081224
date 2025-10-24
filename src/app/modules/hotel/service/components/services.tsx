"use client";

import React, { useEffect, useState } from "react";
import {
  BedDouble,
  TelescopeIcon as Binoculars,
  CarTaxiFront,
  Dumbbell,
  ShoppingBag,
  Settings,
} from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { MdSelfImprovement } from "react-icons/md";
import { MdOutlineDryCleaning } from "react-icons/md";
import RoomUpgrades from "./roomUpgrades";
import Wellness from "./wellness";
import Recreational from "./recreational";
import Transportation from "./transportation";
import PersonalShopping from "./personalshopping";
import Laundry from "./laundry";
import Tours from "./tours";
// import Business from "./business";

const Service = ({ data }: { data: any }) => {
  // console.log("DATA", data);

  const [serviceData, setServiceData] = useState<any>(true);
  const [categoryFlag, setCategoryFlag] = useState<boolean>(false);
  const [availableComponents, setAvailableComponent] = useState<any>();
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  useEffect(() => {
    setServiceData(data.services.categories);
    setSelectedServices(Object.keys(data.services.categories));
  }, [data]);
  const handleCategoryFlag = (flag: boolean) => {
    setCategoryFlag(flag);
  };

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
    // { id: 8, name: "Business", icon: <Printer className="h-6 w-6 mr-2" /> },
  ];

  const components = [
    {
      id: "Room upgrades",
      component: (
        <RoomUpgrades
          data={serviceData["Room upgrades"]}
          flag={handleCategoryFlag}
        />
      ),
    },
    {
      id: "Wellness",
      component: (
        <Wellness data={serviceData.Wellness} flag={handleCategoryFlag} />
      ),
    },
    {
      id: "Recreational",
      component: (
        <Recreational
          data={serviceData.Recreational}
          flag={handleCategoryFlag}
        />
      ),
    },
    {
      id: "Transportation",
      component: (
        <Transportation
          data={serviceData.Transportation}
          flag={handleCategoryFlag}
        />
      ),
    },
    {
      id: "Personal Shopping",
      component: (
        <PersonalShopping
          data={serviceData["Personal Shopping"]}
          flag={handleCategoryFlag}
        />
      ),
    },
    {
      id: "Laundry",
      component: (
        <Laundry data={serviceData.Laundry} flag={handleCategoryFlag} />
      ),
    },
    {
      id: "Tours",
      component: <Tours data={serviceData.Tours} flag={handleCategoryFlag} />,
    },
    // { id: "Business", component: <Business data={serviceData.Business} /> },
  ];

  const categoryClick = (data: any) => {
    if (data) {
      components.map((item: any, i: number) => {
        if (data === item.id) {
          setCategoryFlag(true);
          setAvailableComponent(components[i]);
        }
      });
    }
  };

  const toggleService = (serviceName: string) => {
    setSelectedServices((prev) => {
      if (prev.includes(serviceName)) {
        return prev.filter((name) => name !== serviceName);
      }
      return [...prev, serviceName];
    });
  };

  return (
    <div className="flex flex-1 flex-col p-4 md:gap-4 md:px-8 py-4">
      {!categoryFlag && (
        <>
          <div className="flex justify-end">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Configure Services
                </Button>
              </DialogTrigger>
              <DialogDescription></DialogDescription>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Select Available Services</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  {availableServices.map((service) => (
                    <div
                      key={service.id}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`service-${service.id}`}
                        checked={selectedServices.includes(service.name)}
                        onCheckedChange={() => toggleService(service.name)}
                      />
                      <label
                        htmlFor={`service-${service.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center"
                      >
                        {service.icon}
                        {service.name}
                      </label>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>
          {serviceData && (
            <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
              {availableServices
                .filter(
                  (service) =>
                    selectedServices.length === 0 ||
                    selectedServices.includes(service.name)
                )
                .map((data: any, i: number) => (
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
