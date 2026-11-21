/**
 * Turns a pasted image link into a URL that can be shown in an <img>.
 *
 * - Google Drive share links (…/file/d/<id>/view, open?id=<id>, uc?id=<id>) point
 *   at Drive's viewer page, not the image, so they are rewritten to Drive's
 *   direct image host. The file must be shared as "Anyone with the link".
 * - Google Images result links (google.com/imgres?imgurl=…) are unwrapped to the
 *   original image URL.
 * - Any other http(s) URL is returned as-is.
 *
 * Returns null when the value is not a usable http(s) URL.
 */
export function normalizeImageUrl(input: string): string | null {
    let url: URL;
    try {
        url = new URL(input.trim());
    } catch {
        return null;
    }
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;

    const host = url.hostname.toLowerCase();

    if (host === "drive.google.com" || host === "docs.google.com") {
        const id = url.pathname.match(/\/d\/([\w-]{10,})/)?.[1] ?? url.searchParams.get("id");
        if (id && /^[\w-]{10,}$/.test(id)) {
            return `https://lh3.googleusercontent.com/d/${id}`;
        }
        return null; // a Drive folder or page that isn't a single file
    }

    if (/(^|\.)google\.[a-z.]+$/.test(host) && url.pathname === "/imgres") {
        const original = url.searchParams.get("imgurl");
        return original ? normalizeImageUrl(original) : null;
    }

    return url.toString();
}

/** True for images uploaded through /api/upload. */
export function isUploadedImagePath(value: string) {
    return /^\/uploads\/[\w.-]+$/.test(value);
}
