import { NextResponse } from "next/server";
import User from "@/models/UserModel";
import connectMongoDB from "@/lib/mongodb";

/**
 * POST /api/v1/users/[id]/follow
 * Follow or unfollow a user
 */
export async function POST(req, { params }) {
  try {
    await connectMongoDB();

    const { userId } = await req.json();
    
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    if (userId === params.id) {
      return NextResponse.json(
        { error: "Cannot follow yourself" },
        { status: 400 }
      );
    }

    const [user, targetUser] = await Promise.all([
      User.findById(userId),
      User.findById(params.id)
    ]);

    if (!user || !targetUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const isFollowing = user.following.includes(params.id);
    
    if (isFollowing) {
      // Unfollow
      await Promise.all([
        User.findByIdAndUpdate(userId, {
          $pull: { following: params.id },
          $inc: { followingCount: -1 }
        }),
        User.findByIdAndUpdate(params.id, {
          $pull: { followers: userId },
          $inc: { followersCount: -1 }
        })
      ]);
    } else {
      // Follow
      await Promise.all([
        User.findByIdAndUpdate(userId, {
          $addToSet: { following: params.id },
          $inc: { followingCount: 1 }
        }),
        User.findByIdAndUpdate(params.id, {
          $addToSet: { followers: userId },
          $inc: { followersCount: 1 }
        })
      ]);
    }

    return NextResponse.json({
      success: true,
      following: !isFollowing,
      message: isFollowing ? "Unfollowed user" : "Following user"
    });

  } catch (err) {
    console.error("POST /users/[id]/follow error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to follow/unfollow user" },
      { status: 500 }
    );
  }
}
