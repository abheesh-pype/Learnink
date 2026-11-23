// Server-side only (reads the database). Gallery = headed sections, each with photos / videos.
import dbConnect from "@/lib/db";
import { GalleryPhoto, GallerySection } from "@/lib/models";

export const MAX_TITLE = 120;
export const MAX_DESCRIPTION = 500;
export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface GalleryItem {
    _id: string;
    imageUrl: string; // photo or video URL
    mediaType?: "image" | "video";
    caption?: string;
    order: number;
    sectionId?: string | null;
}

export interface GallerySectionWithItems {
    _id: string;
    title: string;
    description?: string | null;
    order: number;
    items: GalleryItem[];
}

/**
 * All sections in display order (by "order", then oldest first), each with its items in the same order.
 * `includeEmpty`: the admin needs empty sections; the public site hides them.
 */
export async function loadGallerySections({ includeEmpty = false } = {}): Promise<GallerySectionWithItems[]> {
    await dbConnect();
    const [sections, items] = await Promise.all([
        GallerySection.find({}).sort({ order: 1, createdAt: 1 }).lean(),
        GalleryPhoto.find({}).sort({ order: 1, createdAt: 1 }).lean(),
    ]);

    const bySection = new Map<string, GalleryItem[]>();
    for (const item of items as GalleryItem[]) {
        if (!item.sectionId) continue;
        const list = bySection.get(item.sectionId) ?? [];
        list.push(item);
        bySection.set(item.sectionId, list);
    }

    const result: GallerySectionWithItems[] = (sections as GallerySectionWithItems[]).map((s) => ({
        _id: s._id,
        title: s.title,
        description: s.description ?? null,
        order: s.order,
        items: bySection.get(s._id) ?? [],
    }));
    return JSON.parse(JSON.stringify(includeEmpty ? result : result.filter((s) => s.items.length > 0)));
}
