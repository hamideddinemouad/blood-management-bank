import mongoose from "mongoose";
import { getMongoUri } from "./env.js";
const connectDB = async () => {
  try {
    await mongoose.connect(getMongoUri());
    console.log("✅ MongoDB Connected Successfully");
  } catch (error) {
    console.error("❌ MongoDB Error:", error.message);
    process.exit(1);
  }
};
export default connectDB;
