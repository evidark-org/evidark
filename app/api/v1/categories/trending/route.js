import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Story from "@/models/StoryModel";

// GET /api/v1/categories/trending?days=30&limit=10
// Calculates trending categories using views and likes within a timeframe
export async function GET(req) {
  try {
    await connectMongoDB();

    const { searchParams } = new URL(req.url);
    const days = Math.max(1, parseInt(searchParams.get("days") || "30", 10));
    const limit = Math.max(1, Math.min(50, parseInt(searchParams.get("limit") || "10", 10)));

    const since = new Date();
    since.setDate(since.getDate() - days);

    const pipeline = [
      { $match: { status: "published", publishedAt: { $gte: since } } },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          totalViews: { $sum: "$views" },
          totalLikes: { $sum: "$likesCount" },
          latestStory: { $max: "$publishedAt" },
        },
      },
      {
        $addFields: {
          // simple composite score; adjust weights if desired
          score: {
            $add: [
              { $multiply: ["$totalViews", 0.7] },
              { $multiply: ["$totalLikes", 0.3] },
              { $multiply: ["$count", 1] },
            ],
          },
        },
      },
      {
        $project: {
          _id: 0,
          category: "$_id",
          count: 1,
          totalViews: 1,
          totalLikes: 1,
          latestStory: 1,
          score: { $round: ["$score", 2] },
        },
      },
      { $sort: { score: -1 } },
      { $limit: limit },
    ];

    const data = await Story.aggregate(pipeline);

    return NextResponse.json({ success: true, data, meta: { days, limit } });
  } catch (err) {
    console.error("GET /categories/trending error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to compute trending categories" },
      { status: 500 }
    );
  }
}
