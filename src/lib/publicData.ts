// Server-side only (reads the database).
// Loads the public homepage data on the server so it arrives with the page HTML,
// instead of each section fetching it in the browser after the page has loaded.
// cache(): each query runs at most once per request, even if several places ask for it.
import { cache } from "react";
import dbConnect from "@/lib/db";
import { Partner, Program, SiteConfig, Testimonial } from "@/lib/models";
import { loadGallerySections } from "@/lib/gallery";
import type { Program as ProgramItem } from "@/components/Programs";
import type { Partner as PartnerItem } from "@/components/Partners";
import type { GallerySection as GallerySectionItem } from "@/components/Gallery";
import type { Testimonial as TestimonialItem } from "@/components/Testimonials";

/** Turns DB rows into plain JSON (dates → strings) so they can be passed to client components. */
function toPlain<T>(value: unknown): T {
    return JSON.parse(JSON.stringify(value));
}

async function safe<T>(label: string, load: () => Promise<T>, fallback: T): Promise<T> {
    try {
        await dbConnect();
        return await load();
    } catch (e) {
        console.error(`Failed to load ${label}`, e);
        return fallback;
    }
}

export const getSiteConfig = cache(async () => {
    try {
        await dbConnect();
        return await SiteConfig.findOne({ key: "global-seo" }).lean();
    } catch (e) {
        console.error("Failed to load site config", e);
        return null;
    }
});

export const getPrograms = cache(() =>
    safe<ProgramItem[]>("programs", async () => toPlain(await Program.find({}).sort({ createdAt: -1 }).lean()), [])
);

export const getPartners = cache(() =>
    safe<PartnerItem[]>("partners", async () => toPlain(await Partner.find({}).sort({ order: 1 }).lean()), [])
);

// Gallery headings, each with its photos / videos (empty sections left out).
export const getGallerySections = cache(() =>
    safe<GallerySectionItem[]>("gallery", () => loadGallerySections(), [])
);

export const getTestimonials = cache(() =>
    safe<TestimonialItem[]>("testimonials", async () => toPlain(await Testimonial.find({}).sort({ order: 1, createdAt: -1 })), [])
);
