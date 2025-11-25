import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// Define Mongoose schema for the User
const userSchema = new mongoose.Schema(
  {
    // 👤 Basic User Info
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email address",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
      validate: {
        validator: function (value) {
          // Must contain 1 uppercase, 1 lowercase, 1 number, 1 symbol
          return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/.test(value);
        },
        message:
          "Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character",
      },
    },

    // 💳 Subscription / Payment (Razorpay)
    plan: {
      type: String,
      enum: ["STARTER", "FOCUS_PACK", "GROWTH", "ELITE", null],
      default: null, // 🟢 No plan initially — user will upgrade after payment
    },
    planPrice: { type: Number, default: null },
    planExpiry: { type: Date, default: null },
    subscriptionStatus: {
      type: String,
      enum: ["active", "expired", "canceled", "none"],
      default: "none",
    },

    // 💰 Razorpay Payment Details (only filled after successful payment)
    razorpayOrderId: { type: String, default: null },
    razorpayPaymentId: { type: String, default: null },
    razorpaySignature: { type: String, default: null },

    // 🔗 Optional: Reference to Subscription collection
    subscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
    },

    // 🧠 Feature Flags (unlocked by plan)
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
    lastLogin: { type: Date },
    // 🟢 Added for Password Reset
    resetToken: { type: String, default: null },
    resetTokenExpiry: { type: Date, default: null },
  },
  { timestamps: true }
);

//
// 🔒 Hash password before saving
//
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

//
// 🔑 Compare entered password with stored hash
//
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);
