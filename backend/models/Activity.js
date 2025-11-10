import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: { type: Date, default: Date.now },
    focusTime: { type: Number, default: 0 }, // minutes of distraction-free time
    blockedCount: { type: Number, default: 0 },
    dopamineSpikes: { type: Number, default: 0 },
    focusScore: { type: Number, default: 0 }, // AI-based mental clarity score (0-100)

    details: [
      {
        site: String,
        duration: Number,
        blocked: Boolean,
        timestamp: Date,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Activity", activitySchema);
