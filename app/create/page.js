import React from "react";
import CreateStoryEnhanced from "../_components/stories/CreateStoryEnhanced";
import { auth } from "@/lib/auth";

const page = async () => {
  const session = await auth();
  return <CreateStoryEnhanced session={session} />;
};

export default page;
