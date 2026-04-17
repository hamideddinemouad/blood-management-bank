import mongoose from "mongoose";
import { getMongoUri, getPort } from "./config/env.js";
import { createApp } from "./app.js";
const app = createApp();
mongoose.connect(getMongoUri()).then(() => console.log("MongoDB Connected ✅")).catch(err => console.log("MongoDB Error ❌", err));
const PORT = getPort();
app.listen(PORT, () => console.log(`Server running on port ${PORT} 🚀`));
