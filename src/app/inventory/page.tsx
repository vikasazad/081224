import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Store from "../modules/inventory/store/components/store";
import Laundry from "../modules/inventory/laundry/components/laundry";
import { getInventoryData } from "../modules/inventory/store/utils/InventoryApi";

const Inventory = async () => {
  const data: any = await getInventoryData();
  // console.log("SASAAASA", data);
  return (
    <div className="min-h-screen w-full p-6">
      <h1 className="text-4xl font-bold mb-6">Inventory Dashboard</h1>

      <Tabs defaultValue="store" className="space-y-4 ">
        <TabsList>
          <TabsTrigger value="store">Store</TabsTrigger>
          <TabsTrigger value="laundry">Laundry</TabsTrigger>
        </TabsList>
        <TabsContent value="store" className="space-y-4">
          <Store data={data?.inventory?.store} />
        </TabsContent>
        <TabsContent value="laundry" className="space-y-4">
          <Laundry />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Inventory;
