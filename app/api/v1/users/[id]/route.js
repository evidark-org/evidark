import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import User from "@/models/UserModel";

// GET, PATCH, DELETE user by ID
export async function GET(req, { params }) {
  try {
    await connectMongoDB();
    const user = await User.findById(params.id).select("-password");

    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json(user);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  try {
    await connectMongoDB();
    const body = await req.json();

    // Prevent password update here; use separate route for password
    delete body.password;

    const updatedUser = await User.findByIdAndUpdate(params.id, body, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!updatedUser)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json(updatedUser);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectMongoDB();

    const deletedUser = await User.findByIdAndDelete(params.id);

    if (!deletedUser)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
