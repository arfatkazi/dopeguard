import Stripe from "stripe";
import User from "../models/User.js";
import Subscription from "../models/Subscription.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// 🧾 Create Stripe Billing Portal Session
export const createBillingPortalSession = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user || !user.stripeCustomerId) {
      return res
        .status(400)
        .json({ success: false, message: "User or Stripe customer not found" });
    }

    // ✅ Create billing portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${process.env.FRONTEND_URL}/dashboard`, // where Stripe sends them after done
    });

    res.status(200).json({ success: true, url: session.url });
  } catch (error) {
    console.error("Billing Portal Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to open billing portal" });
  }
};

// ✅ Price mapping (replace with your actual Stripe Price IDs)
const priceMap = {
  STARTER: {
    id: "price_199_id",
    duration: 30, // days
    price: 199,
  },
  FOCUS_PACK: {
    id: "price_499_id",
    duration: 90,
    price: 499,
  },
  GROWTH: {
    id: "price_899_id",
    duration: 180,
    price: 899,
  },
  ELITE: {
    id: "price_1499_id",
    duration: 365,
    price: 1499,
  },
};

// 🧾 Create Stripe Checkout Session
export const createCheckoutSession = async (req, res) => {
  try {
    const { plan } = req.body;
    const user = await User.findById(req.user.id);

    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const selectedPlan = priceMap[plan];
    if (!selectedPlan)
      return res
        .status(400)
        .json({ success: false, message: "Invalid plan selected" });

    // ✅ Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      customer: user.stripeCustomerId,
      line_items: [{ price: selectedPlan.id, quantity: 1 }],
      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,
    });

    res.status(200).json({ success: true, url: session.url });
  } catch (error) {
    console.error("Stripe Checkout Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to create Stripe session" });
  }
};

// 🎯 Stripe Webhook - Handles subscription creation/updates
export const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("⚠️ Webhook Signature Error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      // ✅ When user completes checkout
      case "checkout.session.completed": {
        const session = event.data.object;
        const customerEmail = session.customer_email;
        const subscriptionId = session.subscription;

        const user = await User.findOne({ email: customerEmail });
        if (user) {
          const stripeSub = await stripe.subscriptions.retrieve(subscriptionId);
          const planName =
            stripeSub.items.data[0].price.nickname?.toUpperCase() || "STARTER";

          const planInfo = priceMap[planName] || priceMap.STARTER;
          const expiry = new Date(
            Date.now() + planInfo.duration * 24 * 60 * 60 * 1000
          );

          // ✅ Create a Subscription entry
          const sub = await Subscription.create({
            user: user._id,
            stripeCustomerId: stripeSub.customer,
            stripeSubscriptionId: subscriptionId,
            plan: planName,
            status: stripeSub.status,
            currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
          });

          // ✅ Update User in MongoDB
          user.plan = planName;
          user.planDuration = planInfo.duration;
          user.planPrice = planInfo.price;
          user.planExpiry = expiry;
          user.subscriptionId = sub._id;
          user.stripeSubscriptionId = subscriptionId;
          await user.save();

          console.log(`✅ ${user.email} upgraded to ${planName}`);
        }
        break;
      }

      // ✅ Handle updates/cancellations
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const sub = await Subscription.findOne({
          stripeSubscriptionId: subscription.id,
        });

        if (sub) {
          sub.status = subscription.status;
          sub.currentPeriodEnd = new Date(
            subscription.current_period_end * 1000
          );
          await sub.save();

          const user = await User.findOne({
            stripeSubscriptionId: subscription.id,
          });
          if (user) {
            user.planExpiry = new Date(subscription.current_period_end * 1000);
            user.plan =
              subscription.status === "canceled" ? "STARTER" : user.plan;
            await user.save();
          }
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error("Webhook Processing Error:", error);
    res.status(500).send("Webhook error");
  }
};
