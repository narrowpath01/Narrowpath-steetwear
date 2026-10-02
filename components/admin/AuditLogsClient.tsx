"use client";

import React, { useState } from "react";
import Link from "next/link";
import { SearchIcon, ShieldCheckIcon } from "./Icons";

export interface AdminAuditEntry {
  id: string;
  adminEmail: string | null;
  action: string;
  resourceType: string;
  resourceId: string | null;
  details: string | null;
  ipAddress: string | null;
  createdAt: string | Date;
}

interface AuditLogsClientProps {
  initialLogs: AdminAuditEntry[];
}

export function AuditLogsClient({ initialLogs }: AuditLogsClientProps) {
  const [logs] = useState<AdminAuditEntry[]>(initialLogs);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");

  const filteredLogs = logs.filter((log) => {
    const s = search.toLowerCase();
    const matchesSearch =
      search === "" ||
      log.action.toLowerCase().includes(s) ||
      (log.adminEmail && log.adminEmail.toLowerCase().includes(s)) ||
      (log.resourceId && log.resourceId.toLowerCase().includes(s)) ||
      (log.details && log.details.toLowerCase().includes(s));

    const matchesAction = actionFilter === "ALL" || log.action === actionFilter;

    return matchesSearch && matchesAction;
  });

  const getActionBadgeColor = (action: string) => {
    if (action.includes("REFUND")) {
      return "bg-rose-50 text-rose-700 border-rose-200";
    }
    if (action.includes("CREATE") || action.includes("APPROVED")) {
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
    if (action.includes("SHIPMENT") || action.includes("DISPATCH")) {
      return "bg-blue-50 text-blue-700 border-blue-200";
    }
    if (action.includes("REJECT") || action.includes("DELETE") || action.includes("CANCEL")) {
      return "bg-red-50 text-red-700 border-red-200";
    }
    return "bg-neutral-100 text-neutral-800 border-neutral-200";
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-neutral-900 font-mono">
            System Compliance & Audit Trail
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Traceable log of all sensitive operations: refunds, shipment creation, return adjudication, and catalog updates.
          </p>
        </div>

        <div className="px-3.5 py-1.5 rounded-lg bg-white border border-neutral-200 shadow-sm text-xs flex items-center gap-2">
          <ShieldCheckIcon className="w-4 h-4 text-emerald-600" />
          <span className="text-neutral-500">Recorded Events: </span>
          <span className="font-bold text-neutral-900 font-mono">{logs.length}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-white border border-neutral-200 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <SearchIcon className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by action, admin, resource ID, or details..."
            className="w-full bg-white border border-neutral-300 rounded-lg pl-10 pr-4 py-2 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition font-mono"
          />
        </div>

        {/* Action Filters */}
        <div className="flex items-center bg-neutral-100 border border-neutral-200 rounded-lg p-1 text-xs overflow-x-auto">
          {[
            { id: "ALL", label: "All Actions" },
            { id: "ORDER_REFUND", label: "Refunds" },
            { id: "SHIPMENT_CREATED", label: "Shipments" },
            { id: "RETURN_STATUS_UPDATE", label: "Returns" },
            { id: "ORDER_STATUS_UPDATE", label: "Order Status" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActionFilter(tab.id)}
              className={`px-3 py-1 rounded-md text-[11px] font-semibold transition shrink-0 ${
                actionFilter === tab.id
                  ? "bg-white text-neutral-900 shadow-sm font-bold"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-[10px] uppercase text-neutral-600 font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Operator</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Resource</th>
                <th className="py-3 px-4">Event Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 font-mono text-xs">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-neutral-500 font-sans">
                    <p className="font-semibold text-neutral-800">No audit events match your filter</p>
                    <p className="text-[11px] mt-0.5">As operations are executed, audit entries will log here.</p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-neutral-50/50 transition">
                    <td className="py-3 px-4 text-neutral-500 whitespace-nowrap text-[11px]">
                      {new Date(log.createdAt).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </td>
                    <td className="py-3 px-4 text-neutral-800 font-semibold text-[11px]">
                      {log.adminEmail || "System Auto"}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border font-sans inline-block ${getActionBadgeColor(
                          log.action
                        )}`}
                      >
                        {log.action.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-neutral-700 text-[11px]">
                      <span className="font-semibold text-neutral-900">{log.resourceType}</span>
                      {log.resourceId && (
                        log.resourceType === "Order" ? (
                          <Link
                            href={`/admin/orders/${log.resourceId}`}
                            className="block text-[10px] text-blue-600 hover:underline mt-0.5"
                          >
                            #{log.resourceId.slice(-8)}
                          </Link>
                        ) : (
                          <span className="block text-[10px] text-neutral-400 mt-0.5 truncate max-w-[120px]">
                            {log.resourceId}
                          </span>
                        )
                      )}
                    </td>
                    <td className="py-3 px-4 text-neutral-700 font-sans text-xs max-w-md">
                      {log.details || "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
