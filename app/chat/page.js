import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import ChatInterface from "@/app/_components/chat/ChatInterface";

export const metadata = {
  title: "Dark Chat - EviDark",
  description:
    "Connect with fellow dark story enthusiasts in real-time conversations",
};

export default async function ChatPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 via-red-900/20 to-black">
      <ChatInterface />
    </div>
  );
}
