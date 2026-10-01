"use client";

import React, { useState } from "react";
import { CheckIcon, AlertCircleIcon } from "./Icons";

interface StoreSettingsClientProps {
  initialSettings: Record<string, string>;
}

export function StoreSettingsClient({ initialSettings }: StoreSettingsClientProps) {
  const [settings, setSettings] = useState<Record<string, string>>({
    store_name: initialSettings.store_name || "Narrow Path",
    tagline: initialSettings.tagline || "Underground Luxury Streetwear",
    support_phone: initialSettings.support_phone || "9894781426",
    support_email: initialSettings.support_email || "support@narrowpath.in",
    currency_symbol: initialSettings.currency_symbol || "₹",
    shipping_carrier: initialSettings.shipping_carrier || "Delhivery",
    low_stock_threshold: initialSettings.low_stock_threshold || "5",
    free_shipping_min: initialSettings.free_shipping_min || "0",
    order_confirmation_whatsapp: initialSettings.order_confirmation_whatsapp || "true",
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const handleChange = (key: string, val: string) => {
    setSettings((prev) => ({ ...prev, [key]: val }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessage({ text: "Store configuration successfully updated and saved.", type: "success" });
      setTimeout(() => setMessage(null), 4000);
    } catch (err: any) {
      setMessage({ text: err.message || "Failed to save settings", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-8 max-w-4xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-neutral-900">
            Store Operations & Configuration
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Manage global store preferences, support channels, and inventory alert parameters.
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-black text-white hover:bg-neutral-800 transition disabled:opacity-50 shadow-sm"
        >
          {saving ? "Saving Changes..." : "Save Settings"}
        </button>
      </div>

      {/* Notifications */}
      {message && (
        <div
          className={`p-3.5 rounded-lg border text-xs font-medium flex items-center gap-2 ${
            message.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {message.type === "success" ? (
            <CheckIcon className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircleIcon className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Store Identity */}
      <div className="p-6 rounded-xl bg-white border border-neutral-200 shadow-sm space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
          Brand Identity
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider">
              Store Name
            </label>
            <input
              type="text"
              value={settings.store_name}
              onChange={(e) => handleChange("store_name", e.target.value)}
              placeholder="e.g. Narrow Path"
              className="w-full bg-white border border-neutral-300 rounded-lg px-3.5 py-2 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider">
              Tagline
            </label>
            <input
              type="text"
              value={settings.tagline}
              onChange={(e) => handleChange("tagline", e.target.value)}
              placeholder="e.g. Underground Luxury Streetwear"
              className="w-full bg-white border border-neutral-300 rounded-lg px-3.5 py-2 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition"
            />
          </div>
        </div>
      </div>

      {/* Customer Support & WhatsApp Channels */}
      <div className="p-6 rounded-xl bg-white border border-neutral-200 shadow-sm space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
          Support & Communications
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider">
              WhatsApp Support Phone
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-xs text-neutral-500 font-mono">+91</span>
              <input
                type="tel"
                value={settings.support_phone}
                onChange={(e) => handleChange("support_phone", e.target.value)}
                placeholder="e.g. 9894781426"
                className="w-full bg-white border border-neutral-300 rounded-lg pl-12 pr-3.5 py-2 text-xs font-mono text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition"
              />
            </div>
            <p className="text-[11px] text-neutral-500 mt-1">
              Direct point of contact for customer WhatsApp inquiries.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider">
              Customer Support Email
            </label>
            <input
              type="email"
              value={settings.support_email}
              onChange={(e) => handleChange("support_email", e.target.value)}
              placeholder="e.g. support@narrowpath.in"
              className="w-full bg-white border border-neutral-300 rounded-lg px-3.5 py-2 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition"
            />
          </div>
        </div>
      </div>

      {/* Logistics & Inventory Trigger Rules */}
      <div className="p-6 rounded-xl bg-white border border-neutral-200 shadow-sm space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
          Fulfillment & Inventory Parameters
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider">
              Default Courier Carrier
            </label>
            <input
              type="text"
              value={settings.shipping_carrier}
              onChange={(e) => handleChange("shipping_carrier", e.target.value)}
              placeholder="e.g. Delhivery Express"
              className="w-full bg-white border border-neutral-300 rounded-lg px-3.5 py-2 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider">
              Low Stock Alert Threshold
            </label>
            <input
              type="number"
              min="1"
              value={settings.low_stock_threshold}
              onChange={(e) => handleChange("low_stock_threshold", e.target.value)}
              placeholder="e.g. 5"
              className="w-full bg-white border border-neutral-300 rounded-lg px-3.5 py-2 text-xs font-mono text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
            />
            <p className="text-[10px] text-neutral-500 mt-1">Units at or below this trigger low-stock status.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider">
              Free Shipping Threshold (₹)
            </label>
            <input
              type="number"
              min="0"
              value={settings.free_shipping_min}
              onChange={(e) => handleChange("free_shipping_min", e.target.value)}
              placeholder="e.g. 0 (Free shipping on all)"
              className="w-full bg-white border border-neutral-300 rounded-lg px-3.5 py-2 text-xs font-mono text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
            />
            <p className="text-[10px] text-neutral-500 mt-1">0 = Free shipping on all orders.</p>
          </div>
        </div>
      </div>
    </form>
  );
}
