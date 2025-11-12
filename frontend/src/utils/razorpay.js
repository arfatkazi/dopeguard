import axios from "axios";

// ✅ Always send cookies for cross-origin requests
axios.defaults.withCredentials = true;

// ✅ Ensure backend URL is consistent
const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:5000"; // ⚡ must match backend origin exactly

/**
 * 🧠 DopeGuard Razorpay Payment Handler
 * Secure + Verified Login Check
 */
export const initiateRazorpayPayment = async (plan) => {
  try {
    // ✅ 1️⃣ Quick check: is user logged in locally?
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      alert("Please sign in before making a payment.");
      return;
    }

    // ✅ 2️⃣ Verify session with backend (JWT cookie)
    let verify;
    try {
      verify = await axios.get(`${BACKEND}/api/auth/verify`, {
        withCredentials: true, // must be true for cookies
      });
    } catch (err) {
      console.error(
        "Verify call failed:",
        err.response?.data || err.message || err
      );

      const msg =
        err.response?.data?.message ||
        "Session expired or invalid. Please sign in again.";
      alert(msg);
      localStorage.removeItem("user");
      return;
    }

    if (!verify?.data?.success) {
      alert("Session expired. Please log in again.");
      localStorage.removeItem("user");
      return;
    }

    // ✅ 3️⃣ Create Razorpay order from backend
    const { data } = await axios.post(
      `${BACKEND}/api/payment/create-order`,
      { plan },
      { withCredentials: true }
    );

    if (!data.success || !data.order) {
      console.error("Order creation failed:", data);
      alert("Order creation failed. Please try again.");
      return;
    }

    const { key_id, order } = data;

    // ✅ 4️⃣ Razorpay checkout options
    const options = {
      key: key_id,
      amount: order.amount,
      currency: order.currency,
      name: "DopeGuard",
      description: `${plan} Subscription`,
      order_id: order.id,
      image: "/blocked.jpg",
      handler: async function (response) {
        try {
          const verifyPayment = await axios.post(
            `${BACKEND}/api/payment/verify-payment`,
            {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan,
            },
            { withCredentials: true }
          );

          if (verifyPayment.data.success) {
            localStorage.setItem("plan", plan);
            localStorage.setItem("order_id", response.razorpay_order_id);
            localStorage.setItem("amount", order.amount);

            window.location.href = `/success?plan=${plan}&order_id=${response.razorpay_order_id}&amount=${order.amount}`;
          } else {
            window.location.href = "/payment-failed";
          }
        } catch (err) {
          console.error("❌ Verification Error:", err.response?.data || err);
          window.location.href = "/payment-failed";
        }
      },
      prefill: {
        name: "DopeGuard User",
        email: "user@example.com",
      },
      theme: { color: "#00BFFF" },
    };

    // ✅ 5️⃣ Initialize Razorpay
    const razorpay = new window.Razorpay(options);
    razorpay.open();
  } catch (err) {
    console.error("💥 Razorpay Init Error:", err.response?.data || err);
    alert("Unable to start payment. Please try again later.");
  }
};
