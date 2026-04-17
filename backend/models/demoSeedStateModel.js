import mongoose from "mongoose";
const demoSeedStateSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  lastSeededAt: {
    type: Date,
    default: null
  },
  seeding: {
    type: Boolean,
    default: false
  },
  seedLockExpiresAt: {
    type: Date,
    default: null
  },
  seedVersion: {
    type: String,
    default: "v1"
  }
}, {
  timestamps: true
});
export default mongoose.model("DemoSeedState", demoSeedStateSchema);
