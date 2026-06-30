"use client";

import { useState, useEffect } from "react";

type Order = {
  id: string;
  amount: number;
  status: string;
  awb: string | null;
  createdAt: string;
  returnRequest: { status: string } | null;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [trackingData, setTrackingData] = useState<any>(null);
  const [activeAwb, setActiveAwb] = useState<string | null>(null);

useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/user/orders");
        if (res.ok) {
          const data = await res.json();
          setOrders(data);
        } else {
          console.error("Failed to fetch orders");
        }
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

    const res = await fetch(`/api/shipping/track?waybill=${awb}`);
    if (res.ok) setTrackingData(await res.json());
  };

  const handleReturnRequest = async (orderId: string) => {
    // In production, this opens a modal to upload a file to S3/UploadThing and get a URL.
    const mockMediaUrl = prompt("Enter the URL of your photo/video evidence:");
    if (!mockMediaUrl) return;

    const reason = prompt("Reason for return/exchange:");
    
    const res = await fetch("/api/returns/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId,
        reason,
        type: "EXCHANGE",
        isDefective: true, // You would capture this via a checkbox in a real modal
        mediaUrl: mockMediaUrl
      })
    });

    const data = await res.json();
    if (data.error) alert(data.error);
    else alert("Request submitted for verification.");
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 text-black">
      <h1 className="text-2xl font-black uppercase tracking-widest mb-8">Order History</h1>

      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order.id} className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-start border-b border-neutral-100 pb-4 mb-4">
              <div>
                <p className="text-xs text-neutral-400 uppercase font-bold">Order #{order.id.slice(-8)}</p>
                <p className="text-sm font-bold uppercase">{new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-black uppercase">INR {order.amount}</p>
                <span className="text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-md mt-2 inline-block bg-neutral-100 text-neutral-600">
                  {order.status}
                </span>
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              {order.awb && order.status === 'SHIPPED' && (
                <button onClick={() => handleTrack(order.awb!)} className="bg-black text-white px-4 py-2 rounded-lg text-xs font-bold uppercase">
                  {activeAwb === order.awb ? "Close Tracking" : "Track"}
                </button>
              )}

              {order.status === 'DELIVERED' && !order.returnRequest && (
                <button onClick={() => handleReturnRequest(order.id)} className="border border-black text-black px-4 py-2 rounded-lg text-xs font-bold uppercase">
                  Request Return / Exchange
                </button>
              )}
              
              {order.returnRequest && (
                <span className="text-xs font-bold uppercase tracking-widest text-orange-600 flex items-center">
                  Return Status: {order.returnRequest.status}
                </span>
              )}
            </div>

            {activeAwb === order.awb && trackingData && (
              <div className="mt-4 p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                <p className="text-sm font-black uppercase mb-2">Status: {trackingData.currentStatus}</p>
                <div className="space-y-3 border-l-2 border-black ml-2 pl-4">
                  {trackingData.scans.slice(0, 3).map((scan: any, i: number) => (
                    <div key={i} className="relative">
                      <div className="absolute -left-[21px] top-1 w-2 h-2 bg-black rounded-full"></div>
                      <p className="text-xs font-bold uppercase">{scan.status}</p>
                      <p className="text-[10px] text-neutral-500 uppercase">{scan.location}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}