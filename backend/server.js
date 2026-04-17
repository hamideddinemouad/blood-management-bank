import mongoose from "mongoose";
import dotenv from "dotenv";
import { createApp } from "./app.js";
dotenv.config();
const app = createApp();
mongoose.connect(process.env.MONGO_URI).then(() => console.log("MongoDB Connected ✅")).catch(err => console.log("MongoDB Error ❌", err));
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT} 🚀`));
