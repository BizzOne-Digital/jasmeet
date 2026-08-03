import { Suspense } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { Providers } from "@/components/providers/Providers";
import { JsonLd } from "@/components/seo/JsonLd";
import { PublicMotionEffects } from "@/components/animations/PublicMotionEffects";
import { getSiteSettings } from "@/lib/data/settings";
import { getCollections } from "@/lib/data/queries";
import { serialize } from "@/lib/serialize";
import { absoluteUrl } from "@/lib/utils";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, collectionsRaw] = await Promise.all([
    getSiteSettings(),
    getCollections(),
  ]);

  const collections = serialize<
    Array<{
      name: string;
      slug: string;
      image?: string;
      description?: string;
    }>
  >(collectionsRaw);

  const headerProps = {
    logo: settings.logo,
    businessName: settings.businessName,
    announcementMessages: settings.announcementMessages,
    collections,
  };

  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: settings.businessName || "DAYAURA",
    url: absoluteUrl(),
    logo: absoluteUrl(settings.logo || "/images/logo.png"),
    email: settings.contactEmail,
    sameAs: [
      settings.instagramUrl,
      settings.tiktokUrl,
      settings.facebookUrl,
    ].filter(Boolean),
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: settings.businessName || "DAYAURA",
    url: absoluteUrl(),
    potentialAction: {
      "@type": "SearchAction",
      target: `${absoluteUrl("/search")}?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <Providers>
      <JsonLd data={[orgJsonLd, websiteJsonLd]} />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:bg-[#D4AF37] focus:px-4 focus:py-3 focus:text-sm focus:font-medium focus:uppercase focus:tracking-[0.16em] focus:text-black"
      >
        Skip to content
      </a>
      <div className="flex min-h-full w-full max-w-full flex-col overflow-x-clip">
        <PublicMotionEffects />
        <Suspense
          fallback={
            <div className="sticky top-0 z-50 h-[calc(2.25rem+4rem)] border-b border-white/10 bg-black/85 lg:h-[calc(2.25rem+4.5rem)]" />
          }
        >
          <Header {...headerProps} />
        </Suspense>
        <main
          id="main-content"
          tabIndex={-1}
          className="w-full max-w-full flex-1 overflow-x-clip outline-none"
        >
          {children}
        </main>
        <Footer />
        <CartDrawer
          shippingThreshold={settings.shippingThreshold}
          currency={settings.currency}
        />
      </div>
    </Providers>
  );
}
