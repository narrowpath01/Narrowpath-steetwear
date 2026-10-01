"use client";

import React, { useState } from "react";
import Link from "next/link";
import { SearchIcon, EyeIcon } from "./Icons";

export interface AdminCustomerSummary {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  role: string;
  orders: {
    id: string;
    amount: number;
    status: string;
    createdAt: string | Date;
  }[];
  addresses: {
    id: string;
    city: string;
    state: string;
  }[];
}

interface CustomerListClientProps {
  initialCustomers: AdminCustomerSummary[];
}

export function CustomerListClient({ initialCustomers }: CustomerListClientProps) {
  const [customers, setCustomers] = useState<AdminCustomerSummary[]>(initialCustomers);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  const filtered = customers.filter((c) => {
    const matchesSearch =
      search === "" ||
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.phone?.includes(search);

    const matchesRole = roleFilter === "ALL" || c.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-neutral-900">
            Customer Directory
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Registered customer accounts, purchasing records, and lifetime store spend.
          </p>
        </div>

        <div className="px-3.5 py-1.5 rounded-lg bg-white border border-neutral-200 shadow-sm text-xs">
          <span className="text-neutral-500">Registered Accounts: </span>
          <span className="font-bold text-neutral-900 font-mono">{customers.length}</span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-white border border-neutral-200 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <SearchIcon className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer name, email, or mobile..."
            className="w-full bg-white border border-neutral-300 rounded-lg pl-10 pr-4 py-2 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition"
          />
        </div>

        <div className="flex items-center bg-neutral-100 border border-neutral-200 rounded-lg p-1 text-xs">
          {["ALL", "CUSTOMER", "ADMIN"].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1 rounded-md text-[11px] font-semibold transition ${
                roleFilter === r
                  ? "bg-white text-neutral-900 shadow-sm font-bold"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Customer Table */}
      <div className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-neutral-500">
            No customer accounts found matching criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-700">
              <thead className="bg-neutral-50 text-[11px] uppercase tracking-wider text-neutral-500 border-b border-neutral-200">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Customer</th>
                  <th className="py-3.5 px-4 font-semibold">Contact</th>
                  <th className="py-3.5 px-4 font-semibold">Role</th>
                  <th className="py-3.5 px-4 font-semibold">Orders Count</th>
                  <th className="py-3.5 px-4 font-semibold">Lifetime Spend</th>
                  <th className="py-3.5 px-4 font-semibold">Saved Locations</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 font-sans">
                {filtered.map((customer) => {
                  const lifetimeSpend = customer.orders
                    .filter((o) => o.status !== "CANCELLED")
                    .reduce((acc, o) => acc + o.amount, 0);

                  return (
                    <tr key={customer.id} className="hover:bg-neutral-50/80 transition group">
                      {/* Name & Avatar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center text-xs font-bold text-neutral-800 uppercase shrink-0">
                            {customer.name ? customer.name.slice(0, 2) : "CU"}
                          </div>
                          <div>
                            <Link
                              href={`/admin/customers/${customer.id}`}
                              className="font-semibold text-neutral-900 hover:underline block truncate max-w-[180px]"
                            >
                              {customer.name || "Customer Account"}
                            </Link>
                            <span className="text-[10px] text-neutral-400 font-mono">
                              ID: {customer.id.slice(0, 8)}...
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-3.5 px-4">
                        <p className="text-neutral-900 font-medium truncate max-w-[200px]">
                          {customer.email || "No email"}
                        </p>
                        {customer.phone && (
                          <p className="text-[11px] text-neutral-500 font-mono mt-0.5">
                            +91 {customer.phone}
                          </p>
                        )}
                      </td>

                      {/* Role */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${
                            customer.role === "ADMIN"
                              ? "bg-purple-50 text-purple-700 border-purple-200"
                              : "bg-neutral-100 text-neutral-700 border-neutral-200"
                          }`}
                        >
                          {customer.role}
                        </span>
                      </td>

                      {/* Orders Count */}
                      <td className="py-3.5 px-4 font-mono font-semibold text-neutral-900">
                        {customer.orders.length} order(s)
                      </td>

                      {/* Lifetime Spend */}
                      <td className="py-3.5 px-4 font-mono font-bold text-neutral-900">
                        ₹{lifetimeSpend.toLocaleString("en-IN")}
                      </td>

                      {/* Addresses */}
                      <td className="py-3.5 px-4 text-neutral-600">
                        {customer.addresses.length > 0 ? (
                          <span>
                            {customer.addresses[0].city}, {customer.addresses[0].state}
                            {customer.addresses.length > 1 && ` (+${customer.addresses.length - 1})`}
                          </span>
                        ) : (
                          <span className="text-neutral-400">—</span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/admin/customers/${customer.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 text-neutral-900 text-xs font-semibold transition shadow-sm"
                        >
                          <EyeIcon className="w-3.5 h-3.5 text-neutral-500" />
                          <span>Profile</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
