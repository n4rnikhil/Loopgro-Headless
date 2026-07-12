import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Toaster } from "sonner";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Providers } from "@/providers";
import "@/styles/globals.css";
import "@/styles/colors.css";
import "@/styles/animations.css";

const defaultDescription =
  "Shop Loopgro for premium high-performance snowboards, custom flex winter gear, apparel, and snowboarding tuning accessories.";

function getMetadataBase() {
  try {
    return process.env.NEXT_PUBLIC_APP_URL
      ? new URL(process.env.NEXT_PUBLIC_APP_URL)
      : undefined;
  } catch {
    return undefined;
  }
}

export const metadata: Metadata = {
  title: {
    default: "Loopgro Store | Premium Snowboard & Winter Gear",
    template: "%s | Loopgro Store",
  },
  description: defaultDescription,
  metadataBase: getMetadataBase(),
  openGraph: {
    title: "Loopgro Store | Premium Snowboard & Winter Gear",
    description: defaultDescription,
    type: "website",
    siteName: "Loopgro Store",
  },
  twitter: {
    card: "summary_large_image",
    title: "Loopgro Store | Premium Snowboard & Winter Gear",
    description: defaultDescription,
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://cdn.shopify.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://cdn.shopify.com" />
      </head>
      <body className={GeistSans.className}>
        <Providers>
          <Navbar />
          <main className="pointer-events-auto mx-auto w-full max-w-[1920px]">
            {children}
            <Toaster position="bottom-right" />
            <Analytics />
            <SpeedInsights />
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
