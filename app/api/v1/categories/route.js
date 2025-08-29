import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Category from "@/models/CategoryModel";
import { auth } from "@/lib/auth";

// GET /api/v1/categories - list all categories
export async function GET() {
  try {
    await connectMongoDB();
    const categories = await Category.find({}).sort({ name: 1 }).lean();
    return NextResponse.json({ success: true, data: categories });
  } catch (err) {
    console.error("GET /categories error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

// POST /api/v1/categories - create a category (admin only)
export async function POST(req) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { name, description } = body || {};

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "'name' is required" }, { status: 400 });
    }

    await connectMongoDB();

    const created = await Category.create({ name: name.trim(), description: description?.trim() });
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (err) {
    // handle duplicate key nicely
    if (err?.code === 11000) {
      return NextResponse.json({ error: "Category already exists" }, { status: 409 });
    }
    console.error("POST /categories error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to create category" },
      { status: 500 }
    );
  }
}
