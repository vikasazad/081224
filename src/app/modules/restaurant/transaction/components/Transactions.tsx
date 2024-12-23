// "use client";
// import React, { useState } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { ChevronDown } from "lucide-react";
// import { Badge } from "@/components/ui/badge";
// import HotelRestaurantTransctions from "./HotelRestaurantTransctions";

// const Tranasactions = ({ data }: { data: any }) => {
//   console.log("first", data);
//   const [expandedCategory, setExpandedCategory] = useState<any>(null);
//   const [transactionFlag, setTransactionFlag] = useState<boolean>(false);

//   const ontableSelect = (roomNo: string) => {
//     console.log(roomNo);
//     setTransactionFlag(true);
//   };
//   return (
//     <div className="max-w-4xl  p-6 space-y-4">
//       {!transactionFlag &&
//         data.map((table: any) =>
//           Object.values(table).map((category: any, index: number) => {
//             console.log("askdjfh", category);
//             return (
//               <Card key={index} className="shadow-sm">
//                 <div
//                   className="cursor-pointer"
//                   onClick={() =>
//                     setExpandedCategory(
//                       expandedCategory === index ? null : index
//                     )
//                   }
//                 >
//                   <CardHeader className="bg-gray-50">
//                     <div className="flex items-center justify-between">
//                       <div className="space-y-1">
//                         <CardTitle className="text-xl">
//                           {category[0].categoryName}
//                         </CardTitle>
//                       </div>
//                       <div className="flex items-center gap-4">
//                         <span className="font-semibold">
//                           ₹{category[0].reservation_price}
//                         </span>
//                         <ChevronDown
//                           className={`h-5 w-5 transition-transform ${
//                             expandedCategory === index
//                               ? "transform rotate-180"
//                               : ""
//                           }`}
//                         />
//                       </div>
//                     </div>
//                   </CardHeader>
//                 </div>

//                 {expandedCategory === index && (
//                   <CardContent className="p-4">
//                     <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
//                       {category[0].table_number.map(
//                         (table: any, tableIndex: number) => (
//                           <button
//                             key={tableIndex}
//                             onClick={() => ontableSelect(table)}
//                             className="p-4 border rounded-lg hover:border-blue-500 transition-colors text-left space-y-2"
//                           >
//                             <div className="flex justify-between items-center">
//                               <span className="font-medium">{table}</span>
//                               <Badge className={`capitalize ${table}`}>
//                                 {table}
//                               </Badge>
//                             </div>
//                             <div className="text-sm text-blue-600 hover:text-blue-800">
//                               View Transactions →
//                             </div>
//                           </button>
//                         )
//                       )}
//                     </div>
//                   </CardContent>
//                 )}
//               </Card>
//             );
//           })
//         )}
//       {transactionFlag && <HotelRestaurantTransctions />}
//     </div>
//   );
// };

// export default Tranasactions;
"use client";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import HotelRestaurantTransctions from "./HotelRestaurantTransctions";
import { getRestaurantHistory } from "../../history/utils/historyApi";

const Tranasactions = ({ data }: { data: any }) => {
  console.log("first", data);
  const [expandedCategory, setExpandedCategory] = useState<any>(null);
  const [transactionData, setTransactionData] = useState<any>({
    table: "",
    data: [],
  });
  const [transactionFlag, setTransactionFlag] = useState<boolean>(false);
  const formatKey = (key: string) => {
    return key
      .replace(/([a-z])([A-Z])/g, "$1 $2") // Handle camelCase if needed
      .replace(/(\d+)/g, " $1 ") // Insert spaces before/after numbers
      .replace(/_/g, " ") // Replace underscores with spaces
      .toLowerCase() // Convert to lowercase
      .replace(/^\w/, (c: any) => c.toUpperCase()); // Capitalize the first letter
  };

  const ontableSelect = async (key: string, roomNo: string) => {
    console.log(key, roomNo);
    const data = await getRestaurantHistory(key);
    if (data === false) {
      toast.error("Error while getting history!!");
    }
    setTransactionData({
      table: roomNo,
      data: data,
    });
    setTransactionFlag(true);
  };
  return (
    <div className="max-w-4xl  p-6 space-y-4">
      {!transactionFlag &&
        data.map((table: any) =>
          Object.entries(table).map(([key, seats]: any, index) => {
            return (
              <Card key={index} className="shadow-sm">
                <div
                  className="cursor-pointer"
                  onClick={() =>
                    setExpandedCategory(
                      expandedCategory === index ? null : index
                    )
                  }
                >
                  <CardHeader className="bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-xl">
                          {formatKey(key)}
                        </CardTitle>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-semibold">
                          ₹{seats[0].reservationPrice}
                        </span>
                        <ChevronDown
                          className={`h-5 w-5 transition-transform ${
                            expandedCategory === index
                              ? "transform rotate-180"
                              : ""
                          }`}
                        />
                      </div>
                    </div>
                  </CardHeader>
                </div>

                {expandedCategory === index && (
                  <CardContent className="p-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {seats[0].tableNumber.map(
                        (table: any, tableIndex: number) => (
                          <button
                            key={tableIndex}
                            onClick={() => ontableSelect(key, table)}
                            className="p-4 border rounded-lg hover:border-blue-500 transition-colors text-left space-y-2"
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-medium">Table {table}</span>
                              <Badge className={`capitalize ${table}`}>
                                {table}
                              </Badge>
                            </div>
                            <div className="text-sm text-blue-600 hover:text-blue-800">
                              View Transactions →
                            </div>
                          </button>
                        )
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })
        )}
      {transactionFlag && <HotelRestaurantTransctions data={transactionData} />}
    </div>
  );
};

export default Tranasactions;
