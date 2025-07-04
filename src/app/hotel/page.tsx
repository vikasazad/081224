import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import HotelOverview from "../modules/hotel/hotel/components/HotelOverview";
import Service from "../modules/hotel/service/components/services";
import {
  getConciergeQRData,
  getHotelData,
  handleRoomInformation,
} from "../modules/hotel/utils/hotelDataApi";
import History from "../modules/hotel/history/components/History";
import Transactions from "../modules/hotel/transctions/components/Transactions";
import ConciergeQR from "../modules/hotel/ConciergeQR/components/ConciergeQR";
import { auth } from "@/auth";

export default async function Dashboard() {
  const session = await auth();
  const user = session?.user?.email;
  const data = await getHotelData();
  const room = await handleRoomInformation();
  const conciergeQR = await getConciergeQRData();
  console.log("USER", user);
  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="space-y-4 p-2 mx-8">
        <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
          <h2 className="text-3xl font-bold tracking-tight">Hotel</h2>
          {/* <div className="flex flex-col space-y-1 sm:flex-row items-center space-x-0 sm:space-x-2 px-2">
            <CalendarDateRangePicker />
            <Button>Download</Button>
          </div> */}
        </div>
      </div>

      <Tabs defaultValue="hotel" className="space-y-4 ">
        <TabsList className="mx-4 md:mx-8">
          <TabsTrigger value="hotel">Hotel</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="tranasactions">Tranasactions</TabsTrigger>
          <TabsTrigger value="concierge">Concierge QR</TabsTrigger>
        </TabsList>
        <TabsContent value="hotel" className="space-y-4">
          <HotelOverview data={data} />
        </TabsContent>
        <TabsContent value="services" className="space-y-4">
          <Service data={data} />
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <History data={data} room={room} />
        </TabsContent>
        <TabsContent value="tranasactions" className="space-y-4">
          <Transactions data={data} room={room} />
        </TabsContent>
        <TabsContent value="concierge" className="space-y-4">
          <ConciergeQR data={conciergeQR} user={user} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
