import { NextResponse } from "next/server";
import Comment from "@/models/CommentModel";
import Story from "@/models/StoryModel";
import connectMongoDB from "@/lib/mongodb";

// GET comment by ID
export async function GET(req, { params }) {
  try {
    await connectMongoDB();
    const comment = await Comment.findById(params.id).populate(
      "author",
      "name username photo role"
    );

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    return NextResponse.json(comment);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Update comment
export async function PUT(req, { params }) {
  try {
    await connectMongoDB();
    const { content, userId } = await req.json();

    const comment = await Comment.findById(params.id);
    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    // Verify ownership
    if (comment.author.toString() !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    comment.content = content;
    await comment.save();

    // Populate author info
    await comment.populate("author", "name username photo role");

    return NextResponse.json(comment);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Delete comment and all its replies
export async function DELETE(req, { params }) {
  try {
    await connectMongoDB();
    const { userId } = await req.json();

    const comment = await Comment.findById(params.id);
    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    // Verify ownership or admin status
    if (comment.author.toString() !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Function to recursively delete replies
    async function deleteReplies(commentId) {
      const replies = await Comment.find({ parentId: commentId });
      for (const reply of replies) {
        await deleteReplies(reply._id); // Delete nested replies first
        await Comment.findByIdAndDelete(reply._id);
      }
    }

    // Delete all replies first
    await deleteReplies(comment._id);

    // Delete the comment itself
    await Comment.findByIdAndDelete(params.id);

    // Update story's comment count
    await Story.findByIdAndUpdate(comment.storyId, {
      $inc: { commentsCount: -1 },
    });

    return NextResponse.json({ message: "Comment deleted successfully" });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
