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
} from "lucide-react";
import AdminHeader from "@/components/admin/AdminHeader";
import { useAdminShell } from "@/components/admin/AdminShell";
import { adminFetch } from "@/lib/admin-fetch";
import { useToast } from "@/components/admin/ToastProvider";

interface DashboardStats {
  products: { total: number; published: number; draft: number };
  gallery: number;
  faqs: number;
  newsletter: number;
  contact: number;
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

  const cards = [
    {
      label: "Total products",
      value: stats?.products.total,
      icon: Package,
      href: "/admin/products",
    },
    {
      label: "Published",
      value: stats?.products.published,
      icon: Package,
      href: "/admin/products?status=published",
    },
    {
      label: "Drafts",
      value: stats?.products.draft,
      icon: Package,
      href: "/admin/products?status=draft",
    },
    {
      label: "Gallery items",
      value: stats?.gallery,
      icon: Images,
      href: "/admin/gallery",
    },
    {
      label: "FAQs",
      value: stats?.faqs,
      icon: HelpCircle,
      href: "/admin/faqs",
    },
    {
      label: "Newsletter",
      value: stats?.newsletter,
      icon: Mail,
      href: "/admin/settings",
    },
    {
      label: "Contact messages",
      value: stats?.contact,
      icon: MessageSquare,
      href: "/admin",
    },
  ];

  const quickActions = [
    { href: "/admin/products/new", label: "Add product", icon: Plus },
    { href: "/admin/pages", label: "Edit pages", icon: FileText },
    { href: "/admin/gallery", label: "Manage gallery", icon: Images },
    { href: "/admin/faqs", label: "Manage FAQs", icon: HelpCircle },
    { href: "/admin/settings", label: "Site settings", icon: Settings },
  ];

  return (
    <>
      <AdminHeader
        title="Dashboard"
        subtitle="Overview of your DAYAURA storefront"
        onMenuClick={openSidebar}
      />
      <main className="flex-1 space-y-8 p-4 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.label}
                href={card.href}
                className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 transition hover:border-amber-500/30 hover:bg-zinc-900"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                    {card.label}
                  </p>
                  <Icon className="h-4 w-4 text-amber-500/70" />
                </div>
                <p className="mt-3 text-3xl font-semibold text-zinc-100">
                  {loading ? "—" : (card.value ?? 0)}
                </p>
              </Link>
            );
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-amber-400/90">
              Quick actions
            </h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-950/60 px-4 py-3 text-sm text-zinc-300 transition hover:border-amber-500/40 hover:text-amber-300"
                  >
                    <Icon className="h-4 w-4" />
                    {action.label}
                  </Link>
                );
              })}
            </div>
          </section>

          <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-amber-400/90">
              Recent activity
            </h2>
            <ul className="space-y-3 text-sm text-zinc-400">
              <li className="flex items-start justify-between gap-3 border-b border-zinc-800/80 pb-3">
                <span>Published products ready on storefront</span>
                <span className="shrink-0 text-zinc-200">
                  {loading ? "…" : stats?.products.published ?? 0}
                </span>
              </li>
              <li className="flex items-start justify-between gap-3 border-b border-zinc-800/80 pb-3">
                <span>Draft products awaiting publish</span>
                <span className="shrink-0 text-zinc-200">
                  {loading ? "…" : stats?.products.draft ?? 0}
                </span>
              </li>
              <li className="flex items-start justify-between gap-3 border-b border-zinc-800/80 pb-3">
                <span>Active newsletter subscribers</span>
                <span className="shrink-0 text-zinc-200">
                  {loading ? "…" : stats?.newsletter ?? 0}
                </span>
              </li>
              <li className="flex items-start justify-between gap-3">
                <span>Contact form submissions received</span>
                <span className="shrink-0 text-zinc-200">
                  {loading ? "…" : stats?.contact ?? 0}
                </span>
              </li>
            </ul>
          </section>
        </div>
      </main>
    </>
  );
}
