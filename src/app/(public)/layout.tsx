import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { CinematicIntro } from "@/components/animations/CinematicIntro";
import { PageTransition } from "@/components/animations/PageTransition";
import { Providers } from "@/components/providers/Providers";
import { getSiteSettings } from "@/lib/data/settings";
import { getCollections } from "@/lib/data/queries";
import { serialize } from "@/lib/serialize";

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

  return (
    <Providers>
      <CinematicIntro />
      <PageTransition />
      <Header
        logo={settings.logo}
        businessName={settings.businessName}
        announcementMessages={settings.announcementMessages}
        collections={collections}
      />
      <main className="flex-1 w-full">{children}</main>
      <Footer />
      <CartDrawer
        shippingThreshold={settings.shippingThreshold}
        currency={settings.currency}
      />
    </Providers>
  );
}
