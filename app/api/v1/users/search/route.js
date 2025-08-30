import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/UserModel";

// GET /api/v1/users/search - Search users for chat
export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const limit = parseInt(searchParams.get("limit")) || 20;

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        {
          error: "Search query must be at least 2 characters",
        },
        { status: 400 }
      );
    }

    // Search users by name or email (excluding current user)
    const users = await User.find({
      _id: { $ne: session.user.id },
      role: { $in: ["user", "guide", "admin"] }, // All roles can be found
      $and: [
        {
          $or: [
            { name: { $regex: query, $options: "i" } },
            { email: { $regex: query, $options: "i" } },
            { username: { $regex: query, $options: "i" } },
          ],
        },
        { name: { $exists: true, $ne: null, $ne: "" } },
      ],
    })
      .select("name email username avatar role isOnline lastSeen")
      .limit(limit)
      .sort({ name: 1 });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Error searching users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
