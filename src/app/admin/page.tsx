"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText,
  HelpCircle,
  Images,
  Mail,
  MessageSquare,
  Package,
  Plus,
  Settings,
  ShoppingBag,
} from "lucide-react";
import AdminHeader from "@/components/admin/AdminHeader";
import { useAdminShell } from "@/components/admin/AdminShell";
import {
  adminCardClass,
  adminCardInnerClass,
  adminLinkActionClass,
  adminPageClass,
  adminSectionTitleClass,
  adminStatCardClass,
  adminStatLabelClass,
  adminStatValueClass,
} from "@/components/admin/admin-ui";
import { adminFetch } from "@/lib/admin-fetch";
import { useToast } from "@/components/admin/ToastProvider";
import { cn } from "@/lib/utils";

interface DashboardStats {
  products: { total: number; published: number; draft: number };
  gallery: number;
  faqs: number;
  newsletter: number;
  contact: number;
  orders?: number;
}

export default function AdminDashboardPage() {
  const { openSidebar } = useAdminShell();
  const { error: toastError } = useToast();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      const result = await adminFetch<DashboardStats>("/api/admin/dashboard");
      if (!result.success) {
        toastError(result.error);
      } else {
        setStats(result.data);
      }
      setLoading(false);
    })();
  }, [toastError]);

  const topStats = [
    {
      label: "Orders",
      value: stats?.orders ?? 0,
      href: "/admin/orders",
    },
    {
      label: "Products",
      value: stats?.products.total,
      href: "/admin/products",
    },
    {
      label: "Published",
      value: stats?.products.published,
      href: "/admin/products?status=published",
    },
  ];

  const quickActions = [
    { href: "/admin/products/new", label: "Add product", icon: Plus },
    { href: "/admin/orders", label: "View orders", icon: ShoppingBag },
    { href: "/admin/pages", label: "Edit pages", icon: FileText },
    { href: "/admin/collections", label: "Collections", icon: FileText },
    { href: "/admin/gallery", label: "Gallery", icon: Images },
    { href: "/admin/faqs", label: "FAQs", icon: HelpCircle },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ];

  return (
    <>
      <AdminHeader
        title="Dashboard"
        subtitle="Overview of DAYAURA performance"
        onMenuClick={openSidebar}
      />
      <main className={cn(adminPageClass, "space-y-8")}>
        <div className="grid gap-4 sm:grid-cols-3">
          {topStats.map((card) => (
            <Link key={card.label} href={card.href} className={adminStatCardClass}>
              <p className={adminStatLabelClass}>{card.label}</p>
              <p className={adminStatValueClass}>
                {loading ? "—" : (card.value ?? 0)}
              </p>
            </Link>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className={adminCardClass}>
            <div className={cn(adminCardInnerClass, "border-b border-white/[0.06]")}>
              <div className="flex items-center justify-between gap-3">
                <h2 className={adminSectionTitleClass}>Recent activity</h2>
                <Link href="/admin/products" className={adminLinkActionClass}>
                  View all
                </Link>
              </div>
            </div>
            <ul className="divide-y divide-white/[0.05] px-5 py-2 sm:px-6">
              {[
                {
                  label: "Published products on storefront",
                  value: stats?.products.published,
                },
                {
                  label: "Draft products awaiting publish",
                  value: stats?.products.draft,
                },
                {
                  label: "Newsletter subscribers",
                  value: stats?.newsletter,
                  icon: Mail,
                },
                {
                  label: "Contact form submissions",
                  value: stats?.contact,
                  icon: MessageSquare,
                },
                {
                  label: "Gallery items",
                  value: stats?.gallery,
                  icon: Images,
                },
                {
                  label: "FAQ entries",
                  value: stats?.faqs,
                  icon: HelpCircle,
                },
              ].map((row) => (
                <li
                  key={row.label}
                  className="flex items-center justify-between gap-4 py-3.5 text-sm"
                >
                  <span className="text-zinc-400">{row.label}</span>
                  <span className="shrink-0 font-medium text-white">
                    {loading ? "…" : (row.value ?? 0)}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className={adminCardClass}>
            <div className={cn(adminCardInnerClass, "border-b border-white/[0.06]")}>
              <h2 className={adminSectionTitleClass}>Quick actions</h2>
            </div>
            <div className="grid gap-0 divide-y divide-white/[0.05] sm:grid-cols-2 sm:divide-y-0">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="flex items-center gap-3 px-5 py-4 text-sm text-zinc-300 transition hover:bg-white/[0.02] hover:text-[#D4AF37] sm:px-6"
                  >
                    <Icon className="h-4 w-4 shrink-0 text-zinc-500" />
                    {action.label}
                  </Link>
                );
              })}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
