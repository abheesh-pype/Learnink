// Server-side only (reads the database).
import dbConnect from "@/lib/db";
import { BlogPost, BlogSection } from "@/lib/models";
import type { BlogPostFull, BlogPostSummary, BlogSectionWithPosts } from "@/lib/blogShared";
import { makeSnippet, slugify } from "@/lib/blogShared";

export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// content is read only to build the short preview (snippet); it isn't sent to the page.
const SUMMARY_FIELDS = "title slug excerpt content coverImage tag sectionId featured published publishedAt";

/** Dates may come back as Date objects or strings; the site always uses "YYYY-MM-DD". */
function toDay(value: unknown): string {
    if (value instanceof Date) {
        const y = value.getFullYear();
        const m = String(value.getMonth() + 1).padStart(2, "0");
        const d = String(value.getDate()).padStart(2, "0");
        return `${y}-${m}-${d}`;
    }
    return typeof value === "string" ? value.slice(0, 10) : "";
}

function toSummary(row: Record<string, unknown>): BlogPostSummary {
    return {
        _id: String(row._id),
        title: String(row.title ?? ""),
        slug: String(row.slug ?? ""),
        excerpt: (row.excerpt as string) ?? null,
        coverImage: (row.coverImage as string) ?? null,
        tag: (row.tag as string) ?? null,
        sectionId: (row.sectionId as string) ?? null,
        featured: Boolean(row.featured),
        published: Boolean(row.published),
        publishedAt: toDay(row.publishedAt),
        snippet: makeSnippet(row.excerpt as string | null, String(row.content ?? "")),
    };
}

export interface BlogData {
    /** "Popular Posts" at the top of /blogs: only posts ticked as Popular in the admin panel. */
    popular: BlogPostSummary[];
    /** Headings in the admin's order, each with its posts (newest first). */
    sections: BlogSectionWithPosts[];
    /** Posts without a heading (shown as "More Articles"). */
    unsorted: BlogPostSummary[];
    /** Every post, newest first (article sidebar and previous / next links). */
    all: BlogPostSummary[];
}

/** Everything for the /blogs page. `includeDrafts` is for the admin panel. */
export async function loadBlog({ includeDrafts = false, includeEmptySections = false } = {}): Promise<BlogData> {
    await dbConnect();
    const [sectionRows, postRows] = await Promise.all([
        BlogSection.find({}).sort({ order: 1, createdAt: 1 }).lean(),
        BlogPost.find(includeDrafts ? {} : { published: true }).select(SUMMARY_FIELDS).sort({ publishedAt: -1, createdAt: -1 }).lean(),
    ]);
    const posts = (postRows as Record<string, unknown>[]).map(toSummary);

    const sections: BlogSectionWithPosts[] = (sectionRows as Record<string, unknown>[]).map((s) => ({
        _id: String(s._id),
        title: String(s.title),
        order: Number(s.order) || 0,
        posts: posts.filter((p) => p.sectionId === s._id),
    }));
    const sectionIds = new Set(sections.map((s) => s._id));
    const unsorted = posts.filter((p) => !p.sectionId || !sectionIds.has(p.sectionId));

    const popular = posts.filter((p) => p.featured && p.published);

    return {
        popular,
        sections: includeEmptySections ? sections : sections.filter((s) => s.posts.length > 0),
        unsorted,
        all: posts,
    };
}

/** One post with its full text, for /blogs/<slug>. Drafts are hidden unless `includeDrafts`. */
export async function loadBlogPost(slug: string, { includeDrafts = false } = {}): Promise<BlogPostFull | null> {
    await dbConnect();
    const row = (await BlogPost.findOne(includeDrafts ? { slug } : { slug, published: true }).lean()) as Record<string, unknown> | null;
    if (!row) return null;
    return { ...toSummary(row), content: String(row.content ?? "") };
}

/** A slug based on the title that no other post uses (adds -2, -3, … when needed). */
export async function uniqueSlug(title: string, ignoreId?: string): Promise<string> {
    const base = slugify(title);
    for (let n = 1; n < 100; n++) {
        const candidate = n === 1 ? base : `${base}-${n}`;
        const existing = (await BlogPost.findOne({ slug: candidate }).select("slug").lean()) as { _id: string } | null;
        if (!existing || existing._id === ignoreId) return candidate;
    }
    return `${base}-${Date.now()}`;
}
