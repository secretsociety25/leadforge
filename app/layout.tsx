import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { SiteFooter } from "@/components/site-footer";
import { getSiteUrl } from "@/lib/site-url";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const siteUrl = getSiteUrl();
const siteName = "LeadForge by MTDFIX";
const defaultDescription =
  "Personalized B2B outbound that converts — LinkedIn research, AI drafts, verified deliverability.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description: defaultDescription,
  applicationName: "LeadForge",
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: siteUrl,
    siteName,
    title: siteName,
    description: defaultDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description: defaultDescription,
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} min-h-screen bg-zinc-950 font-sans text-zinc-50 antialiased`}
      >
        <div className="flex min-h-screen flex-col">
          <div className="flex-1">{children}</div>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
