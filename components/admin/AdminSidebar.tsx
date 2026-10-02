"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  DashboardIcon,
  ProductsIcon,
  CategoriesIcon,
  InventoryIcon,
  OrdersIcon,
  CustomersIcon,
  BlogIcon,
  MegaphoneIcon,
  DiscountIcon,
  SettingsIcon,
  ExternalLinkIcon,
  LogOutIcon,
  XIcon,
  TruckIcon,
  TrendingUpIcon,
  RefreshIcon,
  ShieldCheckIcon,
} from "./Icons";

interface AdminSidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    role?: string | null;
  };
  onCloseMobile?: () => void;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { name: "Dashboard", href: "/admin", icon: DashboardIcon },
      { name: "Analytics", href: "/admin/analytics", icon: TrendingUpIcon },
    ],
  },
  {
    label: "Fulfillment & Orders",
    items: [
      { name: "Orders", href: "/admin/orders", icon: OrdersIcon },
      { name: "Shipments", href: "/admin/shipments", icon: TruckIcon },
      { name: "Returns & Claims", href: "/admin/returns", icon: RefreshIcon },
    ],
  },
  {
    label: "Catalog",
    items: [
      { name: "Products", href: "/admin/products", icon: ProductsIcon },
      { name: "Categories", href: "/admin/categories", icon: CategoriesIcon },
      { name: "Inventory", href: "/admin/inventory", icon: InventoryIcon },
    ],
  },
  {
    label: "Sales",
    items: [
      { name: "Promotions", href: "/admin/promotions", icon: DiscountIcon },
    ],
  },
  {
    label: "Customers",
    items: [
      { name: "Customers", href: "/admin/customers", icon: CustomersIcon },
    ],
  },
  {
    label: "Content CMS",
    items: [
      { name: "Blog Posts", href: "/admin/blogs", icon: BlogIcon },
      { name: "Announcements", href: "/admin/announcements", icon: MegaphoneIcon },
    ],
  },
  {
    label: "System & Compliance",
    items: [
      { name: "Audit Logs", href: "/admin/audit-logs", icon: ShieldCheckIcon },
      { name: "Settings", href: "/admin/settings", icon: SettingsIcon },
    ],
  },
];

export function AdminSidebar({ user, onCloseMobile }: AdminSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-64 h-full bg-white border-r border-neutral-200 flex flex-col justify-between text-neutral-800 select-none shadow-sm">
      {/* Brand Header */}
      <div>
        <div className="h-16 px-6 border-b border-neutral-200 flex items-center justify-between">
          <Link
            href="/admin"
            className="flex items-center gap-2.5 focus:outline-none group"
            onClick={onCloseMobile}
          >
            <div className="w-8 h-8 bg-black text-white font-black flex items-center justify-center text-xs rounded-lg tracking-tighter shadow-sm">
              NP
            </div>
            <div>
              <span className="text-xs font-black tracking-widest text-neutral-900 uppercase block leading-tight">
                Narrow Path
              </span>
              <span className="text-[10px] tracking-wider text-neutral-500 uppercase font-semibold block">
                Admin Console
              </span>
            </div>
          </Link>

          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden text-neutral-500 hover:text-black p-1.5 rounded-md hover:bg-neutral-100 transition"
              aria-label="Close navigation"
            >
              <XIcon className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation items */}
        <div className="px-3 py-4 space-y-6 overflow-y-auto max-h-[calc(100vh-10rem)] scrollbar-thin scrollbar-thumb-neutral-200">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="space-y-1">
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                {group.label}
              </p>
              {group.items.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onCloseMobile}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      active
                        ? "bg-neutral-900 text-white font-semibold shadow-sm"
                        : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${active ? "text-white" : "text-neutral-500"}`} />
                      <span>{item.name}</span>
                    </div>
                    {item.badge && (
                      <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-neutral-100 text-neutral-600">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Footer Area: User Profile & Live Store */}
      <div className="p-3 border-t border-neutral-200 bg-neutral-50 space-y-2">
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-neutral-600 hover:text-black hover:bg-white border border-transparent hover:border-neutral-200 transition"
        >
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Customer Store
          </span>
          <ExternalLinkIcon className="w-3.5 h-3.5 text-neutral-400" />
        </Link>

        <div className="p-2.5 bg-white border border-neutral-200 rounded-lg flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-neutral-900 text-white flex items-center justify-center text-xs font-bold shrink-0 uppercase">
              {user.name ? user.name.slice(0, 2) : "AD"}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-neutral-900 truncate leading-tight">
                {user.name || "Administrator"}
              </p>
              <p className="text-[10px] text-neutral-500 truncate">
                {user.email || user.phone || "Admin"}
              </p>
            </div>
          </div>

          <button
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            title="Sign out of admin"
            className="text-neutral-400 hover:text-red-600 p-1.5 rounded-md hover:bg-red-50 transition shrink-0"
          >
            <LogOutIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
