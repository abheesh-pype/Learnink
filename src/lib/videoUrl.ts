/**
 * Video sources for the gallery:
 * - uploaded files (/uploads/xyz.mp4 | .webm | .mov), played with <video>
 * - YouTube links (watch, youtu.be, shorts, embed), shown with YouTube's embedded player
 * - Google Drive share links, shown with Drive's embedded player (file must be shared "Anyone with the link")
 * - any other https link to a video file, played with <video>
 */

const YOUTUBE_ID = /^[\w-]{11}$/;

/** Turns a pasted video link into the URL we store. Returns null when it isn't a usable link. */
export function normalizeVideoUrl(input: string): string | null {
    let url: URL;
    try {
        url = new URL(input.trim());
    } catch {
        return null;
    }
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    const host = url.hostname.toLowerCase().replace(/^www\.|^m\./, "");

    // YouTube → privacy-friendly embed URL
    let youtubeId: string | null = null;
    if (host === "youtu.be") youtubeId = url.pathname.slice(1).split("/")[0];
    else if (host === "youtube.com" || host === "youtube-nocookie.com") {
        youtubeId = url.searchParams.get("v") ?? url.pathname.match(/^\/(?:shorts|embed|live)\/([\w-]{11})/)?.[1] ?? null;
    }
    if (youtubeId !== null) {
        return YOUTUBE_ID.test(youtubeId) ? `https://www.youtube-nocookie.com/embed/${youtubeId}` : null;
    }

    // Google Drive → Drive's preview player
    if (host === "drive.google.com") {
        const id = url.pathname.match(/\/d\/([\w-]{10,})/)?.[1] ?? url.searchParams.get("id");
        return id && /^[\w-]{10,}$/.test(id) ? `https://drive.google.com/file/d/${id}/preview` : null;
    }

    return url.toString();
}

/** True for videos uploaded through /api/upload. */
export function isUploadedVideoPath(value: string) {
    return /^\/uploads\/[\w.-]+\.(mp4|webm|mov)$/i.test(value);
}

/** YouTube and Drive links are played in an <iframe>; everything else in a <video> element. */
export function isEmbeddedVideo(url: string) {
    return /^https:\/\/(www\.youtube-nocookie\.com\/embed\/|drive\.google\.com\/file\/d\/[\w-]+\/preview)/.test(url);
}
