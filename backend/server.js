import { getPort } from "./config/env.js";
import app from "./app.js";
import connectDB from "./config/db.js";

await connectDB();

const PORT = getPort();

if (!process.env.VERCEL) {
  app.listen(PORT, () => console.log(`Server running on port ${PORT} 🚀`));
}

export default app;
