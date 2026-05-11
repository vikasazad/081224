import SingleScreenDashboard from "../modules/new/components/SingleScreenDashboard";
import {
  getBusinessInfo,
  getRoomDetails,
} from "../modules/staff/utils/staffData";
export default async function Home() {
  const details = (await getRoomDetails()) || [];
  const businessInfo = await getBusinessInfo();
  return (
    <main className="h-[calc(100vh-64px)] bg-background overflow-hidden">
      <SingleScreenDashboard businessInfo={businessInfo} details={details} />
    </main>
  );
}
