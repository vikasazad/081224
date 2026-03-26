import RoomHistory from "@/app/modules/new/components/roomHistory";

interface HistoryPageProps {
  params: Promise<{
    roomId: string;
  }>;
}

export default async function HistoryPage({ params }: HistoryPageProps) {
  const { roomId } = await params;
  
  return (
    <main className="min-h-screen bg-background">
      <RoomHistory roomId={roomId} />
    </main>
  );
}
