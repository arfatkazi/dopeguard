import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 6 },

    // 🌍 Stripe + Subscription Fields
    plan: {
      type: String,
      enum: ["STARTER", "FOCUS_PACK", "GROWTH", "ELITE"],
      default: "STARTER",
    },
    planDuration: {
      type: Number, // in days
      default: 30,
    },
    planPrice: {
      type: Number,
      default: 199,
    },
    planExpiry: {
      type: Date, // calculated based on purchase
    },
    stripeCustomerId: {
      type: String,
    },
    stripeSubscriptionId: {
      type: String,
    },

    subscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
    },

    features: {
      betaAccess: { type: Boolean, default: false },
      focusMode: { type: Boolean, default: false },
      adaptiveAI: { type: Boolean, default: false },
      alertsEnabled: { type: Boolean, default: true },
    },

    devices: [
      {
        deviceId: String,
        browser: String,
        os: String,
        lastActive: Date,
      },
    ],

    lastLogin: Date,
    resetToken: String,
    resetTokenExpiry: Date,
  },
  { timestamps: true }
);

// ✅ Index email for performance
userSchema.index({ email: 1 });

// 🔒 Auto-hash password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// 🧩 Compare Passwords
userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);
