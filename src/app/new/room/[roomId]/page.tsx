import RoomView from "@/app/modules/new/components/roomView";

interface RoomPageProps {
  params: Promise<{
    roomId: string;
  }>;
}

export default async function RoomPage({ params }: RoomPageProps) {
  const { roomId } = await params;
  
  return (
    <main className="min-h-screen bg-background">
      <RoomView roomId={roomId} />
    </main>
  );
}
