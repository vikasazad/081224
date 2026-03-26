import RoomTransactions from "@/app/modules/new/components/roomTransctions";

interface TransactionsPageProps {
  params: Promise<{
    roomId: string;
  }>;
}

export default async function TransactionsPage({ params }: TransactionsPageProps) {
  const { roomId } = await params;
  
  return (
    <main className="min-h-screen bg-background">
      <RoomTransactions roomId={roomId} />
    </main>
  );
}
