import connectMongoDB from "@/lib/mongodb";
import Story from "@/models/StoryModel";
import { NextResponse } from "next/server";

// GET story by ID
export async function GET(req, { params }) {
  try {
    await connectMongoDB();
    const story = await Story.findById(params.id)
      .populate("author", "name email")
      .populate("categories", "name")
      .populate("tags", "name")
      .populate("media", "url type")
      .populate("likes")
      .populate("bookmarks")
      .populate("comments");

    if (!story)
      return NextResponse.json({ error: "Story not found" }, { status: 404 });

    return NextResponse.json(story);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// UPDATE story by ID
export async function PUT(req, { params }) {
  try {
    await connectMongoDB();
    const body = await req.json();

    const story = await Story.findByIdAndUpdate(
      params.id,
      {
        ...body,
        publishedAt: body.status === "published" ? new Date() : null,
      },
      { new: true }
    )
      .populate("author", "name email")
      .populate("categories", "name")
      .populate("tags", "name")
      .populate("media", "url type")
      .populate("likes")
      .populate("bookmarks")
      .populate("comments");

    if (!story)
      return NextResponse.json({ error: "Story not found" }, { status: 404 });

    return NextResponse.json(story);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

// DELETE story by ID
export async function DELETE(req, { params }) {
  try {
    await connectMongoDB();
    const story = await Story.findByIdAndDelete(params.id);

    if (!story)
      return NextResponse.json({ error: "Story not found" }, { status: 404 });

    return NextResponse.json({ message: "Story deleted successfully" });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
