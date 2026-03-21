import React from "react";
import Checkin from "../../modules/checkin/components/checkin";

interface PageProps {
  params: Promise<{
    bookingId: string;
  }>;
}

const page = async ({ params }: PageProps) => {
  const { bookingId } = await params;
  return <Checkin bookingId={bookingId} />;
};

export default page;
