import { NextResponse } from "next/server";
import Story from "@/models/StoryModel";
import connectMongoDB from "@/lib/mongodb";

export async function GET(req) {
  try {
    await connectMongoDB();

    // ✅ Extract slug from URL path
    const url = new URL(req.url);
    const parts = url.pathname.split("/");
    const slug = parts[parts.length - 1]; // last segment

    if (!slug) {
      return NextResponse.json(
        { error: "Slug parameter is missing" },
        { status: 400 }
      );
    }

    const story = await Story.findOne({ slug, status: "draft" }).populate(
      "author",
      "name email username verified photo"
    );

    if (!story) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }

    return NextResponse.json(story, { status: 200 });
  } catch (err) {
    console.error("GET /stories/slug/[slug] error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
