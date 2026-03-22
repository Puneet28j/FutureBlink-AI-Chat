import mongoose from "mongoose";

export const connectDB = async () => {
  const MONGODB_URI =
    process.env.MONGODB_URI || "mongodb://localhost:27017/futureblink";

  try {
    const conn = await mongoose.connect(MONGODB_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    process.exit(1);
  }
};
