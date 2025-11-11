import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    // 👤 Basic User Info
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 6 },

    // 💳 Subscription / Payment (Razorpay)
    plan: {
      type: String,
      enum: ["STARTER", "FOCUS_PACK", "GROWTH", "ELITE"],
      default: "STARTER",
    },
    planPrice: { type: Number, default: 199 },
    planExpiry: { type: Date },
    subscriptionStatus: {
      type: String,
      enum: ["active", "expired", "canceled"],
      default: "expired",
    },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,

    // 🌍 (Keep Stripe fields commented — optional future)
    // stripeCustomerId: String,
    // stripeSubscriptionId: String,

    // 🔗 Reference to Subscription collection (optional)
    subscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
    },

    // 🧠 Feature Flags
    features: {
      betaAccess: { type: Boolean, default: false },
      focusMode: { type: Boolean, default: false },
      adaptiveAI: { type: Boolean, default: false },
      alertsEnabled: { type: Boolean, default: true },
    },

    // 💻 Device Tracking
    devices: [
      {
        deviceId: String,
        browser: String,
        os: String,
        lastActive: Date,
      },
    ],

    // 🕒 Other metadata
    lastLogin: Date,
    resetToken: String,
    resetTokenExpiry: Date,
  },
  { timestamps: true }
);

// 🔒 Hash password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// 🔑 Compare password method
userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);
