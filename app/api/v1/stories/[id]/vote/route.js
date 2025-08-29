import { NextResponse } from "next/server";
import Story from "@/models/StoryModel";
import connectMongoDB from "@/lib/mongodb";

/**
 * POST /api/v1/stories/[id]/vote
 * Upvote or downvote a story (Reddit-like voting)
 */
export async function POST(req, { params }) {
  try {
    await connectMongoDB();

    const { userId, voteType } = await req.json();
    
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    if (!['up', 'down'].includes(voteType)) {
      return NextResponse.json(
        { error: "Vote type must be 'up' or 'down'" },
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

    // Initialize vote arrays if they don't exist
    if (!story.upvotes) story.upvotes = [];
    if (!story.downvotes) story.downvotes = [];

    const hasUpvoted = story.upvotes.includes(userId);
    const hasDownvoted = story.downvotes.includes(userId);

    let updateQuery = {};

    if (voteType === 'up') {
      if (hasUpvoted) {
        // Remove upvote
        updateQuery = {
          $pull: { upvotes: userId }
        };
      } else {
        // Add upvote, remove downvote if exists
        updateQuery = {
          $addToSet: { upvotes: userId },
          $pull: { downvotes: userId }
        };
      }
    } else { // voteType === 'down'
      if (hasDownvoted) {
        // Remove downvote
        updateQuery = {
          $pull: { downvotes: userId }
        };
      } else {
        // Add downvote, remove upvote if exists
        updateQuery = {
          $addToSet: { downvotes: userId },
          $pull: { upvotes: userId }
        };
      }
    }

    const updatedStory = await Story.findByIdAndUpdate(
      params.id,
      updateQuery,
      { new: true }
    );

    return NextResponse.json({
      success: true,
      upvotes: updatedStory.upvotes?.length || 0,
      downvotes: updatedStory.downvotes?.length || 0,
      userVote: updatedStory.upvotes?.includes(userId) ? 'up' : 
                updatedStory.downvotes?.includes(userId) ? 'down' : null
    });

  } catch (err) {
    console.error("POST /stories/[id]/vote error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to vote on story" },
      { status: 500 }
    );
  }
}
