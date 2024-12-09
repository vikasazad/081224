import React from "react";
import Onboarding from "../modules/auth/onboarding/components/onboarding";
import { auth } from "@/auth";

const page = async () => {
  const session = await auth();
  const user = session?.user;
  return (
    <div>
      <Onboarding user={user} />
    </div>
  );
};

export default page;
