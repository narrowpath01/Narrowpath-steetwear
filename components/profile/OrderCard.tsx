"use client";

import { useState } from "react";
import OrderItemRow from "./OrderItemRow";
import TrackingDrawer from "./TrackingDrawer";
import ReturnRequestDrawer from "./ReturnRequestDrawer";

import { Order } from "./types";

interface OrderCardProps {
  order: Order;
  onOrderUpdate: (updatedOrder: Order) => void;
}

export default function OrderCard({ order, onOrderUpdate }: OrderCardProps) {
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [isReturnOpen, setIsReturnOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatOrderDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const isPaid = order.status === "PAID" || order.status === "SHIPPED" || order.status === "DELIVERED";

  const handleReturnSubmitted = (updatedOrder: Order) => {
    onOrderUpdate(updatedOrder);
    setIsReturnOpen(false);
  };

  // Determine if order was placed within last 15 minutes and is eligible for cancellation
  const orderTime = new Date(order.createdAt).getTime();
  const currentTime = new Date().getTime();
  const diffInMinutes = (currentTime - orderTime) / (1000 * 60);
  const isCancellable = diffInMinutes <= 15 && (order.status === "PAID" || order.status === "PENDING");

  const handleCancelOrder = async () => {
    if (!confirm("Are you sure you want to cancel this order? This action cannot be undone.")) {
      return;
    }
    setCancelling(true);
    try {
      const res = await fetch("/api/orders/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert("Order cancelled successfully!");
        onOrderUpdate({ ...order, status: "CANCELLED" });
      } else {
        alert(data.error || "Failed to cancel order.");
      }
    } catch (err) {
      console.error(err);
      alert("An unexpected error occurred.");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
      {/* Order Top Panel */}
      <div className="bg-neutral-50 border-b border-neutral-200 p-4 sm:p-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
        <div>
          <span className="text-neutral-400 uppercase font-bold tracking-wider block mb-1">Order Placed</span>
          <span className="font-bold text-neutral-800">{formatOrderDate(order.createdAt)}</span>
        </div>
        <div>
          <span className="text-neutral-400 uppercase font-bold tracking-wider block mb-1">Total Amount</span>
          <span className="font-black text-neutral-900 text-sm">INR {order.amount.toFixed(2)}</span>
        </div>
        <div>
          <span className="text-neutral-400 uppercase font-bold tracking-wider block mb-1">Payment Status</span>
          <span
            className={`inline-block px-2.5 py-0.5 rounded-full font-extrabold uppercase tracking-wider text-[10px] ${
              order.status === "REFUNDED"
                ? "bg-blue-100 text-blue-700 border border-blue-200"
                : isPaid
                ? "bg-green-100 text-green-700 border border-green-200"
                : order.status === "CANCELLED"
                ? "bg-red-100 text-red-700 border border-red-200"
                : "bg-amber-100 text-amber-700 border border-amber-200"
            }`}
          >
            {order.status === "PAID" 
              ? "PAID" 
              : order.status === "PENDING" 
              ? "PENDING" 
              : order.status === "REFUNDED" 
              ? "REFUND INITIATED" 
              : order.status}
          </span>
        </div>
        <div className="text-left md:text-right">
          <span className="text-neutral-400 uppercase font-bold tracking-wider block mb-1">Order ID</span>
          <span 
            onClick={() => handleCopy(order.id)}
            className="font-mono font-bold text-neutral-800 hover:text-black cursor-pointer bg-neutral-200/60 px-2 py-0.5 rounded select-all inline-flex items-center gap-1 transition"
            title="Click to copy full ID"
          >
            #{order.id.slice(-8).toUpperCase()}
            {copied ? (
              <span className="text-[9px] text-green-600 font-sans font-bold">Copied</span>
            ) : (
              <svg className="w-3.5 h-3.5 text-neutral-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
              </svg>
            )}
          </span>
        </div>
      </div>

      {/* Order Items */}
      <div className="p-4 sm:p-6 divide-y divide-neutral-100">
        {order.items?.map((item) => (
          <OrderItemRow key={item.id} item={item} />
        ))}
      </div>

      {/* Control Panel Buttons */}
      <div className="border-t border-neutral-100 p-4 sm:p-6 bg-neutral-50/50 flex flex-wrap gap-3 justify-end items-center">
        {isCancellable && (
          <button
            disabled={cancelling}
            onClick={handleCancelOrder}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 hover:text-red-700 hover:border-red-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            {cancelling ? "Cancelling..." : "Cancel Order"}
          </button>
        )}

        <button
          onClick={() => {
            setIsTrackingOpen(!isTrackingOpen);
            setIsReturnOpen(false);
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
            isTrackingOpen
              ? "bg-black text-white"
              : "bg-white border border-neutral-300 hover:border-black text-black shadow-sm"
          }`}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75h12m-12 5.25h12m-12 5.25h12M3 6.75h.008v.008H3V6.75zm0 5.25h.008v.008H3V12zm0 5.25h.008v.008H3v-.008z" />
          </svg>
          {isTrackingOpen ? "Hide Tracking" : "Track Order"}
        </button>

        {order.status === "DELIVERED" || order.returnRequest ? (
          <button
            onClick={() => {
              setIsReturnOpen(!isReturnOpen);
              setIsTrackingOpen(false);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
              isReturnOpen
                ? "bg-black text-white"
                : "border border-neutral-300 hover:border-black text-black bg-white"
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
            </svg>
            {order.returnRequest ? "View Return Status" : "Return / Exchange"}
          </button>
        ) : (
          <a
            href={`https://wa.me/918796621740?text=Hi! I need help with my order %23${order.id.slice(-8).toUpperCase()}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2.5 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border border-neutral-300 hover:border-black hover:bg-neutral-50 text-neutral-700 hover:text-black bg-white shadow-sm transition-all duration-200"
          >
            <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.451 5.402.002 9.799-4.394 9.802-9.799.002-2.618-1.01-5.078-2.854-6.924C16.379 2.036 13.916 1.02 11.299 1.02 5.897 1.02 1.5 5.417 1.497 10.822c-.001 1.502.402 2.973 1.168 4.264l-.99 3.612 3.702-.97L6.647 19.15zM17.15 14.19c-.3-.15-1.782-.88-2.062-.98-.28-.1-.482-.15-.682.15-.2.3-.78.98-.957 1.18-.178.2-.355.225-.655.075-.3-.15-1.265-.467-2.41-1.485-.89-.795-1.492-1.777-1.667-2.077-.175-.3-.02-.463.13-.613.135-.13.3-.35.45-.525.15-.175.2-.3.3-.5s.05-.375-.025-.525C9.7 9.17 9.1 7.695 8.85 7.1c-.243-.58-.49-.5-.682-.51-.175-.01-.375-.01-.575-.01-.2 0-.525.075-.8 1.025s-1.025 2.125-1.025 2.3c0 .175.175.35.475.65 1.025 1.025 2.138 2.022 3.862 2.76.41.175.812.28 1.112.375.412.13.788.112 1.087.068.337-.05 1.782-.73 2.03-1.432.25-.7.25-1.3 1.175-1.425.075-.025.15-.05.225-.075z"/>
            </svg>
            Need help with this order?
          </a>
        )}
      </div>

      {/* TRACKING DRAWER */}
      <TrackingDrawer
        order={order}
        isOpen={isTrackingOpen}
        onStatusUpdate={(newStatus) => onOrderUpdate({ ...order, status: newStatus })}
      />

      {/* RETURN / EXCHANGE DRAWER */}
      <ReturnRequestDrawer order={order} isOpen={isReturnOpen} onReturnSubmitted={handleReturnSubmitted} />
    </div>
  );
}
