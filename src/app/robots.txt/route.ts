import { SiteConfig } from "@/lib/models";
import dbConnect from "@/lib/db";
import { DEFAULT_ROBOTS_TXT, SITE_URL } from "@/lib/site";

// Refreshed when the admin saves SEO settings (lib/revalidate.ts), or every 5 minutes.
export const revalidate = 300;

// Serves the robots.txt written in Admin → SEO Settings → Robots.txt Configuration.
export async function GET() {
    let body = DEFAULT_ROBOTS_TXT;

    try {
        await dbConnect();
        const config = await SiteConfig.findOne({ key: "global-seo" }).lean();
        const custom = typeof config?.robotsTxt === "string" ? config.robotsTxt.trim() : "";
        if (custom) body = custom;
    } catch (e) {
        console.error("Failed to load robots.txt settings", e);
    }

    // Always point search engines at the sitemap, unless the admin already did.
    if (!/^\s*sitemap\s*:/im.test(body)) {
        body += `\n\nSitemap: ${SITE_URL}/sitemap.xml`;
    }

    return new Response(body.replace(/\r\n/g, "\n") + "\n", {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
}
