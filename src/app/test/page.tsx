"use client";

import { sendNotification } from "@/lib/sendNotification";

export default function Home() {
  const handleClick = async () => {
    console.log("clicked");

    sendNotification(
      "eUt2ciZlaoB2SfYsmhWjzr:APA91bE99YWRNChjJPWiyicW-CeWRMKmCaaLZJHyC877hTDzLqRoPc6GZrmnk5s7sy0Rxdt14e-Vk_7P24zFU28IQtlzcmAqFedsd_kYrB1whI6dICMP8UQ",
      "Hotel",
      "Sameple title for the notification"
    );
  };
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <button onClick={() => handleClick()}>click here</button>
    </div>
  );
}
