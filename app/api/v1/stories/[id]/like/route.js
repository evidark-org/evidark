import { NextResponse } from "next/server";
import Story from "@/models/StoryModel";
import connectMongoDB from "@/lib/mongodb";

/**
 * POST /api/v1/stories/[id]/like
 * Like or unlike a story
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

    const story = await Story.findById(params.id);
    if (!story) {
      return NextResponse.json(
        { error: "Story not found" },
        { status: 404 }
      );
    }

    const isLiked = story.likes.includes(userId);
    
    if (isLiked) {
      // Unlike the story
      await Story.findByIdAndUpdate(params.id, {
        $pull: { likes: userId },
        $inc: { likesCount: -1 }
      });
    } else {
      // Like the story
      await Story.findByIdAndUpdate(params.id, {
        $addToSet: { likes: userId },
        $inc: { likesCount: 1 }
      });
    }

    return NextResponse.json({
      success: true,
      liked: !isLiked,
      message: isLiked ? "Story unliked" : "Story liked"
    });

  } catch (err) {
    console.error("POST /stories/[id]/like error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to like/unlike story" },
      { status: 500 }
    );
  }
}
