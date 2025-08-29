import { NextResponse } from "next/server";
import Story from "@/models/StoryModel";
import connectMongoDB from "@/lib/mongodb";

/**
 * GET /api/v1/stories/categories
 * Get story statistics by category for dark stories
 */
export async function GET(req) {
  try {
    await connectMongoDB();

    const categories = await Story.aggregate([
      {
        $match: { status: "published" }
      },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          totalViews: { $sum: "$views" },
          totalLikes: { $sum: "$likesCount" },
          avgReadingTime: { $avg: "$readingTime" },
          latestStory: { $max: "$publishedAt" }
        }
      },
      {
        $project: {
          category: "$_id",
          count: 1,
          totalViews: 1,
          totalLikes: 1,
          avgReadingTime: { $round: ["$avgReadingTime", 1] },
          latestStory: 1,
          _id: 0
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Add category metadata
    const categoryMetadata = {
      "horror": {
        description: "Spine-chilling tales designed to frighten and unsettle",
        icon: "ghost",
        color: "#dc2626"
      },
      "thriller": {
        description: "Fast-paced stories filled with suspense and tension",
        icon: "zap",
        color: "#ea580c"
      },
      "supernatural": {
        description: "Stories involving paranormal and otherworldly elements",
        icon: "sparkles",
        color: "#7c3aed"
      },
      "psychological": {
        description: "Mind-bending tales that explore the depths of human psyche",
        icon: "brain",
        color: "#059669"
      },
      "gothic": {
        description: "Dark romantic tales with mysterious and brooding atmospheres",
        icon: "castle",
        color: "#4338ca"
      },
      "mystery": {
        description: "Puzzling stories that keep readers guessing until the end",
        icon: "search",
        color: "#0891b2"
      },
      "dark fantasy": {
        description: "Fantasy stories with dark themes and mature content",
        icon: "sword",
        color: "#be185d"
      },
      "paranormal": {
        description: "Stories featuring ghosts, spirits, and unexplained phenomena",
        icon: "eye",
        color: "#7c2d12"
      }
    };

    const enrichedCategories = categories.map(cat => ({
      ...cat,
      ...categoryMetadata[cat.category] || {}
    }));

    return NextResponse.json({
      success: true,
      data: enrichedCategories,
      meta: {
        totalCategories: categories.length,
        totalStories: categories.reduce((sum, cat) => sum + cat.count, 0)
      }
    });

  } catch (err) {
    console.error("GET /stories/categories error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch category statistics" },
      { status: 500 }
    );
  }
}
