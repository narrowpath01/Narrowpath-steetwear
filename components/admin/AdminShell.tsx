"use client";

import React, { useState } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { AdminTopNav } from "./AdminTopNav";

interface AdminShellProps {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    role?: string | null;
  };
  children: React.ReactNode;
}

export function AdminShell({ user, children }: AdminShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-neutral-900 flex flex-col antialiased selection:bg-neutral-900 selection:text-white font-sans">
      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-200 ease-in-out lg:hidden shadow-xl ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <AdminSidebar user={user} onCloseMobile={() => setMobileOpen(false)} />
      </div>

      <div className="flex flex-1">
        {/* Desktop Persistent Sidebar */}
        <div className="hidden lg:block w-64 shrink-0 fixed inset-y-0 left-0 z-30">
          <AdminSidebar user={user} />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 lg:pl-64 flex flex-col min-h-screen min-w-0">
          <AdminTopNav user={user} onOpenMobile={() => setMobileOpen(true)} />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
