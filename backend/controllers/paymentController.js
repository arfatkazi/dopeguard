import Razorpay from "razorpay";
import crypto from "crypto";
import User from "../models/User.js";

export const createOrder = async (req, res) => {
  try {
    const { plan } = req.body;
    if (!plan)
      return res.status(400).json({ success: false, message: "Plan required" });

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const prices = { STARTER: 199, FOCUS_PACK: 499, GROWTH: 899, ELITE: 1499 };
    const amount = (prices[plan] || 199) * 100;

    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    return res.status(200).json({
      success: true,
      key_id: process.env.RAZORPAY_KEY_ID,
      order,
      plan,
    });
  } catch (err) {
    console.error("💥 Razorpay Error:", err);
    res.status(500).json({ success: false, message: "Order creation failed" });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } =
      req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature)
      return res
        .status(400)
        .json({ success: false, message: "Missing fields" });

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature)
      return res
        .status(400)
        .json({ success: false, message: "Invalid signature" });

    // ✅ Update user plan in MongoDB
    const user = await User.findById(req.user?.id);
    if (user) {
      const prices = {
        STARTER: 199,
        FOCUS_PACK: 499,
        GROWTH: 899,
        ELITE: 1499,
      };
      user.plan = plan;
      user.planPrice = prices[plan] || null;
      user.razorpayOrderId = razorpay_order_id;
      user.razorpayPaymentId = razorpay_payment_id;
      user.razorpaySignature = razorpay_signature;
      user.subscriptionStatus = "active";

      const durationMap = {
        STARTER: 30,
        FOCUS_PACK: 90,
        GROWTH: 180,
        ELITE: 365,
      };
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + (durationMap[plan] || 30));
      user.planExpiry = expiry;

      // 🔑 Starter / Essential key generation for STARTER plan
      if (plan === "STARTER") {
        // generate key only if user doesn't have one yet
        if (!user.starterKey) {
          // 8-char hex key, e.g. "A3F9C2B1"
          user.starterKey = crypto.randomBytes(4).toString("hex").toUpperCase();
          user.starterKeyCreatedAt = new Date();
        }

        // make sure key is active if subscription is active
        user.starterKeyActive = true;
      }

      await user.save();

      return res
        .status(200)
        .json({ success: true, message: "Payment verified", user });
    }

    res
      .status(200)
      .json({ success: true, message: "Payment verified successfully" });
  } catch (error) {
    console.error("💥 Payment verify error:", error);
    res.status(500).json({ success: false, message: "Verification failed" });
  }
};
