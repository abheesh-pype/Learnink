import type { Metadata } from "next";

/** Public address of the website. Set NEXT_PUBLIC_SITE_URL in .env.local / hosting to your real domain. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://learnink.edu.in").replace(/\/+$/, "");

/** Used when the admin hasn't written their own robots.txt. Keeps search engines out of admin and API routes. */
export const DEFAULT_ROBOTS_TXT = "User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/";

export const DEFAULT_LOGO = "/logo.png";
export const DEFAULT_FAVICON = "/favicon.ico";

/**
 * Gives a page its own canonical URL (and og:url), so search engines don't treat
 * every page as a copy of the homepage. `path` is relative, e.g. "/about".
 */
export function withPageUrl(metadata: Metadata, path: string): Metadata {
    return {
        ...metadata,
        alternates: { ...metadata.alternates, canonical: path },
        ...(metadata.openGraph ? { openGraph: { ...metadata.openGraph, url: path } } : {}),
    };
}
