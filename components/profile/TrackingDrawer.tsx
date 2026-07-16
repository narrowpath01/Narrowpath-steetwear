"use client";

import { useState, useEffect } from "react";

import { Order } from "./types";

interface TrackingDrawerProps {
  order: Order;
  isOpen: boolean;
}

export default function TrackingDrawer({ order, isOpen }: TrackingDrawerProps) {
  const [trackingData, setTrackingData] = useState<any>(null);
  const [loadingTracking, setLoadingTracking] = useState(false);
  const [copied, setCopied] = useState(false);

  const hasAwb = !!(order.awb || order.trackingNumber);
  const waybillCode = order.awb || order.trackingNumber;

  // Stepper progress logic
  const isPlaced = true;
  const isPaid = order.status === "PAID" || order.status === "SHIPPED" || order.status === "DELIVERED";

  // Packed (Step 3): Only marked as packed if either:
  // - Delhivery status API returns updates and the status is NOT "Manifested" or "Pending PickUp"
  // - Or order status in DB is manually marked as SHIPPED or DELIVERED.
  const isProcessed = trackingData
    ? (trackingData.currentStatus && !["manifested", "pending pickup"].includes(trackingData.currentStatus.toLowerCase()))
    : (order.status === "SHIPPED" || order.status === "DELIVERED");

  // Shipped (Step 4): Only when the package is in transit/out for delivery or scans exist
  const isShipped = trackingData
    ? (trackingData.scans && trackingData.scans.length > 0 && trackingData.currentStatus && !["manifested", "pending pickup"].includes(trackingData.currentStatus.toLowerCase()))
    : (order.status === "SHIPPED" || order.status === "DELIVERED");

  const isDelivered = trackingData
    ? (trackingData.currentStatus && trackingData.currentStatus.toLowerCase() === "delivered")
    : (order.status === "DELIVERED");

  useEffect(() => {
    if (!isOpen || !waybillCode) return;

    const fetchTracking = async () => {
      setLoadingTracking(true);
      try {
        const res = await fetch(`/api/shipping/track?waybill=${waybillCode}`);
        if (res.ok) {
          const data = await res.json();
          setTrackingData(data);
        } else {
          console.error("Failed to fetch Delhivery tracking details");
        }
      } catch (err) {
        console.error("Tracking Error:", err);
      } finally {
        setLoadingTracking(false);
      }
    };

    fetchTracking();
  }, [isOpen, waybillCode]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="border-t border-neutral-200 bg-neutral-50/70 p-4 sm:p-6 transition-all duration-300">
      <h4 className="text-xs font-black uppercase tracking-widest text-neutral-400 mb-4">Shipment Progress</h4>
      
      {/* Stepper progress indicator */}
      <div className="grid grid-cols-5 gap-2 text-center relative mb-8">
        {/* Connector Line */}
        <div className="absolute top-4 left-[10%] right-[10%] h-0.5 bg-neutral-200 -z-10">
          <div 
            className="h-full bg-black transition-all duration-500" 
            style={{ 
              width: isDelivered ? "100%" : isShipped ? "75%" : isProcessed ? "50%" : isPaid ? "25%" : "0%" 
            }}
          />
        </div>

        {/* Step 1: Placed */}
        <div className="flex flex-col items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition ${
            isPlaced ? "bg-black border-black text-white" : "bg-white border-neutral-300 text-neutral-400"
          }`}>
            ✓
          </div>
          <span className="text-[10px] font-black uppercase mt-2 block leading-tight">Placed</span>
        </div>

        {/* Step 2: Paid */}
        <div className="flex flex-col items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition ${
            isPaid ? "bg-black border-black text-white" : "bg-white border-neutral-300 text-neutral-400"
          }`}>
            {isPaid ? "✓" : "2"}
          </div>
          <span className="text-[10px] font-black uppercase mt-2 block leading-tight">Paid</span>
        </div>

        {/* Step 3: Packed */}
        <div className="flex flex-col items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition ${
            isProcessed ? "bg-black border-black text-white" : "bg-white border-neutral-300 text-neutral-400"
          }`}>
            {isProcessed ? "✓" : "3"}
          </div>
          <span className="text-[10px] font-black uppercase mt-2 block leading-tight">Packed</span>
        </div>

        {/* Step 4: Shipped */}
        <div className="flex flex-col items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition ${
            isShipped ? "bg-black border-black text-white" : "bg-white border-neutral-300 text-neutral-400"
          }`}>
            {isShipped ? "✓" : "4"}
          </div>
          <span className="text-[10px] font-black uppercase mt-2 block leading-tight">Shipped</span>
        </div>

        {/* Step 5: Delivered */}
        <div className="flex flex-col items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition ${
            isDelivered ? "bg-black border-black text-white" : "bg-white border-neutral-300 text-neutral-400"
          }`}>
            {isDelivered ? "✓" : "5"}
          </div>
          <span className="text-[10px] font-black uppercase mt-2 block leading-tight">Delivered</span>
        </div>
      </div>

      {/* API Tracking Details */}
      {hasAwb ? (
        <div className="mt-4 border-t border-neutral-200 pt-4">
          <div className="flex flex-wrap justify-between items-center gap-2 mb-4 bg-white p-3 rounded-lg border border-neutral-200/80">
            <span className="text-[11px] font-extrabold uppercase text-neutral-500 tracking-wider">
              Courier: <strong className="text-black">Delhivery</strong>
            </span>
            <span className="text-[11px] font-extrabold uppercase text-neutral-500 tracking-wider flex items-center gap-2">
              Waybill (AWB): 
              <strong 
                onClick={() => handleCopy(waybillCode!)}
                className="font-mono text-black underline cursor-pointer hover:text-neutral-700"
              >
                {waybillCode}
              </strong>
              {copied && (
                <span className="text-[9px] text-green-600 font-sans font-bold uppercase">Copied</span>
              )}
            </span>
          </div>

          {loadingTracking ? (
            <div className="flex items-center gap-2 py-4 justify-center text-neutral-500 text-xs font-bold uppercase tracking-wider">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
              Fetching live Delhivery status...
            </div>
          ) : trackingData ? (
            <div className="space-y-4">
              <div className="p-3 bg-neutral-100 rounded-lg border border-neutral-200">
                <span className="text-[10px] text-neutral-400 uppercase font-black tracking-widest block">Live Status Summary</span>
                <p className="text-sm font-black uppercase tracking-wider mt-1 text-black">
                  {trackingData.currentStatus || "Info unavailable"}
                </p>
              </div>

              {trackingData.scans && trackingData.scans.length > 0 ? (
                <div className="relative border-l-2 border-neutral-300 ml-4 pl-6 space-y-5">
                  {trackingData.scans.map((scan: any, idx: number) => (
                    <div key={idx} className="relative text-xs">
                      {/* Bullet point */}
                      <div className={`absolute -left-[31px] top-1 w-2.5 h-2.5 rounded-full border-2 bg-white ${
                        idx === 0 ? "border-black scale-125 bg-black" : "border-neutral-400"
                      }`}></div>
                      <p className={`font-black uppercase tracking-wider ${idx === 0 ? "text-black text-sm" : "text-neutral-600"}`}>
                        {scan.status}
                      </p>
                      <p className="text-[10px] text-neutral-500 uppercase mt-0.5">
                        {scan.location || "TRANSIT"} • {scan.time ? new Date(scan.time).toLocaleString() : ""}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs font-bold text-neutral-500 uppercase italic">No package scan history available yet.</p>
              )}
            </div>
          ) : (
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg text-xs text-orange-800 font-bold uppercase tracking-wider">
              Could not connect to Delhivery tracking API. Please retry or contact support.
            </div>
          )}
        </div>
      ) : (
        <div className="border border-neutral-200 bg-white rounded-lg p-4 text-center mt-4">
          <svg className="w-8 h-8 text-neutral-400 mx-auto mb-2" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124l-.09-1.09a3 3 0 00-3-2.81h-.62m3.25 5v-3.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v3.75m17.25-3.75h-16.5" />
          </svg>
          <p className="text-xs font-bold text-neutral-600 uppercase tracking-wider">Awaiting Dispatch</p>
          <p className="text-[11px] text-neutral-400 mt-1 max-w-md mx-auto leading-normal">
            We have recorded your order. We are packaging your items at our warehouse. A Delhivery waybill and tracking history will reflect here once the order is manifested.
          </p>
        </div>
      )}
    </div>
  );
}
