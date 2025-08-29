import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Category from "@/models/CategoryModel";
import { auth } from "@/lib/auth";

// GET /api/v1/categories/[id]
export async function GET(_req, { params }) {
  try {
    await connectMongoDB();
    const category = await Category.findById(params.id).lean();
    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: category });
  } catch (err) {
    console.error("GET /categories/[id] error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch category" },
      { status: 500 }
    );
  }
}

// PATCH /api/v1/categories/[id] (admin only)
export async function PATCH(req, { params }) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const update = {};
    if (typeof body.name === "string") update.name = body.name.trim();
    if (typeof body.description === "string") update.description = body.description.trim();

    await connectMongoDB();
    const updated = await Category.findByIdAndUpdate(
      params.id,
      { $set: update },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    if (err?.code === 11000) {
      return NextResponse.json({ error: "Category name already exists" }, { status: 409 });
    }
    console.error("PATCH /categories/[id] error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to update category" },
      { status: 500 }
    );
  }
}

// DELETE /api/v1/categories/[id] (admin only)
export async function DELETE(_req, { params }) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectMongoDB();
    const deleted = await Category.findByIdAndDelete(params.id);
    if (!deleted) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: deleted });
  } catch (err) {
    console.error("DELETE /categories/[id] error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to delete category" },
      { status: 500 }
    );
  }
}
