"use client";

import React, { useState } from "react";
import {
  PlusIcon,
  EditIcon,
  TrashIcon,
  MegaphoneIcon,
  XIcon,
  CheckIcon,
} from "./Icons";

export interface AdminAnnouncement {
  id: string;
  text: string;
  link: string | null;
  isActive: boolean;
  priority: number;
  type: string;
  createdAt: string | Date;
}

interface AnnouncementManagerClientProps {
  initialAnnouncements: AdminAnnouncement[];
}

export function AnnouncementManagerClient({
  initialAnnouncements,
}: AnnouncementManagerClientProps) {
  const [announcements, setAnnouncements] = useState<AdminAnnouncement[]>(initialAnnouncements);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AdminAnnouncement | null>(null);

  // Form states
  const [text, setText] = useState("");
  const [link, setLink] = useState("");
  const [type, setType] = useState("MARQUEE");
  const [priority, setPriority] = useState<number>(0);
  const [isActive, setIsActive] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const openCreateModal = () => {
    setEditingItem(null);
    setText("");
    setLink("");
    setType("MARQUEE");
    setPriority(0);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (item: AdminAnnouncement) => {
    setEditingItem(item);
    setText(item.text);
    setLink(item.link || "");
    setType(item.type);
    setPriority(item.priority);
    setIsActive(item.isActive);
    setIsModalOpen(true);
  };

  const handleToggleActive = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/announcements/${id}`, {
        method: "PATCH",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setAnnouncements((prev) =>
        prev.map((a) =>
          a.id === id ? { ...a, isActive: data.announcement.isActive } : a
        )
      );

      setMessage({
        text: `Announcement is now ${data.announcement.isActive ? "ACTIVE on storefront" : "INACTIVE"}`,
        type: "success",
      });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ text: err.message || "Failed to toggle status", type: "error" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      setMessage({ text: "Announcement text is required.", type: "error" });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const payload = {
        text: text.trim(),
        link: link.trim() || null,
        type,
        priority: Number(priority),
        isActive,
      };

      if (editingItem) {
        const res = await fetch(`/api/admin/announcements/${editingItem.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        setAnnouncements((prev) =>
          prev.map((a) => (a.id === editingItem.id ? data.announcement : a))
        );
        setMessage({ text: "Announcement updated successfully.", type: "success" });
      } else {
        const res = await fetch("/api/admin/announcements", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        setAnnouncements((prev) => [data.announcement, ...prev]);
        setMessage({ text: "Announcement created and saved.", type: "success" });
      }

      setIsModalOpen(false);
      setTimeout(() => setMessage(null), 4000);
    } catch (err: any) {
      setMessage({ text: err.message || "Operation failed", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;

    try {
      const res = await fetch(`/api/admin/announcements/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
      setMessage({ text: "Announcement deleted successfully.", type: "success" });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ text: err.message || "Failed to delete", type: "error" });
    }
  };

  const applyPreset = (presetText: string) => {
    setText(presetText);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-neutral-900">
            Storefront Broadcasts & Tickers
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Publish real-time ticker messages, promotion bars, and announcement banners on the storefront.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-black text-white hover:bg-neutral-800 text-xs font-bold uppercase tracking-wider rounded-lg transition shrink-0 shadow-sm"
        >
          <PlusIcon className="w-4 h-4" />
          <span>New Broadcast</span>
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
          ) : null}
          <span>{message.text}</span>
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
        {announcements.length === 0 ? (
          <div className="p-12 text-center text-xs text-neutral-500">
            No announcements created yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-700">
              <thead className="bg-neutral-50 text-[11px] uppercase tracking-wider text-neutral-500 border-b border-neutral-200">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Announcement Text</th>
                  <th className="py-3.5 px-4 font-semibold">Type</th>
                  <th className="py-3.5 px-4 font-semibold">Priority</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 font-sans">
                {announcements.map((item) => (
                  <tr key={item.id} className="hover:bg-neutral-50/80 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <MegaphoneIcon className="w-4 h-4 text-neutral-500 shrink-0" />
                        <span className="font-semibold text-neutral-900 uppercase tracking-tight">
                          {item.text}
                        </span>
                      </div>
                      {item.link && (
                        <span className="text-[10px] text-neutral-500 font-mono block pl-6 mt-0.5">
                          Link: {item.link}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded bg-neutral-100 border border-neutral-200 text-[10px] uppercase font-mono font-bold text-neutral-800">
                        {item.type}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-medium text-neutral-700">
                      {item.priority}
                    </td>

                    <td className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(item.id)}
                        className={`px-2.5 py-1 rounded text-[10px] uppercase font-bold border transition ${
                          item.isActive
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-neutral-100 text-neutral-600 border-neutral-200"
                        }`}
                      >
                        {item.isActive ? "ACTIVE (BROADCASTING)" : "INACTIVE"}
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1.5 text-neutral-500 hover:text-black rounded-md hover:bg-neutral-100 transition"
                          title="Edit Announcement"
                        >
                          <EditIcon className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 text-neutral-400 hover:text-red-600 rounded-md hover:bg-red-50 transition"
                          title="Delete"
                        >
                          <TrashIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200 mb-6">
              <h2 className="text-base font-bold uppercase tracking-wider text-neutral-900">
                {editingItem ? "Edit Announcement" : "Create Announcement"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-900 p-1 rounded-md"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Preset Buttons */}
            <div className="mb-4">
              <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider block mb-2">
                Quick Template Presets:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  "SALE — UP TO 40% OFF SELECTED PRODUCTS",
                  "BUY 2 TEES, TAKE INR 100 BACK!",
                  "CUSTOMIZATION STUDIO IS NOW LIVE",
                  "FREE DELIVERY ACROSS INDIA ON ALL ORDERS",
                ].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className="px-2 py-1 bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 text-neutral-700 text-[10px] font-mono rounded transition"
                  >
                    + {preset}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider">
                  Announcement Text *
                </label>
                <textarea
                  rows={3}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="e.g. SALE — UP TO 40% OFF SELECTED LUXURY HOODIES & TEES"
                  required
                  className="w-full bg-white border border-neutral-300 rounded-lg p-3 text-xs text-neutral-900 placeholder:text-neutral-400 uppercase tracking-wider focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider">
                  Target Link (Optional)
                </label>
                <input
                  type="text"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="e.g. /shop or /collections/printed"
                  className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-2 text-xs font-mono text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider">
                    Display Target
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                  >
                    <option value="MARQUEE">Marquee Ticker (Homepage)</option>
                    <option value="BANNER">Top Promo Banner</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider">
                    Priority Score
                  </label>
                  <input
                    type="number"
                    value={priority}
                    onChange={(e) => setPriority(Number(e.target.value))}
                    placeholder="e.g. 10"
                    className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-2 text-xs font-mono text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 rounded border-neutral-300 text-black focus:ring-black"
                  />
                  <span className="text-xs text-neutral-700 font-medium">
                    Immediately activate and broadcast on storefront
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-neutral-600 hover:text-neutral-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-black text-white hover:bg-neutral-800 transition disabled:opacity-50 shadow-sm"
                >
                  {submitting ? "Saving..." : editingItem ? "Save Changes" : "Create Announcement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
