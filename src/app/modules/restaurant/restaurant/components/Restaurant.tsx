"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2, X, Check } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import MenuItems from "./MenuItems";

export default function Restaurant({ data }: { data: any }) {
  const [menuFlag, setMenuFlag] = useState<boolean>(false);
  const [menuData, setMenuData] = useState<any>();
  // console.log("first", data);
  const handleClick = (cat: any) => {
    // console.log("kjzdklzs", cat);
    setMenuData(cat);
    setMenuFlag(true);
  };
  return (
    <div className="container px-8">
      {!menuFlag && (
        <>
          <h1 className="text-3xl font-bold mb-6">Menu Categories</h1>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {data.categories.map((category: any, index: number) => (
              <Card
                key={index}
                className="overflow-hidden hover:shadow-lg transition-shadow duration-300"
                onClick={() => handleClick(category)}
              >
                <CardContent className="p-4">
                  <div className="aspect-square relative mb-2">
                    <Image
                      src={category.categoryLogo}
                      alt={category.name}
                      className="object-cover rounded-md"
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    {category.name === "Recommended" && (
                      <div className="absolute top-0 left-0 bg-green-500 text-white p-1 rounded-br-md">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="w-4 h-4"
                        >
                          <path d="M7.493 18.75c-.425 0-.82-.236-.975-.632A7.48 7.48 0 016 15.375c0-1.75.599-3.358 1.602-4.634.151-.192.373-.309.6-.397.473-.183.89-.514 1.212-.924a9.042 9.042 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75 2.25 2.25 0 012.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H14.23c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23h-.777zM2.331 10.977a11.969 11.969 0 00-.831 4.398 12 12 0 00.52 3.507c.26.85 1.084 1.368 1.973 1.368H4.9c.445 0 .72-.498.523-.898a8.963 8.963 0 01-.924-3.977c0-1.708.476-3.305 1.302-4.666.245-.403-.028-.959-.5-.959H4.25c-.832 0-1.612.453-1.918 1.227z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <h2 className="font-semibold text-center">{category.name}</h2>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-6 flex justify-end space-x-4 pb-8">
            <Button variant="outline" className="flex items-center">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
            <Button variant="outline" className="flex items-center">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add
            </Button>
            <Button variant="outline" className="flex items-center">
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button variant="default" className="flex items-center">
              <Check className="mr-2 h-4 w-4" />
              Save
            </Button>
          </div>
        </>
      )}
      {menuFlag && <MenuItems data={menuData} />}
    </div>
  );
}
