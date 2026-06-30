"use client";

import { useState } from "react";
import OrdersTab from "./OrdersTab";
import ProfileSettings from "./ProfileSettings";
import AddressManager from "./AddressManager";

export default function ProfileClient({ user }: { user: any }) {
  const [activeTab, setActiveTab] = useState<"profile" | "orders">("orders");

  return (
    <main className="min-h-screen bg-gray-50 text-black pt-24 px-4 sm:px-6 lg:px-8 pb-20 font-sans">
      <div className="max-w-7xl mx-auto bg-white rounded-3xl p-6 md:p-12 shadow-sm border border-gray-100">
        
        {/* Top Navigation Tabs */}
        <div className="flex gap-8 mb-10 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("orders")}
            className={`pb-4 text-sm font-bold uppercase tracking-widest transition-colors ${
              activeTab === "orders" ? "border-b-2 border-black text-black" : "text-gray-400 hover:text-black"
            }`}
          >
            Orders
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`pb-4 text-sm font-bold uppercase tracking-widest transition-colors ${
              activeTab === "profile" ? "border-b-2 border-black text-black" : "text-gray-400 hover:text-black"
            }`}
          >
            Profile
          </button>
        </div>

        {/* Render the selected tab */}
        {activeTab === "orders" ? (
          <OrdersTab />
        ) : (
          <div>
            <ProfileSettings user={user} />
            <AddressManager user={user} />
            <div className="flex items-center gap-6 mt-6">
              <a href="/api/auth/signout" className="border border-gray-300 rounded-full px-5 py-2 text-sm font-medium hover:bg-gray-50 transition-colors bg-white">
                Sign out
              </a>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}