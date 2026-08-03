"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Clock, Search, X } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { SafeImage } from "@/components/ui/SafeImage";
import { getCollectionImage } from "@/lib/images";
import { useRecentSearchesStore } from "@/store/recent-searches";

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
}

function useDebouncedValue(value: string, delay = 220) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export function SearchBox({
  initialQuery = "",
  autoFocus = false,
}: {
  initialQuery?: string;
  autoFocus?: boolean;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState(initialQuery);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<SearchProductHit[]>([]);
  const [collections, setCollections] = useState<SearchCollectionHit[]>([]);
  const debounced = useDebouncedValue(query.trim());

  const recent = useRecentSearchesStore((s) => s.searches);
  const addSearch = useRecentSearchesStore((s) => s.addSearch);
  const removeSearch = useRecentSearchesStore((s) => s.removeSearch);
  const clearSearches = useRecentSearchesStore((s) => s.clearSearches);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!panelRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    if (!open) return;
    if (!debounced) {
      setProducts([]);
      setCollections([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(debounced)}&productLimit=5&collectionLimit=3`
        );
        const json = await res.json();
        const data = json?.data || {};
        if (!cancelled) {
          setProducts(Array.isArray(data.products) ? data.products : []);
          setCollections(
            Array.isArray(data.collections) ? data.collections : []
          );
        }
      } catch {
        if (!cancelled) {
          setProducts([]);
          setCollections([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [debounced, open]);

  const submit = (term: string) => {
    const q = term.trim();
    if (!q) return;
    addSearch(q);
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  const showPanel =
    open &&
    (recent.length > 0 ||
      !!debounced ||
      products.length > 0 ||
      collections.length > 0 ||
      loading);

  return (
    <div ref={panelRef} className="relative mb-10 max-w-xl">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(query);
        }}
        className="flex gap-3"
      >
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#D4AF37]" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder="Search products & collections…"
            className="h-11 w-full border border-white/15 bg-transparent pl-10 pr-10 text-sm outline-none focus:border-gold"
            autoComplete="off"
          />
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-gold"
              aria-label="Clear"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>
        <button
          type="submit"
          className="h-11 bg-gold px-6 text-xs uppercase tracking-[0.18em] text-black"
        >
          Search
        </button>
      </form>

      {showPanel ? (
        <div className="absolute z-30 mt-2 w-full overflow-hidden border border-white/10 bg-[#0c0c0c] shadow-xl">
          {!debounced && recent.length > 0 ? (
            <div className="p-3">
              <div className="mb-2 flex items-center justify-between px-1">
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/45">
                  Recent searches
                </p>
                <button
                  type="button"
                  onClick={clearSearches}
                  className="text-[10px] uppercase tracking-[0.14em] text-white/35 hover:text-gold"
                >
                  Clear
                </button>
              </div>
              {recent.map((term) => (
                <div key={term} className="flex items-center">
                  <button
                    type="button"
                    onClick={() => submit(term)}
                    className="flex min-w-0 flex-1 items-center gap-2 px-2 py-2 text-left text-sm hover:bg-white/5"
                  >
                    <Clock className="h-3.5 w-3.5 shrink-0 text-white/35" />
                    <span className="truncate">{term}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => removeSearch(term)}
                    className="p-2 text-white/30 hover:text-gold"
                    aria-label={`Remove ${term}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : null}

          {debounced && loading ? (
            <p className="px-4 py-5 text-sm text-white/45">Searching…</p>
          ) : null}

          {debounced &&
          !loading &&
          products.length === 0 &&
          collections.length === 0 ? (
            <p className="px-4 py-5 text-sm text-white/45">
              No instant matches. Press Search for full results.
            </p>
          ) : null}

          {debounced && !loading && collections.length > 0 ? (
            <div className="border-t border-white/5 p-3">
              <p className="mb-2 px-1 text-[10px] uppercase tracking-[0.2em] text-white/45">
                Collections
              </p>
              {collections.map((c) => (
                <Link
                  key={c._id}
                  href={`/collections/${c.slug}`}
                  onClick={() => {
                    addSearch(query.trim() || c.name);
                    setOpen(false);
                  }}
                  className="flex items-center gap-3 px-2 py-2 hover:bg-white/5"
                >
                  <span className="relative h-10 w-14 shrink-0 overflow-hidden bg-[#141414]">
                    <SafeImage
                      src={getCollectionImage(c.slug)}
                      alt={c.name}
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  </span>
                  <span className="truncate text-sm">{c.name}</span>
                </Link>
              ))}
            </div>
          ) : null}

          {debounced && !loading && products.length > 0 ? (
            <div className={cn("p-3", collections.length && "border-t border-white/5")}>
              <p className="mb-2 px-1 text-[10px] uppercase tracking-[0.2em] text-white/45">
                Products
              </p>
              {products.map((p) => (
                <Link
                  key={p._id}
                  href={`/products/${p.slug}`}
                  onClick={() => {
                    addSearch(query.trim() || p.name);
                    setOpen(false);
                  }}
                  className="flex items-center gap-3 px-2 py-2 hover:bg-white/5"
                >
                  <span className="relative h-12 w-9 shrink-0 overflow-hidden bg-[#141414]">
                    <SafeImage
                      src={p.images?.[0]}
                      alt={p.name}
                      fill
                      className="object-cover"
                      sizes="36px"
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm">{p.name}</span>
                    <span className="text-xs text-white/40">
                      {formatPrice(p.price)}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
