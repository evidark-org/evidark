import connectMongoDB from "@/lib/mongodb";
import Story from "@/models/StoryModel";
import { NextResponse } from "next/server";

// GET story by ID
export async function GET(req, { params }) {
  try {
    await connectMongoDB();

    const story = await Story.findById(params.id)
      .populate("author", "name username photo verified")
      .select("-__v");

    if (!story) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }

    // Increment view count
    await Story.findByIdAndUpdate(params.id, { $inc: { views: 1 } });

    return NextResponse.json({
      success: true,
      data: story,
    });
  } catch (err) {
    console.error("GET /stories/[id] error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// UPDATE story by ID
export async function PUT(req, { params }) {
  try {
    await connectMongoDB();
    const body = await req.json();

    // Validate category if provided
    if (body.category) {
      const validCategories = [
        "horror",
        "thriller",
        "supernatural",
        "psychological",
        "gothic",
        "mystery",
        "dark fantasy",
        "paranormal",
      ];
      if (!validCategories.includes(body.category.toLowerCase())) {
        return NextResponse.json(
          {
            error:
              "Invalid category. Must be one of: " + validCategories.join(", "),
          },
          { status: 400 }
        );
      }
    }

    // Tags are now free-form and don't require validation

    const updateData = {
      ...body,
      lastEditedAt: new Date(),
    };

    // Set published date when status changes to published
    if (body.status === "published") {
      const existingStory = await Story.findById(params.id);
      if (!existingStory.publishedAt) {
        updateData.publishedAt = new Date();
      }
    }

    const story = await Story.findByIdAndUpdate(params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate("author", "name username photo verified");

    if (!story) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Story updated successfully",
      data: story,
    });
  } catch (err) {
    console.error("PUT /stories/[id] error:", err);

    if (err.name === "ValidationError") {
      const errors = Object.values(err.errors).map((e) => e.message);
      return NextResponse.json(
        { error: "Validation failed: " + errors.join(", ") },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

// DELETE story by ID
export async function DELETE(req, { params }) {
  try {
    await connectMongoDB();

    const story = await Story.findById(params.id);
    if (!story) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }

    // Soft delete by updating status instead of hard delete
    await Story.findByIdAndUpdate(params.id, {
      status: "deleted",
      deletedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: "Story deleted successfully",
    });
  } catch (err) {
    console.error("DELETE /stories/[id] error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
