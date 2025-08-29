import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Comment from "@/models/CommentModel";
import User from "@/models/UserModel";

export async function POST(req, { params }) {
  try {
    await connectMongoDB();
    const { id } = await params;
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const comment = await Comment.findById(id);
    if (!comment) {
      return NextResponse.json(
        { error: "Comment not found" },
        { status: 404 }
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if user already liked this comment
    const likedComments = user.likedComments || [];
    const isLiked = likedComments.includes(id);

    if (isLiked) {
      // Unlike the comment
      await User.findByIdAndUpdate(
        userId,
        { $pull: { likedComments: id } }
      );
      await Comment.findByIdAndUpdate(
        id,
        { $inc: { likes: -1 } }
      );
      
      return NextResponse.json({
        message: "Comment unliked",
        likes: Math.max(0, comment.likes - 1),
        isLiked: false
      });
    } else {
      // Like the comment
      await User.findByIdAndUpdate(
        userId,
        { $addToSet: { likedComments: id } }
      );
      await Comment.findByIdAndUpdate(
        id,
        { $inc: { likes: 1 } }
      );
      
      return NextResponse.json({
        message: "Comment liked",
        likes: comment.likes + 1,
        isLiked: true
      });
    }
  } catch (error) {
    console.error("Error liking comment:", error);
    return NextResponse.json(
      { error: "Failed to like comment" },
      { status: 500 }
    );
  }
}
