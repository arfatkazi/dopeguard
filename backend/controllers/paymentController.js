// backend/controllers/paymentController.js
import Razorpay from "razorpay";
import crypto from "crypto";

/* ======================================================
   🧠 CREATE ORDER (Frontend → Backend → Razorpay)
====================================================== */
export const createOrder = async (req, res) => {
  try {
    console.log("🧠 [createOrder] Request body:", req.body);

    const { plan } = req.body;

    if (!plan) {
      console.log("❌ No plan provided in request");
      return res
        .status(400)
        .json({ success: false, message: "Plan is required" });
    }

    // ✅ Initialize Razorpay
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    console.log("🔑 Razorpay Key ID:", process.env.RAZORPAY_KEY_ID);
    console.log(
      "🔒 Razorpay Key Secret (first 4 chars):",
      process.env.RAZORPAY_KEY_SECRET?.slice(0, 4)
    );

    // ✅ Price map
    const prices = {
      STARTER: 199,
      FOCUS_PACK: 499,
      GROWTH: 899,
      ELITE: 1499,
    };

    const amount = prices[plan] ? prices[plan] * 100 : 19900; // in paise
    const orderOptions = {
      amount,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    console.log("🧾 Creating Razorpay order with:", orderOptions);
    const order = await razorpay.orders.create(orderOptions);
    console.log("✅ Order created successfully:", order.id);

    return res.status(200).json({
      success: true,
      key_id: process.env.RAZORPAY_KEY_ID,
      order,
      plan,
    });
  } catch (error) {
    console.error("💥 Razorpay Order Creation Failed:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error while creating order",
    });
  }
};

/* ======================================================
   🔐 VERIFY PAYMENT (Razorpay → Backend)
====================================================== */
export const verifyPayment = async (req, res) => {
  try {
    console.log("🧩 [verifyPayment] Request body:", req.body);

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      console.log("❌ Missing required fields for verification");
      return res
        .status(400)
        .json({ success: false, message: "Missing fields" });
    }

    // ✅ Generate signature for verification
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    console.log("🔍 Generated Signature:", generatedSignature);
    console.log("🔍 Received Signature:", razorpay_signature);

    if (generatedSignature === razorpay_signature) {
      console.log("✅ Payment verified successfully");
      return res.status(200).json({
        success: true,
        message: "Payment verified successfully",
      });
    }

    console.log("❌ Invalid signature");
    return res
      .status(400)
      .json({ success: false, message: "Invalid signature" });
  } catch (error) {
    console.error("💥 Payment verification error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error during verification" });
  }
};
