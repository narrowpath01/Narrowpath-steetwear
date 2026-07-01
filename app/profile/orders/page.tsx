"use client";

import { useState, useEffect } from "react";
import OrderCard from "@/components/profile/OrderCard";
import { Order } from "@/components/profile/types";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

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

  const handleOrderUpdate = (updatedOrder: Order) => {
    setOrders((prev) =>
      prev.map((order) => (order.id === updatedOrder.id ? updatedOrder : order))
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 text-black">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-widest">Order History</h1>
        <p className="text-xs sm:text-sm text-neutral-500 font-medium">
          View tracking info, manage returns and exchanges, or inspect details of your past orders.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-neutral-300 rounded-2xl bg-neutral-50">
          <p className="text-neutral-500 font-bold mb-4">No orders placed yet.</p>
          <a
            href="/shop"
            className="inline-block bg-black text-white px-6 py-3 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-neutral-800 transition"
          >
            Explore The Shop
          </a>
        </div>
      ) : (
        <div className="space-y-8">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} onOrderUpdate={handleOrderUpdate} />
          ))}
        </div>
      )}
    </div>
  );
}