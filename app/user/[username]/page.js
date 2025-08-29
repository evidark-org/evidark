import UserProfile from "@/app/_components/user/UserProfile";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import User from "@/models/UserModel";
import connectMongoDB from "@/lib/mongodb";

async function getUserByUsername(username) {
  try {
    await connectMongoDB();
    const user = await User.findOne({ username }).select("-password");
    return user;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}

export default async function UserPage({ params }) {
  const session = await auth();
  const user = await getUserByUsername(params.username);
  
  if (!user) {
    notFound();
  }

  return (
    <div className="min-h-screen horror-gradient">
      <UserProfile user={user} session={session} />
    </div>
  );
}
