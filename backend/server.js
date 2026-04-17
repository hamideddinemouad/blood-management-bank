import { getMaskedEnvDebugSnapshot, getPort } from "./config/env.js";
import { createApp } from "./app.js";
import connectDB from "./config/db.js";

const app = createApp();

console.log("Backend env debug snapshot:", getMaskedEnvDebugSnapshot());

await connectDB();

const PORT = getPort();

if (!process.env.VERCEL) {
  app.listen(PORT, () => console.log(`Server running on port ${PORT} 🚀`));
}

export default app;
