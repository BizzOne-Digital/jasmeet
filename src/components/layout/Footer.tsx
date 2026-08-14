import Link from "next/link";
import { getSiteSettings } from "@/lib/data/settings";
import { NewsletterForm } from "@/components/home/NewsletterForm";
import { SafeImage } from "@/components/ui/SafeImage";

const FOOTER_COLUMNS = [
  {
    title: "Company",
    links: [
      { href: "/about", label: "About DAYAURA" },
      { href: "/contact", label: "Contact" },
      { href: "/faq", label: "FAQ" },
    ],
  },
  {
    title: "Policies",
    links: [
      { href: "/shipping-returns#shipping", label: "Shipping Policy" },
      { href: "/shipping-returns#returns", label: "Returns Policy" },
      { href: "/privacy-policy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms & Conditions" },
    ],
  },
  {
    title: "Help",
    links: [
      { href: "/track-order", label: "Track Order" },
      { href: "/size-guide", label: "Size Guide" },
      { href: "/shop", label: "Shop All" },
      { href: "/collections", label: "Collections" },
    ],
  },
];

export async function Footer() {
  const settings = await getSiteSettings();
  const email = settings.contactEmail || "dayauraofficial@gmail.com";

  const socials = [
    { href: settings.instagramUrl, label: "Instagram" },
    { href: settings.tiktokUrl, label: "TikTok" },
    { href: settings.facebookUrl, label: "Facebook" },
  ].filter((s) => Boolean(s.href));

  return (
    <footer className="w-full max-w-full overflow-x-clip border-t border-white/10 bg-background pb-[env(safe-area-inset-bottom)] text-beige">
      <div className="container-lux py-20 lg:py-24">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-12">
          {/* Brand + contact email + social */}
          <div className="min-w-0 space-y-6 lg:col-span-4">
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="relative block h-14 w-14 shrink-0 sm:h-16 sm:w-16">
                <SafeImage
                  src={settings.logo || "/images/logo.png"}
                  alt={settings.businessName || "DAYAURA"}
                  fill
                  className="bg-transparent object-contain"
                  sizes="64px"
                />
              </span>
              <span className="font-serif text-2xl tracking-[0.32em] text-beige">
                {settings.businessName || "DAYAURA"}
              </span>
            </Link>
            <p className="max-w-sm text-sm leading-relaxed text-beige/55">
              {settings.footerDescription ||
                "DAYAURA is a premium activewear brand designed to inspire confidence through movement."}
            </p>

            <div>
              <p className="mb-2 text-[10px] uppercase tracking-[0.28em] text-[#D4AF37]">
                Contact
              </p>
              <p className="text-sm text-white/55">
                For inquiries, email us at
              </p>
              <a
                href={`mailto:${email}`}
                className="mt-1 inline-block text-sm text-[#F5F0E6] transition hover:text-[#D4AF37]"
              >
                {email}
              </a>
              {settings.address ? (
                <p className="mt-2 text-sm text-white/45">{settings.address}</p>
              ) : null}
            </div>

            {socials.length ? (
              <div>
                <p className="mb-3 text-[10px] uppercase tracking-[0.28em] text-[#D4AF37]">
                  Social Media
                </p>
                <div className="flex flex-wrap gap-4">
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
              </div>
            ) : null}
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-5">
            {FOOTER_COLUMNS.map((group) => (
              <div key={group.title}>
                <p className="mb-4 text-[10px] uppercase tracking-[0.28em] text-[#D4AF37]">
                  {group.title}
                </p>
                <ul className="space-y-2.5">
                  {group.links.map((link) => (
                    <li key={`${link.href}-${link.label}`}>
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

          {/* Newsletter */}
          <div className="lg:col-span-3">
            <p className="mb-2 text-[10px] uppercase tracking-[0.28em] text-[#D4AF37]">
              Newsletter Signup
            </p>
            <p className="mb-4 text-sm text-white/55">
              {settings.firstOrderDiscountText ||
                "Join the list for 10% off your first order."}
            </p>
            <NewsletterForm variant="footer" />
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-3 border-t border-white/10 pt-8 text-xs text-beige/40 sm:flex-row sm:items-center sm:justify-between">
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
