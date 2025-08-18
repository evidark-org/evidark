import UserProfile from "@/app/_components/user/UserProfile";
import { auth } from "@/lib/auth";
import React from "react";

const page = async () => {
  const session = await auth();
  return (
    <div>
      <UserProfile session={session} />
    </div>
  );
};

export default page;
