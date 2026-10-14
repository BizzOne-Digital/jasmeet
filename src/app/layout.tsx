import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import { getSiteSettings } from "@/lib/data/settings";
import { absoluteUrl } from "@/lib/utils";
import "./globals.css";

const heading = Cormorant_Garamond({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "600"],
  display: "swap",
});

const body = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const title = settings.seoTitle || "DAYAURA | Wear Your Aura. Move with Confidence.";
  const description =
    settings.seoDescription ||
    "Premium women's activewear combining style, comfort, and performance.";
  const ogImage = absoluteUrl("/images/hero-1.png");

  return {
    metadataBase: new URL(absoluteUrl()),
    title: {
      default: title,
      template: `%s | ${settings.businessName || "DAYAURA"}`,
    },
    description,
    icons: {
      icon: settings.favicon || "/images/logo.png",
      apple: settings.logo || "/images/logo.png",
    },
    openGraph: {
      type: "website",
      locale: "en_CA",
      siteName: settings.businessName || "DAYAURA",
      title,
      description,
      url: absoluteUrl(),
      images: [{ url: ogImage, width: 1200, height: 630, alt: "DAYAURA" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    alternates: {
      canonical: absoluteUrl(),
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${heading.variable} ${body.variable} h-full max-w-full overflow-x-clip antialiased`}
    >
      <body className="flex min-h-full w-full max-w-full flex-col overflow-x-clip bg-background font-sans text-foreground">
        {children}
      </body>
    </html>
  );
}
