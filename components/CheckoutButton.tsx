"use client";

import { useState } from "react";
import { createRazorpayOrder } from "@/app/actions/razorpay";
import { useSession } from "next-auth/react";

export default function CheckoutButton({ cartTotal, items }: { cartTotal: number, items: any[] }) {
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();

  // Function to load the Razorpay script dynamically
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleCheckout = async () => {
    if (!session) {
      alert("Please log in to checkout.");
      return;
    }

    try {
      setLoading(true);

      // 1. Load the script
      const res = await loadRazorpayScript();
      if (!res) {
        alert("Razorpay SDK failed to load. Are you online?");
        return;
      }

      // 2. Generate the Order on your backend
      const orderData = await createRazorpayOrder(cartTotal, items);

      // 3. Configure the Razorpay Modal
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, 
        amount: orderData.amount,
        currency: orderData.currency,
        name: "NARROW PATH",
        description: "Premium Streetwear",
        order_id: orderData.orderId,
        
        // This handler fires the exact moment the payment succeeds
        handler: async function (response: any) {
          console.log("PAYMENT SUCCESSFUL!", response);
          alert(`Payment Successful! Payment ID: ${response.razorpay_payment_id}`);
          // TODO: We will verify this payment in the next phase
        },
        prefill: {
          name: session.user?.name || "",
          email: session.user?.email || "",
        },
        theme: {
          color: "#000000", // Stark black to match your brutalist brand
        },
      };

      // 4. Open the Modal
      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();

    } catch (error) {
      console.error(error);
      alert("Something went wrong initializing the checkout.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleCheckout} 
      disabled={loading}
      className="w-full bg-black text-white py-5 text-sm font-bold uppercase tracking-widest hover:bg-neutral-800 transition-colors disabled:opacity-50"
    >
      {loading ? "PREPARING SECURE CHECKOUT..." : `PAY ₹${cartTotal}`}
    </button>
  );
}