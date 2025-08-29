import { NextResponse } from "next/server";
import Story from "@/models/StoryModel";
import connectMongoDB from "@/lib/mongodb";

/**
 * GET /api/v1/stories/featured
 * Get featured dark stories curated by admins
 */
export async function GET(req) {
  try {
    await connectMongoDB();

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit')) || 6;
    const category = searchParams.get('category');

    let query = {
      status: "published",
      featured: true
    };

    if (category) {
      query.category = category.toLowerCase();
    }

    const stories = await Story.find(query)
      .populate("author", "name username photo verified")
      .sort({ publishedAt: -1 })
      .limit(limit)
      .select("title slug description category tags views likesCount commentsCount readingTime ageRating publishedAt");

    return NextResponse.json({
      success: true,
      data: stories,
      meta: {
        count: stories.length,
        category: category || "all"
      }
    });

  } catch (err) {
    console.error("GET /stories/featured error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch featured stories" },
      { status: 500 }
    );
  }
}
