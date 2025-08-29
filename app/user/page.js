import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function UserPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login");
  }
  
  // Redirect to their own profile
  redirect(`/user/${session.user.username || session.user.email.split('@')[0]}`);
}