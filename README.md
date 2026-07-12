# Loopgro Headless Storefront

A high-performance **Headless Shopify Storefront** built with Next.js 16, React 19, App Router, TanStack Query, Tailwind CSS, and the Shopify Storefront GraphQL API.

Developed by **Nikhil** for **Loopgro Collective LLP**.

---

## Architecture & Stack

- **Frontend**: Next.js 16 (App Router, Turbopack, Partial Prerendering)
- **UI Components**: React 19, Tailwind CSS, Radix UI primitives
- **Client Queries & Mutations**: TanStack React Query (v5)
- **Backend Integration**: Shopify Storefront GraphQL API
- **Dynamic Content Features**: Public Google Sheets CSV integrations (for Blogs & FAQs)
- **SEO & Search Indexing**: Automated sitemap.xml generator and robots.txt rules

---

## Features

- **Storefront Catalog**: Fetches real-time products and collections directly from your Shopify Store.
- **Dynamic Variant Swatches**: Supports multi-option color and size picker elements.
- **Cart Hook System**: Implements server actions to perform cart operations on the Shopify Cart API.
- **Direct Guest Checkout**: Seamlessly redirects the guest cart to Shopify's secure checkout gateway.
- **Promotional Discounts**: Supports adding and removing Shopify store discount codes directly from the cart layout.
- **Google Sheets Integrations**: Serves dynamic blog entries and FAQ accordion panels managed from public spreadsheet CSV exports.
- **Fast Blur Placeholders**: Pre-generates micro-image blur states for Unsplash and Shopify CDN assets.

---

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` or `.env.local` file in the root directory:

```env
# Production Domain URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Shopify Storefront API Configurations
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN="your-store-name.myshopify.com"
NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN="your_storefront_access_token"

# Optional: Google Sheet CSV GIDs (for Blogs & FAQs)
NEXT_PUBLIC_BLOGS_SHEET_ID="your_blogs_sheet_public_csv_id"
NEXT_PUBLIC_FAQS_SHEET_ID="your_faqs_sheet_public_csv_id"
```

### 3. Run Development Server

```bash
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## Scripts

- `npm run dev` - Starts development server with Turbopack compilation.
- `npm run build` - Compiles the Next.js storefront for production with static pre-rendering.
- `npm run start` - Runs the production compiled storefront.
- `npm run typecheck` - Performs strict TypeScript compiler checks.
- `npm run lint` - Performs ESLint checks.

---

## Project Structure

```text
src/
  app/         App Router routes, layouts, pages, and server actions
  components/  UI layout, cart, and product components
  hooks/       Unified client hooks (e.g. cart hooks)
  lib/         Shopify Storefront GQL integration and image handlers
  styles/      Global styles and theme assets
  utils/       Stateless formatters and helper utilities
```

---

## License

MIT. Developed by Nikhil for Loopgro Collective LLP.