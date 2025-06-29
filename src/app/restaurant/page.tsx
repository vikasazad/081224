import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import Table from "../modules/restaurant/table/components/Table";
import {
  getMenuData,
  getQRData,
  getTableData,
} from "../modules/restaurant/utils/restaurantDataApi";
import Restaurant from "../modules/restaurant/restaurant/components/Restaurant";
import History from "../modules/restaurant/history/components/History";
import Tranasactions from "../modules/restaurant/transaction/components/Transactions";
import TableQR from "../modules/restaurant/QR/components/TableQR";
import { auth } from "@/auth";

export default async function Dashboard() {
  const session = await auth();
  const user = session?.user?.email;
  const data = await getTableData();
  const menu = await getMenuData();
  const qr = await getQRData();
  // console.log("DATA", data);
  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="space-y-4 p-2 mx-8">
        <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
          <h2 className="text-3xl font-bold tracking-tight">Restaurant</h2>
        </div>
      </div>

      <Tabs defaultValue="table" className="space-y-4 ">
        <TabsList className="mx-4 md:mx-8">
          <TabsTrigger value="table">Table</TabsTrigger>
          <TabsTrigger value="restaurant">Restaurant</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="tranasactions">Tranasactions</TabsTrigger>
          <TabsTrigger value="qr">TableQR</TabsTrigger>
        </TabsList>
        <TabsContent value="table" className="space-y-4">
          <Table data={data} />
        </TabsContent>
        <TabsContent value="restaurant" className="space-y-4">
          <Restaurant data={menu} />
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <History data={data} />
        </TabsContent>
        <TabsContent value="tranasactions" className="space-y-4">
          <Tranasactions data={data} />
        </TabsContent>
        <TabsContent value="qr" className="space-y-4">
          <TableQR data={qr} user={user} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
