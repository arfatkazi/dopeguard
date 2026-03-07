import User from "../models/User.js";

export const requireActiveSubscription = async (req, res, next) => {
  try {
    // user id comes from authMiddleware after token verification
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const user = await User.findById(userId).select(
      "subscriptionStatus planExpiry plan"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 1) Check if subscription is active
    if (user.subscriptionStatus !== "active") {
      return res.status(403).json({
        success: false,
        active: false,
        message: "Your subscription is inactive. Please purchase a plan.",
      });
    }

    // 2) Check expiry date
    if (user.planExpiry && user.planExpiry < Date.now()) {
      // auto deactivate user
      user.subscriptionStatus = "inactive";
      await user.save();

      return res.status(403).json({
        success: false,
        active: false,
        message: "Your plan has expired. Renew to continue using DopeGuard.",
      });
    }

    // subscription valid → proceed
    next();
  } catch (error) {
    console.error("Subscription check failed:", error);
    res.status(500).json({
      success: false,
      message: "Server error while checking subscription.",
    });
  }
};
