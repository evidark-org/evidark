import { NextResponse } from "next/server";
import APIFeatures from "@/utils/apiFeatures";
import Story from "@/models/StoryModel";
import connectMongoDB from "@/lib/mongodb";

/**
 * GET /api/v1/stories/trending
 * Get trending dark stories based on engagement metrics
 */
export async function GET(req) {
  try {
    await connectMongoDB();

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit')) || 10;
    const category = searchParams.get('category');
    const timeframe = searchParams.get('timeframe') || '7d'; // 1d, 7d, 30d

    // Calculate date threshold based on timeframe
    let dateThreshold = new Date();
    switch (timeframe) {
      case '1d':
        dateThreshold.setDate(dateThreshold.getDate() - 1);
        break;
      case '7d':
        dateThreshold.setDate(dateThreshold.getDate() - 7);
        break;
      case '30d':
        dateThreshold.setDate(dateThreshold.getDate() - 30);
        break;
      default:
        dateThreshold.setDate(dateThreshold.getDate() - 7);
    }

    // Build query
    let query = {
      status: "published",
      publishedAt: { $gte: dateThreshold }
    };

    if (category) {
      query.category = category.toLowerCase();
    }

    // Calculate trending score: (views * 0.3) + (likes * 0.4) + (comments * 0.2) + (bookmarks * 0.1)
    const stories = await Story.aggregate([
      { $match: query },
      {
        $addFields: {
          trendingScore: {
            $add: [
              { $multiply: ["$views", 0.3] },
              { $multiply: ["$likesCount", 0.4] },
              { $multiply: ["$commentsCount", 0.2] },
              { $multiply: ["$bookmarksCount", 0.1] }
            ]
          }
        }
      },
      { $sort: { trendingScore: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "author",
          pipeline: [
            { $project: { name: 1, username: 1, photo: 1 } }
          ]
        }
      },
      { $unwind: "$author" }
    ]);

    return NextResponse.json({
      success: true,
      data: stories,
      meta: {
        count: stories.length,
        timeframe,
        category: category || "all"
      }
    });

  } catch (err) {
    console.error("GET /stories/trending error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch trending stories" },
      { status: 500 }
    );
  }
}
