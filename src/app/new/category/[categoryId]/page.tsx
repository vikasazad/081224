import RoomCategoryView from "@/app/modules/new/components/roomCategoryView";

interface CategoryPageProps {
  params: Promise<{
    categoryId: string;
  }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { categoryId } = await params;
  
  return (
    <main className="min-h-screen bg-background">
      <RoomCategoryView categoryId={categoryId} />
    </main>
  );
}
