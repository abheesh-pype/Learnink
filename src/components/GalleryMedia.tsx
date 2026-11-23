"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { isEmbeddedVideo } from "@/lib/videoUrl";

interface GalleryMediaProps {
    url: string;
    mediaType?: "image" | "video";
    alt: string;
    className?: string;
    /**
     * "natural": full width, height follows the file's own shape.
     * "fill":    fills its box (photos cropped to fit, videos letterboxed). Used inside the collage, where the
     *            box already has the item's exact shape, and for admin thumbnails.
     */
    fit?: "natural" | "fill";
    /** Called with the real width / height once the photo or video has loaded. */
    onSize?: (width: number, height: number) => void;
}

/** Shows a gallery item: a photo, an uploaded / linked video file, or a YouTube / Google Drive player. */
export default function GalleryMedia({ url, mediaType = "image", alt, className, fit = "fill", onSize }: GalleryMediaProps) {
    const natural = fit === "natural";
    const imgRef = useRef<HTMLImageElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    // The file may finish loading before React is ready to listen, so also check once after mounting.
    useEffect(() => {
        const img = imgRef.current;
        if (img?.complete && img.naturalWidth) onSize?.(img.naturalWidth, img.naturalHeight);
        const video = videoRef.current;
        if (video && video.readyState >= 1 && video.videoWidth) onSize?.(video.videoWidth, video.videoHeight);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [url]);

    if (mediaType === "video") {
        if (isEmbeddedVideo(url)) {
            // YouTube / Drive players don't report their size, so they use the standard 16:9 shape.
            return (
                <iframe
                    src={url}
                    title={alt}
                    loading="lazy"
                    allow="encrypted-media; picture-in-picture; fullscreen"
                    allowFullScreen
                    className={cn("block w-full bg-black", natural ? "aspect-video" : "h-full", className)}
                />
            );
        }
        return (
            <video
                ref={videoRef}
                // "#t=0.1" makes browsers draw the first frame as a preview instead of a black box.
                src={url.includes("#") ? url : `${url}#t=0.1`}
                controls
                playsInline
                preload="metadata"
                aria-label={alt}
                onLoadedMetadata={(e) => onSize?.(e.currentTarget.videoWidth, e.currentTarget.videoHeight)}
                className={cn("block w-full bg-black", natural ? "h-auto" : "h-full object-contain", className)}
            />
        );
    }

    return (
        // Plain <img>: photos can come from any host (uploads, Google, Drive).
        // eslint-disable-next-line @next/next/no-img-element
        <img
            ref={imgRef}
            src={url}
            alt={alt}
            referrerPolicy="no-referrer"
            loading="lazy"
            onLoad={(e) => onSize?.(e.currentTarget.naturalWidth, e.currentTarget.naturalHeight)}
            className={cn("block w-full", natural ? "h-auto" : "h-full object-cover", className)}
        />
    );
}
