import { cn } from "@/lib/utils";
import { isEmbeddedVideo } from "@/lib/videoUrl";

interface GalleryMediaProps {
    url: string;
    mediaType?: "image" | "video";
    alt: string;
    className?: string;
}

/** Shows a gallery item: a photo, an uploaded / linked video file, or a YouTube / Google Drive player. */
export default function GalleryMedia({ url, mediaType = "image", alt, className }: GalleryMediaProps) {
    if (mediaType === "video") {
        if (isEmbeddedVideo(url)) {
            return (
                <iframe
                    src={url}
                    title={alt}
                    loading="lazy"
                    allow="encrypted-media; picture-in-picture; fullscreen"
                    allowFullScreen
                    className={cn("h-full w-full bg-black", className)}
                />
            );
        }
        return (
            <video
                src={url}
                controls
                playsInline
                preload="metadata"
                aria-label={alt}
                // object-contain: show the whole video frame (black bars if needed), never crop it.
                className={cn("h-full w-full bg-black object-contain", className)}
            />
        );
    }

    return (
        // Plain <img>: photos can come from any host (uploads, Google, Drive).
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={alt} referrerPolicy="no-referrer" className={cn("h-full w-full object-cover", className)} />
    );
}
