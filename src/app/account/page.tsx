import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Business from "../modules/account/business/components/Business";
import ChangePassword from "../modules/account/changepassword/components/ChangePassword";
import HotelInfo from "../modules/account/hotel/components/HotelInfo";
import Profile from "../modules/account/profile/components/Profile";
import RestaurantDetail from "../modules/account/restaurant/components/RestaurantDetail";
import Settings from "../modules/account/settings/components/Settings";
import Staff from "../modules/account/staff/components/Staff";
import { getManagementData } from "../modules/account/utils/AccountApi";

export default async function Dashboard() {
  const data: any = await getManagementData();

  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="space-y-4 p-2 mx-8">
        <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
          <h2 className="text-3xl font-bold tracking-tight">Account</h2>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-4 ">
        <TabsList className="mx-4 md:mx-8">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="changepassword">Change Password</TabsTrigger>
          <TabsTrigger value="hotel">Hotel</TabsTrigger>
          <TabsTrigger value="restaurant">Restaurant</TabsTrigger>
          <TabsTrigger value="business">Business</TabsTrigger>
          <TabsTrigger value="staff">Staff</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="space-y-4">
          <Profile data={data.personalInfo} />
        </TabsContent>
        <TabsContent value="changepassword" className="space-y-4">
          <ChangePassword data={data.personalInfo.password} />
        </TabsContent>
        <TabsContent value="hotel" className="space-y-4">
          <HotelInfo data={data.hotel} />
        </TabsContent>
        <TabsContent value="restaurant" className="space-y-4">
          <RestaurantDetail data={data.restaurant} />
        </TabsContent>
        <TabsContent value="business" className="space-y-4">
          <Business data={data.business} />
        </TabsContent>
        <TabsContent value="staff" className="space-y-4">
          <Staff />
        </TabsContent>
        <TabsContent value="settings" className="space-y-4">
          <Settings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
