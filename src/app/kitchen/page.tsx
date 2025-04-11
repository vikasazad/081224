import KitchenDashboard from "@/app/modules/kitchen/components/kitchenDashboard";

export default async function Home() {
  return (
    <main className="min-h-screen bg-background">
      <KitchenDashboard />
    </main>
  );
}
