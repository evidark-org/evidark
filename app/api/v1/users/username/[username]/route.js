import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import User from "@/models/UserModel";

// GET user by username
export async function GET(req, { params }) {
  try {
    await connectMongoDB();

    const { username } = params;
    if (!username)
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      );

    const user = await User.findOne({ username }).select("-password");
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json(user);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
