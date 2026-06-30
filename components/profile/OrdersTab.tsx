"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ReturnModal from "./ReturnModal"; // Import the extracted modal

type Order = {
  id: string;
  amount: number;
  status: string;
  awb: string | null;
  createdAt: string;
  returnRequest: { status: string } | null;
};

export default function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [trackingData, setTrackingData] = useState<any>(null);
  const [activeAwb, setActiveAwb] = useState<string | null>(null);

  // We only keep the minimal state needed to open the modal
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [returnOrderId, setReturnOrderId] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/user/orders");
        if (res.ok) setOrders(await res.json());
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleTrack = async (awb: string) => {
    if (activeAwb === awb) {
      setActiveAwb(null);
      return;
    }
    setActiveAwb(awb);
    setTrackingData(null);

    try {
      const res = await fetch(`/api/shipping/track?waybill=${awb}`);
      if (res.ok) setTrackingData(await res.json());
    } catch (e) {
      console.error("Tracking failed");
    }
  };

  const openReturnModal = (orderId: string) => {
    setReturnOrderId(orderId);
    setIsReturnModalOpen(true);
  };

  if (loading) return <div className="text-sm font-bold uppercase animate-pulse p-8 text-center">Loading Orders...</div>;

  if (orders.length === 0) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-6">Order History</h2>
        <div className="border border-gray-200 rounded-xl p-8 text-center bg-white shadow-sm">
          <p className="text-gray-500 mb-4">You haven't placed any orders yet.</p>
          <Link href="/shop" className="inline-block text-white bg-black px-6 py-2 rounded-lg font-medium hover:opacity-80 transition-opacity">
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Order History</h2>
      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order.id} className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-start border-b border-neutral-100 pb-4 mb-4">
              <div>
                <p className="text-xs text-neutral-400 uppercase font-bold tracking-wider">Order #{order.id.slice(-8)}</p>
                <p className="text-sm font-bold uppercase mt-1">{new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-black uppercase tracking-widest">INR {order.amount}</p>
                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded mt-2 inline-block bg-neutral-100 text-neutral-600">
                  {order.status}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mt-4">
              {order.awb && (order.status === 'SHIPPED' || order.status === 'DELIVERED') && (
                <button onClick={() => handleTrack(order.awb!)} className="bg-black text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-neutral-800 transition-colors">
                  {activeAwb === order.awb ? "Close Tracking" : "Track Shipment"}
                </button>
              )}

              {order.status === 'DELIVERED' && !order.returnRequest && (
                <button onClick={() => openReturnModal(order.id)} className="border border-neutral-300 text-black px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-neutral-50 transition-colors">
                  Request Return / Exchange
                </button>
              )}
              
              {order.returnRequest && (
                <span className="text-xs font-bold uppercase tracking-widest text-orange-600 flex items-center bg-orange-50 px-3 py-2 rounded-lg">
                  Return Status: {order.returnRequest.status.replace("_", " ")}
                </span>
              )}
            </div>

            {activeAwb && activeAwb === order.awb && (
              <div className="mt-6 p-5 bg-neutral-50 rounded-lg border border-neutral-200">
                {!trackingData ? (
                  <p className="text-xs uppercase font-bold text-neutral-500 animate-pulse">Connecting to logistics...</p>
                ) : (
                  <div>
                    <p className="text-sm font-black uppercase tracking-widest mb-4">Status: <span className="text-[#005bd3]">{trackingData.currentStatus}</span></p>
                    <div className="space-y-4 border-l-2 border-neutral-300 ml-2 pl-4">
                      {trackingData.scans.slice(0, 3).map((scan: any, i: number) => (
                        <div key={i} className="relative">
                          <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 bg-black rounded-full ring-4 ring-neutral-50"></div>
                          <p className="text-xs font-bold uppercase tracking-widest">{scan.status}</p>
                          <p className="text-[10px] text-neutral-500 uppercase tracking-widest mt-1">
                            {scan.location} | {new Date(scan.date).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <ReturnModal 
        isOpen={isReturnModalOpen} 
        onClose={() => setIsReturnModalOpen(false)} 
        orderId={returnOrderId} 
      />
    </div>
  );
}