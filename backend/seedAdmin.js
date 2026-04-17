import mongoose from "mongoose";
import { getMongoUri } from "./config/env.js";
import Admin from "./models/adminModel.js";
mongoose.connect(getMongoUri()).then(() => console.log("MongoDB connected ✅")).catch(err => console.error(err));
const seedAdmin = async () => {
  try {
    await Admin.deleteMany({
      email: "admin@gmail.com"
    });
    const admin = new Admin({
      name: "Admin BBMS Maroc",
      email: "admin@gmail.com",
      password: "admin@gmail.com",
      role: "admin"
    });
    await admin.save();
    console.log("Admin seeded successfully ✅");
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};
seedAdmin();
