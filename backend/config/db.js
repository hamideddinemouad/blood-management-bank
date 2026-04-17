import mongoose from "mongoose";
import { getMongoUri } from "./env.js";

let cachedConnectionPromise = null;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (cachedConnectionPromise) {
    return cachedConnectionPromise;
  }

  cachedConnectionPromise = mongoose
    .connect(getMongoUri())
    .then((connection) => {
      console.log("✅ MongoDB Connected Successfully");
      return connection;
    })
    .catch((error) => {
      cachedConnectionPromise = null;
      console.error("❌ MongoDB Error:", error.message);
      throw error;
    });

  return cachedConnectionPromise;
};
export default connectDB;
