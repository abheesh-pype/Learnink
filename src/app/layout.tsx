import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import { OrganizationSchema, WebSiteSchema } from "@/components/JsonLd";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

// Serif font for large display headings (homepage hero, menu). Use with the `font-display` class.
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-cormorant",
  display: "swap",
});


import { SITE_URL as siteUrl, DEFAULT_FAVICON, DEFAULT_LOGO } from "@/lib/site";
import SiteConfigProvider from "@/components/SiteConfigProvider";
import { getContactInfo } from "@/lib/contactSettings";
import { getSiteConfig } from "@/lib/publicData";

// Pages are cached on the server so visitors don't wait for the database (hosted in the USA) on every visit.
// Admin saves refresh the cache immediately (see lib/revalidate.ts); this is just a safety net.
export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  try {
    const config = await getSiteConfig();

    if (config) {
      const socialLinks = [];
      if (config.socialLinks?.facebook) socialLinks.push(config.socialLinks.facebook);
      if (config.socialLinks?.twitter) socialLinks.push(config.socialLinks.twitter);
      if (config.socialLinks?.instagram) socialLinks.push(config.socialLinks.instagram);
      if (config.socialLinks?.linkedin) socialLinks.push(config.socialLinks.linkedin);
      if (config.socialLinks?.youtube) socialLinks.push(config.socialLinks.youtube);

      return {
        title: {
          default: config.title || "Learnink Education | Linking Learning, Skills & Careers",
          template: `%s | ${config.title || "Learnink Education"}`,
        },
        description: config.description,
        keywords: config.keywords,
        // One favicon only: the admin's, or the default. (Canonical URLs are set per page.)
        icons: { icon: config.favicon || DEFAULT_FAVICON },
        metadataBase: new URL(siteUrl),
        openGraph: {
          title: config.title,
          description: config.description,
          siteName: config.title || "Learnink Education",
          images: config.ogImage ? [{ url: config.ogImage, width: 1200, height: 630 }] : undefined,
          locale: 'en_IN',
          type: 'website',
        },
        twitter: {
          card: 'summary_large_image',
          title: config.title,
          description: config.description,
          site: config.twitterHandle || '@learnink',
          images: config.ogImage ? [config.ogImage] : undefined,
        },
        verification: {
          google: config.googleVerification || undefined,
        },
        robots: {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
          },
        },
      };
    }
  } catch (e) {
    console.error("Failed to fetch global SEO", e);
  }

  // Fallback
  return {
    title: {
      default: "Learnink Education | Linking Learning, Skills & Careers",
      template: "%s | Learnink Education",
    },
    description: "Learnink Education Pvt Ltd is an all-in-one education platform offering degree programs, fast track courses, and more.",
    icons: { icon: DEFAULT_FAVICON },
    metadataBase: new URL(siteUrl),
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [config, contact] = await Promise.all([getSiteConfig(), getContactInfo()]);

  const socialLinks: string[] = [];
  if (config?.socialLinks?.facebook) socialLinks.push(config.socialLinks.facebook);
  if (config?.socialLinks?.twitter) socialLinks.push(config.socialLinks.twitter);
  if (config?.socialLinks?.instagram) socialLinks.push(config.socialLinks.instagram);
  if (config?.socialLinks?.linkedin) socialLinks.push(config.socialLinks.linkedin);
  if (config?.socialLinks?.youtube) socialLinks.push(config.socialLinks.youtube);

  return (
    <html lang="en" className={`${plusJakarta.variable} ${cormorant.variable} scroll-smooth scroll-pt-28`}>
      <head>
        <OrganizationSchema
          name={config?.title || "Learnink Education"}
          description={config?.description || "Linking Learning, Skills & Careers"}
          url={siteUrl}
          logo={config?.ogImage}
          sameAs={socialLinks}
          contact={contact}
        />
        <WebSiteSchema
          name={config?.title || "Learnink Education"}
          url={siteUrl}
        />
      </head>
      <body
        className={`font-sans antialiased bg-white text-slate-700 selection:bg-primary-100 selection:text-primary-dark overflow-x-hidden`}
      >
        <Providers>
          {config?.googleAnalyticsId && <GoogleAnalytics gaId={config.googleAnalyticsId} />}
          <SiteConfigProvider
            value={{
              logo: config?.images?.logo || DEFAULT_LOGO,
              heroBg: config?.images?.heroBg || "",
              socialLinks: config?.socialLinks || {},
            }}
          >
            {children}
          </SiteConfigProvider>
        </Providers>
      </body>
    </html>
  );
}
