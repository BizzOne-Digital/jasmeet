"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Clock, Search, X } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { SafeImage } from "@/components/ui/SafeImage";
import { getCollectionImage } from "@/lib/images";
import { useRecentSearchesStore } from "@/store/recent-searches";
import { useFocusTrap } from "@/hooks/useFocusTrap";

interface SearchProductHit {
  _id: string;
  name: string;
  slug: string;
  price: number;
  images?: string[];
  collection?: { name?: string; slug?: string } | null;
}

interface SearchCollectionHit {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
}

function useDebouncedValue<T>(value: T, delay = 220): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export function SearchOverlay({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  const [query, setQuery] = useState("");
  const debounced = useDebouncedValue(query.trim(), 220);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<SearchProductHit[]>([]);
  const [collections, setCollections] = useState<SearchCollectionHit[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [mounted, setMounted] = useState(false);

  const recent = useRecentSearchesStore((s) => s.searches);
  const addSearch = useRecentSearchesStore((s) => s.addSearch);
  const removeSearch = useRecentSearchesStore((s) => s.removeSearch);
  const clearSearches = useRecentSearchesStore((s) => s.clearSearches);

  const handleClose = useCallback(() => onClose(), [onClose]);

  useFocusTrap(open, panelRef, handleClose);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setProducts([]);
    setCollections([]);
    setTotalProducts(0);
    setActiveIndex(-1);
    const t = window.setTimeout(() => inputRef.current?.focus(), 50);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.clearTimeout(t);
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (!debounced) {
      setProducts([]);
      setCollections([]);
      setTotalProducts(0);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(debounced)}&productLimit=6&collectionLimit=4`
        );
        const json = await res.json();
        const data = json?.data || {};
        if (!cancelled) {
          setProducts(Array.isArray(data.products) ? data.products : []);
          setCollections(
            Array.isArray(data.collections) ? data.collections : []
          );
          setTotalProducts(Number(data.totalProducts) || 0);
          setActiveIndex(-1);
        }
      } catch {
        if (!cancelled) {
          setProducts([]);
          setCollections([]);
          setTotalProducts(0);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [debounced, open]);

  const goToResults = useCallback(
    (q: string) => {
      const term = q.trim();
      if (!term) return;
      addSearch(term);
      onClose();
      router.push(`/search?q=${encodeURIComponent(term)}`);
    },
    [addSearch, onClose, router]
  );

  const flatLinks = [
    ...collections.map((c) => ({
      type: "collection" as const,
      href: `/collections/${c.slug}`,
      label: c.name,
    })),
    ...products.map((p) => ({
      type: "product" as const,
      href: `/products/${p.slug}`,
      label: p.name,
    })),
  ];

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, flatLinks.length - 1));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && flatLinks[activeIndex]) {
        const hit = flatLinks[activeIndex];
        addSearch(query.trim() || hit.label);
        onClose();
        router.push(hit.href);
        return;
      }
      goToResults(query);
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    goToResults(query);
  };

  const showRecent = !debounced && recent.length > 0;
  const showEmpty =
    !!debounced && !loading && products.length === 0 && collections.length === 0;

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[100] flex items-start justify-center bg-black/80 px-4 pt-[12vh] backdrop-blur-sm sm:px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Search"
            className="w-full max-w-2xl overflow-hidden border border-white/10 bg-[#0c0c0c] shadow-2xl"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={onSubmit} className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
              <Search className="h-5 w-5 shrink-0 text-[#D4AF37]" aria-hidden />
              <label htmlFor="site-search-input" className="sr-only">
                Search products and collections
              </label>
              <input
                id="site-search-input"
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Search products & collections…"
                className="h-11 w-full bg-transparent text-base text-[#F5F0E6] outline-none placeholder:text-white/35"
                aria-autocomplete="list"
                aria-controls={listId}
                aria-expanded={Boolean(debounced || showRecent)}
                autoComplete="off"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    inputRef.current?.focus();
                  }}
                  className="p-1 text-white/50 hover:text-[#D4AF37]"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1 text-white/50 hover:text-[#D4AF37]"
                  aria-label="Close search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </form>

            <div id={listId} className="max-h-[min(60vh,520px)] overflow-y-auto">
              {showRecent ? (
                <div className="p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-[10px] uppercase tracking-[0.22em] text-white/45">
                      Recent searches
                    </p>
                    <button
                      type="button"
                      onClick={clearSearches}
                      className="text-[10px] uppercase tracking-[0.16em] text-white/40 hover:text-[#D4AF37]"
                    >
                      Clear
                    </button>
                  </div>
                  <ul className="space-y-1">
                    {recent.map((term) => (
                      <li key={term} className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => goToResults(term)}
                          className="flex min-w-0 flex-1 items-center gap-3 px-2 py-2.5 text-left text-sm text-[#F5F0E6]/90 transition hover:bg-white/5"
                        >
                          <Clock className="h-3.5 w-3.5 shrink-0 text-white/35" />
                          <span className="truncate">{term}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => removeSearch(term)}
                          className="p-2 text-white/30 hover:text-[#D4AF37]"
                          aria-label={`Remove ${term}`}
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {!debounced && !showRecent ? (
                <div className="px-5 py-8 text-center text-sm text-white/45">
                  Start typing to search DAYAURA pieces and collections.
                </div>
              ) : null}

              {debounced && loading ? (
                <div className="px-5 py-8 text-center text-sm text-white/45">
                  Searching…
                </div>
              ) : null}

              {showEmpty ? (
                <div className="px-5 py-8 text-center">
                  <p className="text-sm text-white/55">
                    No matches for “{debounced}”.
                  </p>
                  <button
                    type="button"
                    onClick={() => goToResults(debounced)}
                    className="mt-3 text-[10px] uppercase tracking-[0.18em] text-[#D4AF37]"
                  >
                    Search all results
                  </button>
                </div>
              ) : null}

              {debounced && !loading && collections.length > 0 ? (
                <section className="border-t border-white/5 p-4">
                  <p className="mb-3 text-[10px] uppercase tracking-[0.22em] text-white/45">
                    Collections
                  </p>
                  <ul className="space-y-1">
                    {collections.map((c, i) => {
                      const index = i;
                      return (
                        <li key={c._id}>
                          <Link
                            href={`/collections/${c.slug}`}
                            onClick={() => {
                              addSearch(query.trim() || c.name);
                              onClose();
                            }}
                            className={cn(
                              "flex items-center gap-3 px-2 py-2 transition hover:bg-white/5",
                              activeIndex === index && "bg-white/5"
                            )}
                          >
                            <span className="relative h-12 w-16 shrink-0 overflow-hidden bg-[#141414]">
                              <SafeImage
                                src={getCollectionImage(c.slug)}
                                alt={c.name}
                                fill
                                className="object-cover"
                                sizes="64px"
                              />
                            </span>
                            <span className="min-w-0">
                              <span className="block truncate text-sm text-[#F5F0E6]">
                                {c.name}
                              </span>
                              {c.description ? (
                                <span className="mt-0.5 block truncate text-xs text-white/40">
                                  {c.description}
                                </span>
                              ) : null}
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ) : null}

              {debounced && !loading && products.length > 0 ? (
                <section className="border-t border-white/5 p-4">
                  <p className="mb-3 text-[10px] uppercase tracking-[0.22em] text-white/45">
                    Products
                  </p>
                  <ul className="space-y-1">
                    {products.map((p, i) => {
                      const index = collections.length + i;
                      return (
                        <li key={p._id}>
                          <Link
                            href={`/products/${p.slug}`}
                            onClick={() => {
                              addSearch(query.trim() || p.name);
                              onClose();
                            }}
                            className={cn(
                              "flex items-center gap-3 px-2 py-2 transition hover:bg-white/5",
                              activeIndex === index && "bg-white/5"
                            )}
                          >
                            <span className="relative h-14 w-11 shrink-0 overflow-hidden bg-[#141414]">
                              <SafeImage
                                src={p.images?.[0]}
                                alt={p.name}
                                fill
                                className="object-cover"
                                sizes="44px"
                              />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm text-[#F5F0E6]">
                                {p.name}
                              </span>
                              <span className="mt-0.5 block text-xs text-white/40">
                                {p.collection?.name
                                  ? `${p.collection.name} · `
                                  : ""}
                                {formatPrice(p.price)}
                              </span>
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                  {totalProducts > products.length ? (
                    <button
                      type="button"
                      onClick={() => goToResults(debounced)}
                      className="mt-3 w-full border border-white/10 py-2.5 text-[10px] uppercase tracking-[0.18em] text-[#D4AF37] transition hover:border-[#D4AF37]/50"
                    >
                      View all {totalProducts} products
                    </button>
                  ) : null}
                </section>
              ) : null}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body
  );
}
