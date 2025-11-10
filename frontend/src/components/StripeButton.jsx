import axios from "axios";

export default function StripeButton({ planName, price }) {
  const handleClick = async () => {
    const { data } = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/api/payment/create-session`,
      { productName: planName, price },
      { withCredentials: true }
    );
    window.location.href = data.url;
  };

  return (
    <button onClick={handleClick} className="btn-primary">
      Pay ₹{price}
    </button>
  );
}
