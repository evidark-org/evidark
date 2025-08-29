import { NextResponse } from "next/server";
import Story from "@/models/StoryModel";
import connectMongoDB from "@/lib/mongodb";

/**
 * POST /api/v1/stories/[id]/bookmark
 * Bookmark or unbookmark a story
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

    const isBookmarked = story.bookmarks.includes(userId);
    
    if (isBookmarked) {
      // Remove bookmark
      await Story.findByIdAndUpdate(params.id, {
        $pull: { bookmarks: userId },
        $inc: { bookmarksCount: -1 }
      });
    } else {
      // Add bookmark
      await Story.findByIdAndUpdate(params.id, {
        $addToSet: { bookmarks: userId },
        $inc: { bookmarksCount: 1 }
      });
    }

    return NextResponse.json({
      success: true,
      bookmarked: !isBookmarked,
      message: isBookmarked ? "Bookmark removed" : "Story bookmarked"
    });

  } catch (err) {
    console.error("POST /stories/[id]/bookmark error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to bookmark/unbookmark story" },
      { status: 500 }
    );
  }
}
