// Blog types and helpers that are safe in the browser and on the server.

export interface BlogPostSummary {
    _id: string;
    title: string;
    slug: string;
    excerpt?: string | null;
    coverImage?: string | null;
    tag?: string | null;
    sectionId?: string | null;
    /** Ticked as "Popular post" in Admin → Blogs (database column `featured`). */
    featured: boolean;
    published: boolean;
    publishedAt: string; // YYYY-MM-DD
    /** First lines of the article (the summary if there is one), for the "Latest News" list. */
    snippet?: string;
}

export interface BlogPostFull extends BlogPostSummary {
    content: string;
}

export interface BlogSectionWithPosts {
    _id: string;
    title: string;
    order: number;
    posts: BlogPostSummary[];
}

export const BLOG_LIMITS = { title: 200, excerpt: 400, tag: 40, content: 50_000, sectionTitle: 120 };

/** A short plain-text preview: the summary, or the start of the article, cut at a word boundary. */
export function makeSnippet(excerpt: string | null | undefined, content: string, max = 180): string {
    const source = excerpt?.trim() || parseBlogContent(content)
        .map((b) => (b.type === "ul" ? b.items.join(". ") : b.text))
        .join(" ");
    if (source.length <= max) return source;
    const cut = source.slice(0, max);
    const words = cut.slice(0, cut.lastIndexOf(" ") > 0 ? cut.lastIndexOf(" ") : max).trim();
    // Drop a trailing comma / full stop / dash so it doesn't read "teaching,…".
    return `${words.replace(/[\s,;:.\-–—]+$/, "")}…`;
}

/** "2024-02-21" → "February 21, 2024" */
export function formatBlogDate(date: string) {
    const d = new Date(`${date.slice(0, 10)}T00:00:00`);
    return Number.isNaN(d.getTime()) ? date : d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

/** URL-friendly version of a title: "Study Abroad: A Guide!" → "study-abroad-a-guide". */
export function slugify(text: string) {
    return text
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 80) || "post";
}

/**
 * Article text format (no HTML, so nothing unsafe can be injected):
 *   blank line       → new paragraph
 *   "## Heading"     → subheading
 *   "- item" lines   → bullet list
 */
export type ContentBlock = { type: "p"; text: string } | { type: "h2"; text: string } | { type: "ul"; items: string[] };

export function parseBlogContent(content: string): ContentBlock[] {
    const blocks: ContentBlock[] = [];
    for (const chunk of content.replace(/\r\n/g, "\n").split(/\n\s*\n/)) {
        const lines = chunk.split("\n").map((l) => l.trim()).filter(Boolean);
        if (!lines.length) continue;
        if (lines.every((l) => /^[-*•]\s+/.test(l))) {
            blocks.push({ type: "ul", items: lines.map((l) => l.replace(/^[-*•]\s+/, "")) });
            continue;
        }
        let paragraph: string[] = [];
        const flush = () => {
            if (paragraph.length) blocks.push({ type: "p", text: paragraph.join(" ") });
            paragraph = [];
        };
        for (const line of lines) {
            if (line.startsWith("## ")) {
                flush();
                blocks.push({ type: "h2", text: line.slice(3).trim() });
            } else {
                paragraph.push(line);
            }
        }
        flush();
    }
    return blocks;
}
