import User from "../../models/User.js";

export const expireSubscriptions = async () => {
  const now = new Date();
  await User.updateMany(
    { planExpiry: { $lt: now }, subscriptionStatus: "active" },
    { $set: { subscriptionStatus: "expired" } }
  );
  console.log("⛔ Auto-expired old subscriptions");
};
