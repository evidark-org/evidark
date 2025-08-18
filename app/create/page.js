import React from "react";
import CreateStory from "../_components/stories/CreateStory";
import { auth } from "@/lib/auth";

const page = async () => {
  const session = await auth();
  return (
    <div className="flex flex-col items-center">
      <div className="w-full max-w-[1200px] px-2">
        <div>
          <CreateStory session={session} />
        </div>
      </div>
    </div>
  );
};

export default page;
