import Link from "next/link";
import { getSiteSettings } from "@/lib/data/settings";
import { NewsletterForm } from "@/components/home/NewsletterForm";

const FOOTER_LINKS = [
  {
    title: "Shop",
    links: [
      { href: "/shop", label: "All Products" },
      { href: "/collections", label: "Collections" },
      { href: "/shop?sort=newest", label: "New Arrivals" },
      { href: "/shop?onSale=true", label: "Sale" },
    ],
  },
  {
    title: "Explore",
    links: [
      { href: "/about", label: "About" },
      { href: "/gallery", label: "Gallery" },
      { href: "/testimonials", label: "Testimonials" },
      { href: "/faq", label: "FAQ" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Help",
    links: [
      { href: "/size-guide", label: "Size Guide" },
      { href: "/shipping-returns", label: "Shipping & Returns" },
      { href: "/privacy-policy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms" },
    ],
  },
];

export async function Footer() {
  const settings = await getSiteSettings();

  const socials = [
    { href: settings.instagramUrl, label: "Instagram" },
    { href: settings.tiktokUrl, label: "TikTok" },
    { href: settings.facebookUrl, label: "Facebook" },
  ].filter((s) => s.href);

  return (
    <footer className="border-t border-white/10 bg-black text-[#F5F0E6]">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4 space-y-6">
            <Link
              href="/"
              className="font-serif text-2xl tracking-[0.3em] text-[#F5F0E6]"
            >
              {settings.businessName || "DAYAURA"}
            </Link>
            <p className="max-w-sm text-sm leading-relaxed text-white/55">
              {settings.footerDescription}
            </p>
            <div className="space-y-1 text-sm text-white/55">
              {settings.contactEmail ? (
                <a
                  href={`mailto:${settings.contactEmail}`}
                  className="block transition hover:text-[#D4AF37]"
                >
                  {settings.contactEmail}
                </a>
              ) : null}
              {settings.phone ? (
                <a
                  href={`tel:${settings.phone}`}
                  className="block transition hover:text-[#D4AF37]"
                >
                  {settings.phone}
                </a>
              ) : null}
              {settings.address ? <p>{settings.address}</p> : null}
            </div>
            {socials.length ? (
              <div className="flex flex-wrap gap-4 pt-2">
                {socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] uppercase tracking-[0.22em] text-white/50 transition hover:text-[#D4AF37]"
                  >
                    {s.label}
                  </a>
                ))}
              </div>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-5">
            {FOOTER_LINKS.map((group) => (
              <div key={group.title}>
                <p className="mb-4 text-[10px] uppercase tracking-[0.28em] text-[#D4AF37]">
                  {group.title}
                </p>
                <ul className="space-y-2.5">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-white/60 transition hover:text-[#F5F0E6]"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="lg:col-span-3">
            <p className="mb-2 text-[10px] uppercase tracking-[0.28em] text-[#D4AF37]">
              Newsletter
            </p>
            <p className="mb-4 text-sm text-white/55">
              {settings.firstOrderDiscountText ||
                "Join the list for 10% off your first order."}
            </p>
            <NewsletterForm variant="footer" />
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {settings.businessName || "DAYAURA"}.
            All rights reserved.
          </p>
          <p className="tracking-[0.18em] uppercase">
            Wear Your Aura. Move with Confidence.
          </p>
        </div>
      </div>
    </footer>
  );
}
