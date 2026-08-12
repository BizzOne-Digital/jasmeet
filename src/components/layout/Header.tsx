"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Heart, Menu, Search, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
import { useWishlistStore } from "@/store/wishlist";
import { PromoBar } from "@/components/layout/PromoBar";
import { MobileNav } from "@/components/layout/MobileNav";
import { SafeImage } from "@/components/ui/SafeImage";
import { getCollectionImage } from "@/lib/images";
import { SearchOverlay } from "@/components/search/SearchOverlay";

export interface HeaderCollection {
  name: string;
  slug: string;
  image?: string;
  description?: string;
}

export interface HeaderProps {
  logo?: string;
  businessName?: string;
  announcementMessages?: string[];
  collections?: HeaderCollection[];
}

const NAV_LINKS = [
  { href: "/shop", label: "All Products" },
  { href: "/collections", label: "Collections" },
  { href: "/shop?newArrival=true", label: "New Arrivals" },
  { href: "/shop?featured=true", label: "Featured Picks" },
  { href: "/about", label: "About" },
];

const navLinkClass =
  "group relative whitespace-nowrap py-2 text-[11px] font-medium uppercase tracking-[0.16em] transition-colors xl:tracking-[0.18em]";

function isNavLinkActive(
  href: string,
  pathname: string,
  searchParams: URLSearchParams
): boolean {
  const [path, query = ""] = href.split("?");
  if (pathname !== path && !(path !== "/" && pathname.startsWith(path))) {
    return false;
  }
  if (path === "/shop") {
    const wantsNew = query.includes("newArrival=true");
    const wantsFeatured = query.includes("featured=true");
    const hasNew = searchParams.get("newArrival") === "true";
    const hasFeatured = searchParams.get("featured") === "true";
    if (wantsNew) return hasNew;
    if (wantsFeatured) return hasFeatured;
    // Plain All Products — active only when no new/featured filter
    return !hasNew && !hasFeatured && pathname === "/shop";
  }
  if (path === "/collections") {
    return pathname === "/collections" || pathname.startsWith("/collections/");
  }
  return pathname === path || pathname.startsWith(`${path}/`);
}

export function Header({
  logo = "/images/logo.png",
  businessName = "DAYAURA",
  announcementMessages = [],
  collections = [],
}: HeaderProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [showLogoImg, setShowLogoImg] = useState(Boolean(logo));
  const [mounted, setMounted] = useState(false);

  const openCart = useCartStore((s) => s.openCart);
  const cartCount = useCartStore((s) => s.getItemCount());
  const wishlistCount = useWishlistStore((s) => s.getItemCount());

  const isHome = pathname === "/";
  const navLinks = NAV_LINKS;

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!logo) {
      setShowLogoImg(false);
      return;
    }
    const img = new window.Image();
    img.onload = () => setShowLogoImg(true);
    img.onerror = () => setShowLogoImg(false);
    img.src = logo;
  }, [logo]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const search = searchParams.toString();

  useEffect(() => {
    setMobileOpen(false);
    setMegaOpen(false);
    setSearchOpen(false);
  }, [pathname, search]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <PromoBar messages={announcementMessages} />
      <header
        className={cn(
          "sticky top-0 z-50 transition-all duration-500",
          scrolled
            ? "border-b border-white/10 bg-black/85 backdrop-blur-md"
            : "bg-transparent"
        )}
      >
        <div
          className={cn(
            "mx-auto flex h-[4rem] w-full max-w-7xl items-center gap-1 px-3 sm:h-[4.5rem] sm:gap-4 sm:px-6 lg:h-[5.25rem] lg:px-8",
            "pt-[max(0px,env(safe-area-inset-top))]",
            isHome ? "justify-between lg:grid lg:grid-cols-3" : "justify-between"
          )}
        >
          <button
            type="button"
            className="flex h-10 w-10 shrink-0 items-center justify-center text-[#F5F0E6] sm:h-11 sm:w-11 lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            aria-expanded={mobileOpen}
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link
            href="/"
            className="flex min-w-0 shrink items-center gap-2 sm:gap-3 lg:col-start-1"
          >
            {showLogoImg ? (
              <span className="relative block h-10 w-10 shrink-0 sm:h-12 sm:w-12 lg:h-16 lg:w-16">
                <SafeImage
                  src={logo}
                  alt={businessName}
                  fill
                  className="bg-transparent object-contain"
                  sizes="64px"
                />
              </span>
            ) : null}
            <span className="truncate font-display text-[0.9375rem] tracking-[0.12em] text-[#F5F0E6] sm:text-lg sm:tracking-[0.18em] md:text-xl md:tracking-[0.24em] lg:text-2xl lg:tracking-[0.28em]">
              {businessName || "DAYAURA"}
            </span>
          </Link>

          <nav
            className={cn(
              "hidden flex-nowrap items-center justify-center gap-3 xl:gap-5 lg:flex",
              isHome && "lg:col-start-2"
            )}
            aria-label="Primary"
          >
            {navLinks.map((link) => {
              const isCollections = link.href === "/collections";
              const active = isNavLinkActive(link.href, pathname, searchParams);

              if (isCollections) {
                return (
                  <div
                    key={link.href}
                    className="relative"
                    onMouseEnter={() => setMegaOpen(true)}
                    onMouseLeave={() => setMegaOpen(false)}
                  >
                    <Link
                      href={link.href}
                      className={cn(
                        navLinkClass,
                        active || megaOpen
                          ? "text-[#D4AF37]"
                          : "text-[#F5F0E6] hover:text-[#D4AF37]"
                      )}
                    >
                      {link.label}
                      <span
                        className={cn(
                          "absolute inset-x-0 -bottom-0.5 h-px origin-left bg-[#D4AF37] transition-transform duration-300",
                          active || megaOpen
                            ? "scale-x-100"
                            : "scale-x-0 group-hover:scale-x-100"
                        )}
                      />
                    </Link>

                    <div
                      className={cn(
                        "invisible absolute left-1/2 top-full z-50 w-[min(94vw,820px)] -translate-x-1/2 pt-4 opacity-0 transition-all duration-300",
                        megaOpen && "visible opacity-100"
                      )}
                    >
                      <div className="border border-white/10 bg-[#0a0a0a]/95 p-5 shadow-2xl backdrop-blur-md sm:p-6">
                        <div className="mb-4 flex items-end justify-between">
                          <p className="text-[10px] uppercase tracking-[0.28em] text-[#D4AF37]">
                            Shop collections
                          </p>
                          <Link
                            href="/collections"
                            className="text-[10px] uppercase tracking-[0.2em] text-white/50 hover:text-[#F5F0E6]"
                          >
                            View all
                          </Link>
                        </div>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                          {collections.map((c) => (
                            <Link
                              key={c.slug}
                              href={`/collections/${c.slug}`}
                              className="group/card relative aspect-[16/10] overflow-hidden bg-[#1a1a1a] sm:aspect-[3/2]"
                            >
                              <SafeImage
                                src={getCollectionImage(c.slug, c.image)}
                                alt={c.name}
                                fill
                                className="object-contain object-center transition duration-700 group-hover/card:scale-[1.03]"
                                sizes="(max-width:640px) 45vw, 260px"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
                              <span className="absolute bottom-2.5 left-3 right-3 text-xs uppercase tracking-[0.18em] text-[#F5F0E6]">
                                {c.name}
                              </span>
                            </Link>
                          ))}
                          {!collections.length ? (
                            <p className="col-span-full text-sm text-white/50">
                              Collections coming soon.
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    navLinkClass,
                    active
                      ? "text-[#D4AF37]"
                      : "text-[#F5F0E6] hover:text-[#D4AF37]"
                  )}
                >
                  {link.label}
                  <span
                    className={cn(
                      "absolute inset-x-0 -bottom-0.5 h-px origin-left bg-[#D4AF37] transition-transform duration-300",
                      active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                    )}
                  />
                </Link>
              );
            })}
          </nav>

          <div
            className={cn(
              "flex shrink-0 items-center gap-0 sm:gap-1",
              isHome && "lg:col-start-3 lg:justify-end"
            )}
          >
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="flex h-10 w-10 items-center justify-center text-[#F5F0E6]/85 transition hover:text-[#D4AF37] sm:h-11 sm:w-11"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>
            <Link
              href="/wishlist"
              className="relative flex h-11 w-11 items-center justify-center text-[#F5F0E6]/85 transition hover:text-[#D4AF37]"
              aria-label="Wishlist"
            >
              <Heart className="h-5 w-5" />
              {mounted && wishlistCount > 0 ? (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center bg-[#D4AF37] px-1 text-[9px] font-semibold text-black">
                  {wishlistCount}
                </span>
              ) : null}
            </Link>
            <button
              type="button"
              onClick={openCart}
              className="relative flex h-11 w-11 items-center justify-center text-[#F5F0E6]/85 transition hover:text-[#D4AF37]"
              aria-label="Cart"
            >
              <ShoppingBag className="h-5 w-5" />
              {mounted && cartCount > 0 ? (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center bg-[#D4AF37] px-1 text-[9px] font-semibold text-black">
                  {cartCount}
                </span>
              ) : null}
            </button>
          </div>
        </div>
      </header>

      <MobileNav
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        links={navLinks}
        collections={collections}
      />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
