"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import OrderCard from "./OrderCard";
import { Order } from "./types";

export default function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

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

  const handleOrderUpdate = (updatedOrder: Order) => {
    setOrders((prev) =>
      prev.map((order) => (order.id === updatedOrder.id ? updatedOrder : order))
    );
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
      <div className="space-y-8">
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} onOrderUpdate={handleOrderUpdate} />
        ))}
      </div>
    </div>
  );
}