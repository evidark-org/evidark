import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Comment from "@/models/CommentModel";
import Story from "@/models/StoryModel";

export async function GET(req, { params }) {
  try {
    await connectMongoDB();
    const { id } = await params;

    const comments = await Comment.find({ 
      storyId: id, 
      parentId: null // Only get top-level comments
    })
    .populate('author', 'name username photo role')
    .populate({
      path: 'replies',
      populate: {
        path: 'author',
        select: 'name username photo role'
      }
    })
    .sort({ createdAt: -1 });

    return NextResponse.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

export async function POST(req, { params }) {
  try {
    await connectMongoDB();
    const { id } = await params;
    const { content, userId, parentId } = await req.json();

    if (!content || !userId) {
      return NextResponse.json(
        { error: "Content and userId are required" },
        { status: 400 }
      );
    }

    // Create comment
    const comment = await Comment.create({
      content,
      author: userId,
      storyId: id,
      parentId: parentId || null,
      likes: 0,
      replies: []
    });

    // Populate author details
    await comment.populate('author', 'name username photo role');

    // If it's a reply, add it to parent's replies array
    if (parentId) {
      await Comment.findByIdAndUpdate(
        parentId,
        { $push: { replies: comment._id } }
      );
    }

    // Update story's comment count
    await Story.findByIdAndUpdate(
      id,
      { $inc: { commentsCount: 1 } }
    );

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}
