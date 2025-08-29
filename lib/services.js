import User from "@/models/UserModel";
import connectMongoDB from "./mongodb";
import bcrypt from "bcryptjs";

export const getUser = async (email) => {
  try {
    await connectMongoDB();
    const user = await User.findOne({ email });
    return user;
  } catch (error) {
    console.error("Error getting user:", error);
    throw error;
  }
};

export const getUserByEmail = async (email) => {
  try {
    await connectMongoDB();
    const user = await User.findOne({ email }).select("+password");
    return user;
  } catch (error) {
    console.error("Error getting user by email:", error);
    throw error;
  }
};

export const createUser = async (userData) => {
  try {
    await connectMongoDB();
    
    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 12);
    
    // Generate username if not provided
    const username = userData.username || userData.email.split('@')[0];
    
    // Create user with hashed password
    const user = await User.create({
      ...userData,
      username,
      password: hashedPassword,
      role: userData.role || "reader",
      accountType: userData.accountType || "Personal",
      status: userData.status || "Active",
      subscription: userData.subscription || false,
      verified: false,
      xp: 0,
      creatorScore: 0,
      totalViews: 0,
      totalLikes: 0,
      storiesCount: 0,
      followersCount: 0,
      followingCount: 0,
      photo: userData.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=dc2626&color=fff&size=128`,
    });

    // Return user without password
    const { password, ...userWithoutPassword } = user.toObject();
    return userWithoutPassword;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};
