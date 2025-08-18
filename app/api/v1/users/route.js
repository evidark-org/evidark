import { NextResponse } from "next/server";
import APIFeatures from "@/utils/apiFeatures"; // optional helper for filtering, sorting, pagination
import User from "@/models/UserModel";
import connectMongoDB from "@/lib/mongodb";

// LIST users
export async function GET(req) {
  try {
    await connectMongoDB();

    const { searchParams } = new URL(req.url);
    const queryObj = Object.fromEntries(searchParams.entries());

    const defaultFields = ["name", "username", "email", "role", "photo"];

    const features = new APIFeatures(User.find(), queryObj)
      .filter()
      .sort()
      .limitFields(defaultFields)
      .paginate();

    const users = await features.query.select("-password");
    const total = await User.countDocuments(
      new APIFeatures(User.find(), queryObj).filter().query.getQuery()
    );

    return NextResponse.json({
      data: users,
      pagination: {
        page: queryObj.page ? parseInt(queryObj.page) : 1,
        limit: queryObj.limit ? parseInt(queryObj.limit) : 100,
        total,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// CREATE user
// export async function POST(req) {
//   try {
//     await connectMongoDB();
//     const body = await req.json();

//     if (!body.email) {
//       return NextResponse.json({ error: "Email is required" }, { status: 400 });
//     }

//     const newUser = await User.create(body);

//     return NextResponse.json(newUser, { status: 201 });
//   } catch (err) {
//     return NextResponse.json({ error: err.message }, { status: 400 });
//   }
// }
