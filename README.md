# DAYAURA — Premium Women's Activewear

**Wear Your Aura. Move with Confidence.**

Production-quality Next.js e-commerce storefront and CMS admin panel for the DAYAURA premium activewear brand.

## Technology Stack

- **Next.js 16** (App Router) + TypeScript
- **Tailwind CSS 4** — luxury editorial design system
- **MongoDB + Mongoose** — database via `MONGODB_URI`
- **NextAuth v5** — secure admin authentication (bcrypt passwords)
- **Framer Motion** + **GSAP** — cinematic animations
- **React Hook Form + Zod** — form validation
- **Zustand** — cart & wishlist state
- **Cloudinary-ready** image uploads (local fallback for development)
- **Swiper** — premium sliders

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env.local` and fill in values:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/dayaura
NEXTAUTH_SECRET=your-secret-key-min-32-chars-long
NEXTAUTH_URL=http://localhost:3000
ADMIN_EMAIL=admin@dayaura.com
ADMIN_PASSWORD=your-secure-password
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Optional Cloudinary (production image storage):

```env
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
```

### 3. Start MongoDB

Ensure MongoDB is running locally, or use MongoDB Atlas and set `MONGODB_URI` accordingly.

### 4. Connect with MongoDB Compass

MongoDB Compass is a desktop GUI for viewing and managing MongoDB databases. The website uses the same connection string as Compass:

1. Open MongoDB Compass
2. Paste your `MONGODB_URI` (e.g. `mongodb://127.0.0.1:27017/dayaura`)
3. Connect — you'll see collections: `products`, `collections`, `categories`, `pages`, `pagesections`, `faqs`, `galleryitems`, `sitesettings`, etc.

### 5. Seed the database

```bash
npm run seed
```

This idempotently creates admin user, collections, categories, 26 products, pages, homepage sections, FAQs, gallery items, and site settings.

### 6. Run development server

```bash
npm run dev
```

- **Storefront:** http://localhost:3000
- **Admin panel:** http://localhost:3000/admin
- **Admin login:** credentials from `ADMIN_EMAIL` / `ADMIN_PASSWORD`

### 7. Production build

```bash
npm run build
npm start
```

## Public Pages

| Page | Route |
|------|-------|
| Home | `/` |
| About | `/about` |
| Shop | `/shop` |
| Collections | `/collections` |
| Collection detail | `/collections/[slug]` |
| Category detail | `/category/[slug]` |
| Product detail | `/products/[slug]` |
| Gallery | `/gallery` |
| Testimonials | `/testimonials` |
| FAQ | `/faq` |
| Contact | `/contact` |
| Cart | `/cart` |
| Wishlist | `/wishlist` |
| Checkout | `/checkout` |
| Search | `/search` |
| Size Guide | `/size-guide` |
| Shipping & Returns | `/shipping-returns` |
| Privacy Policy | `/privacy-policy` |
| Terms | `/terms` |

## Admin Panel

Navigate to `/admin` after logging in.

| Module | Description |
|--------|-------------|
| **Dashboard** | Product, gallery, FAQ, newsletter, and contact stats |
| **Pages** | Edit homepage and content page sections (text, images, order, visibility) |
| **Products** | Full CRUD — collections, categories, pricing, variants, SEO |
| **Gallery** | Campaign images with captions, collection filters, reorder |
| **FAQs** | Categorize, reorder, activate/deactivate questions |
| **Settings** | Logo, contact info, social links, announcements, shipping threshold |

## Image Uploads

- **With Cloudinary credentials:** Images upload to Cloudinary automatically
- **Without credentials:** Images save to `public/uploads/` locally (development only)

Configure Cloudinary env vars for production deployments.

## Payment Integration

No payment provider is configured by default. Checkout creates orders in MongoDB with `paymentStatus: "test"`.

To integrate Stripe or Square:

1. See `src/lib/orders.ts` — `isPaymentProviderConfigured()` check
2. See `src/app/api/orders/route.ts` — order creation endpoint
3. See `src/components/checkout/CheckoutClient.tsx` — checkout UI
4. Add provider SDK and env vars (e.g. `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`)
5. Update payment status from `"test"` to `"paid"` after successful payment confirmation

**Do not expose secret keys in client-side code.**

## Project Structure

```
src/
├── app/
│   ├── (public)/          # Storefront pages
│   ├── admin/             # CMS admin panel
│   └── api/               # Route handlers
├── components/
│   ├── admin/             # Admin UI
│   ├── animations/        # Intro, transitions, scroll reveals
│   ├── home/              # Homepage sections
│   ├── layout/            # Header, footer, nav
│   ├── product/           # Product cards, filters, gallery
│   └── ui/                # Shared UI primitives
├── lib/
│   ├── data/              # Server-side data queries
│   └── validations/       # Zod schemas
├── models/                # Mongoose models
├── store/                 # Zustand cart/wishlist
└── types/
scripts/
└── seed.ts                # Database seed script
```

## MongoDB Models

- `AdminUser`, `Product`, `Collection`, `Category`
- `Page`, `PageSection`
- `GalleryItem`, `FAQ`, `SiteSettings`
- `NewsletterSubscriber`, `ContactSubmission`, `Order`

## Brand

- **Colors:** Black `#000000`, Beige `#F5F0E6`, Gold `#D4AF37`
- **Logo:** `/public/images/logo.png`
- **Currency:** CAD

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint |
| `npm run seed` | Seed database |

## Deployment

1. Set all environment variables on your hosting platform (Vercel, Railway, etc.)
2. Use MongoDB Atlas for production database
3. Configure Cloudinary for image storage
4. Set a strong `NEXTAUTH_SECRET` (32+ characters)
5. Run `npm run build` — must complete without errors
6. Optionally run seed on first deploy: `npm run seed`

## License

Proprietary — DAYAURA brand. All rights reserved.
