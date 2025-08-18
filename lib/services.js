import User from "./../models/UserModel";
import connectMongoDB from "./mongodb";

export async function getUser(email) {
  try {
    await connectMongoDB();
    const user = await User.findOne({ email: email });
    return user ? user : null;
  } catch (err) {
    console.error("Error getting user:", err);
    throw new Error("Error getting user");
  }
}

export async function createUser(data) {
  try {
    await connectMongoDB();
    const newUser = await User.create(data);
    return {
      statusText: "success",
      message: "User created successfully",
      data: newUser,
    };
  } catch (err) {
    console.error("Error creating user:", err);
    return {
      statusText: "error",
      message: "Error creating user",
      error: err.message,
    };
  }
}
