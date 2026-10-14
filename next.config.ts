import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "dayaura.vercel.app" }],
        destination: "https://dayaura.com/:path*",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.dayaura.vercel.app" }],
        destination: "https://dayaura.com/:path*",
        permanent: true,
      },
    ];
  },
  images: {
    /** Full-resolution uploads — no AVIF/WebP downscale blur on product photos. */
    unoptimized: true,
    formats: ["image/avif", "image/webp"],
    deviceSizes: [390, 430, 640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    qualities: [75, 90, 95, 100],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    localPatterns: [
      { pathname: "/images/**" },
      { pathname: "/api/uploads/**" },
      { pathname: "/**", search: "" },
    ],
    remotePatterns: [
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "http", hostname: "localhost" },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
    /** Allow full 8MB admin uploads when Next.js proxy buffers the request body. */
    proxyClientMaxBodySize: "10mb",
  },
};

export default nextConfig;
