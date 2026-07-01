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
              isPaid
                ? "bg-green-100 text-green-700 border border-green-200"
                : "bg-amber-100 text-amber-700 border border-amber-200"
            }`}
          >
            {order.status === "PAID" ? "PAID" : order.status === "PENDING" ? "PENDING" : order.status}
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
      </div>

      {/* TRACKING DRAWER */}
      <TrackingDrawer order={order} isOpen={isTrackingOpen} />

      {/* RETURN / EXCHANGE DRAWER */}
      <ReturnRequestDrawer order={order} isOpen={isReturnOpen} onReturnSubmitted={handleReturnSubmitted} />
    </div>
  );
}
