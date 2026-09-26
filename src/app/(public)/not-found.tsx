import Link from "next/link";

export default function NotFound() {
  return (
    <div className="relative flex min-h-[70vh] flex-col items-center justify-center overflow-hidden px-4 text-center">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.12),transparent_60%)]" />
      <p className="text-[11px] uppercase tracking-[0.35em] text-gold">404</p>
      <h1 className="mt-4 font-heading text-5xl tracking-wide md:text-7xl">
        Page not found
      </h1>
      <p className="mt-5 max-w-md text-sm leading-relaxed text-muted">
        This path doesn’t exist in the DAYAURA atlas. Let’s get you back to
        movement.
      </p>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/"
          className="inline-flex h-11 items-center bg-gold px-6 text-xs uppercase tracking-[0.2em] text-black"
        >
          Return home
        </Link>
        <Link
          href="/shop"
          className="inline-flex h-11 items-center border border-white/20 px-6 text-xs uppercase tracking-[0.2em] text-beige hover:border-gold hover:text-gold"
        >
          Shop collections
        </Link>
      </div>
    </div>
  );
}
