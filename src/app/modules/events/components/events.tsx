"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import SearchEvents from "./searchEvents";
import MenuEvents from "./menuEvents";
import SettingsEvents from "./settingsEvents";
import InventoryTemplete from "./inventoryTemplete";


// import Maintenance from "./maintenance";

export default function Events({ menu, menuPackages, settings, inventory }: { menu: any, menuPackages: any, settings: any, inventory:any }) {
  const [statusFilter, setStatusFilter] = useState("search");

  // console.log("MENU", menu);
  return (
    <>
      <div className=" flex flex-wrap gap-2 mt-4 py-4 px-8">
        <Button
          variant={statusFilter === "search" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("search")}
          className="text-xs sm:text-sm"
        >
          Search Events
        </Button>
        <Button
          variant={statusFilter === "menu" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("menu")}
          className="text-xs sm:text-sm"
        >
          Menu 
        </Button>
        <Button
          variant={statusFilter === "inventory" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("inventory")}
          className="text-xs sm:text-sm"
        >
          Inventory 
        </Button>
        <Button
          variant={statusFilter === "settings" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("settings")}
          className="text-xs sm:text-sm"
        >
          Settings
        </Button>
      </div>

      <div className="w-full bg-white rounded-lg ">
        {/* {!data ? (
          <div className="flex justify-center items-center h-full">
            <span className="text-gray-500 text-sm">Loading..............</span>
          </div>
        ) : ( */}
          <>
            {statusFilter === "search" && (
              <SearchEvents />
            )}
            {statusFilter === "menu" && (
              <MenuEvents menu={menu} menuPackages={menuPackages} />
            )}
            {statusFilter === "inventory" && (
              <InventoryTemplete inventory={inventory}/>
            )}
            {statusFilter === "settings" && (
              <SettingsEvents settings={settings} />
            )}
          </>
        {/* )} */}
      </div>
    </>
  );
}





























