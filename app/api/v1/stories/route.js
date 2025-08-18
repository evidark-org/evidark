import { NextResponse } from "next/server";
import APIFeatures from "@/utils/apiFeatures";
import Story from "@/models/StoryModel";
import connectMongoDB from "@/lib/mongodb";

/**
 * GET /api/v1/stories
 * List all stories with filtering, sorting, pagination, and field limiting
 */
export async function GET(req) {
  try {
    await connectMongoDB();

    const { searchParams } = new URL(req.url);
    const queryObj = Object.fromEntries(searchParams.entries());

    const defaultFields = [
      "title",
      "photo",
      "slug",
      "description",
      "status",
      "author",
    ];

    const features = new APIFeatures(Story.find(), queryObj)
      .filter()
      .sort()
      .limitFields(defaultFields)
      .paginate();

    const stories = await features.query.populate(
      "author",
      "name email username verified"
    );

    // Count total documents for pagination
    const total = await Story.countDocuments(
      new APIFeatures(Story.find(), queryObj).filter().query.getQuery()
    );

    return NextResponse.json({
      data: stories,
      pagination: {
        page: queryObj.page ? parseInt(queryObj.page) : 1,
        limit: queryObj.limit ? parseInt(queryObj.limit) : 100,
        total,
      },
    });
  } catch (err) {
    console.error("GET /stories error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch stories" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/stories
 * Create a new story
 */
export async function POST(req) {
  try {
    await connectMongoDB();

    // const session = await getServerSession(); // Ensure you have session auth
    // if (!session?.user?.userId) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    const body = await req.json();

    if (!body.title || !body.content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    const story = await Story.create({
      ...body,
      publishedAt: body.status === "published" ? new Date() : null,
    });

    return NextResponse.json(story, { status: 201 });
  } catch (err) {
    console.error("POST /stories error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create story" },
      { status: 400 }
    );
  }
}
