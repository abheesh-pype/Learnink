// Server-side only. Checks and cleans blog post data sent from Admin → Blogs.
import { BlogSection } from "@/lib/models";
import { BLOG_LIMITS } from "@/lib/blogShared";
import { UUID_RE } from "@/lib/blog";
import { isUploadedImagePath, normalizeImageUrl } from "@/lib/imageUrl";

export interface BlogPostInput {
    title: string;
    excerpt: string;
    content: string;
    coverImage: string | null;
    tag: string;
    sectionId: string | null;
    featured: boolean;
    published: boolean;
    publishedAt: string;
}

const text = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

function today() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Returns the cleaned post, or `{ error }` with a message for the admin. */
export async function parseBlogPostInput(body: Record<string, unknown>): Promise<BlogPostInput | { error: string }> {
    const title = text(body.title, BLOG_LIMITS.title);
    if (!title) return { error: "Please enter a title." };

    const content = typeof body.content === "string" ? body.content.replace(/\r\n/g, "\n").trim() : "";
    if (content.length > BLOG_LIMITS.content) return { error: "The article is too long." };

    // Cover image: uploaded file (/uploads/...) or an image link (Drive / Google Images links are converted).
    const rawImage = text(body.coverImage, 2000);
    let coverImage: string | null = null;
    if (rawImage) {
        coverImage = isUploadedImagePath(rawImage) ? rawImage : normalizeImageUrl(rawImage);
        if (!coverImage) return { error: "The cover image link isn't valid." };
    }

    let sectionId: string | null = null;
    if (typeof body.sectionId === "string" && body.sectionId) {
        if (!UUID_RE.test(body.sectionId) || !(await BlogSection.findById(body.sectionId))) {
            return { error: "That heading no longer exists. Choose another one." };
        }
        sectionId = body.sectionId;
    }

    const rawDate = text(body.publishedAt, 10);
    const publishedAt = /^\d{4}-\d{2}-\d{2}$/.test(rawDate) && !Number.isNaN(Date.parse(rawDate)) ? rawDate : today();

    return {
        title,
        excerpt: text(body.excerpt, BLOG_LIMITS.excerpt),
        content,
        coverImage,
        tag: text(body.tag, BLOG_LIMITS.tag),
        sectionId,
        featured: body.featured === true,
        published: body.published !== false,
        publishedAt,
    };
}
