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

    const body = await req.json();

    // Validation
    if (!body.title || !body.content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    if (!body.author) {
      return NextResponse.json(
        { error: "Author is required" },
        { status: 400 }
      );
    }

    if (!body.category) {
      return NextResponse.json(
        { error: "Category is required for dark stories" },
        { status: 400 }
      );
    }

    // Validate category
    const validCategories = ["horror", "thriller", "supernatural", "psychological", "gothic", "mystery", "dark fantasy", "paranormal"];
    if (!validCategories.includes(body.category.toLowerCase())) {
      return NextResponse.json(
        { error: "Invalid category. Must be one of: " + validCategories.join(", ") },
        { status: 400 }
      );
    }

    // Validate tags if provided
    const validTags = ["ghost", "murder", "haunted", "mystery", "dark", "suspense", "blood", "nightmare", 
                      "demon", "witch", "vampire", "zombie", "serial-killer", "possession", "curse", "death", "revenge"];
    if (body.tags && body.tags.length > 0) {
      const invalidTags = body.tags.filter(tag => !validTags.includes(tag));
      if (invalidTags.length > 0) {
        return NextResponse.json(
          { error: "Invalid tags: " + invalidTags.join(", ") },
          { status: 400 }
        );
      }
    }

    // Create story with enhanced data
    const storyData = {
      title: body.title.trim(),
      description: body.description?.trim() || "",
      content: body.content,
      category: body.category.toLowerCase(),
      tags: body.tags || [],
      author: body.author,
      status: body.status || "draft",
      ageRating: body.ageRating || "16+",
      contentWarnings: body.contentWarnings || [],
      series: body.series || undefined,
    };

    const story = await Story.create(storyData);
    
    // Populate author information for response
    await story.populate("author", "name username photo");

    return NextResponse.json({
      success: true,
      message: "Story created successfully",
      data: story
    }, { status: 201 });

  } catch (err) {
    console.error("POST /stories error:", err);
    
    // Handle validation errors
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return NextResponse.json(
        { error: "Validation failed: " + errors.join(", ") },
        { status: 400 }
      );
    }

    // Handle duplicate key errors
    if (err.code === 11000) {
      return NextResponse.json(
        { error: "A story with this title already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: err.message || "Failed to create story" },
      { status: 500 }
    );
  }
}
