"use client";

import Link from "next/link";
import { ExternalLink, Menu } from "lucide-react";
import {
  adminPageSubtitleClass,
  adminPageTitleClass,
} from "@/components/admin/admin-ui";

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  onMenuClick: () => void;
  actions?: React.ReactNode;
}

export default function AdminHeader({
  title,
  subtitle,
  onMenuClick,
  actions,
}: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-black">
      {/* Portal strip */}
      <div className="flex items-center justify-between gap-4 border-b border-white/[0.06] px-5 py-3 sm:px-8 lg:px-10">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="rounded-md p-2 text-zinc-400 hover:bg-white/[0.04] hover:text-white lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0 leading-tight">
            <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-[#D4AF37]">
              Admin Portal
            </p>
            <p className="font-display text-lg tracking-wide text-white sm:text-xl">
              DAYAURA
            </p>
          </div>
        </div>
        <Link
          href="/"
          target="_blank"
          className="inline-flex shrink-0 items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-400 transition hover:text-[#D4AF37]"
        >
          View storefront
          <ExternalLink className="h-3 w-3" />
        </Link>
      </div>

      {/* Page title row */}
      <div className="flex flex-col gap-4 px-5 py-6 sm:flex-row sm:items-end sm:justify-between sm:px-8 lg:px-10">
        <div className="min-w-0">
          <h1 className={adminPageTitleClass}>{title}</h1>
          {subtitle ? (
            <p className={adminPageSubtitleClass}>{subtitle}</p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {actions}
          </div>
        ) : null}
      </div>
    </header>
  );
}
