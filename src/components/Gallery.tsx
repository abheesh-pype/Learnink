"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";
import GalleryMedia from "@/components/GalleryMedia";

export interface GalleryItem {
    _id: string;
    imageUrl: string; // photo or video URL
    mediaType?: "image" | "video";
    caption?: string;
}

export interface GallerySection {
    _id: string;
    title: string;
    description?: string | null;
    items: GalleryItem[];
}

/**
 * Homepage gallery: every photo / video from all collections in ONE row that scrolls sideways.
 * Collections (headings) are only shown on the Gallery page.
 * `initialSections`: loaded on the server, so it renders immediately without fetching.
 */
export default function Gallery({ initialSections }: { initialSections?: GallerySection[] }) {
    const [sections, setSections] = useState<GallerySection[]>(initialSections ?? []);
    const [loading, setLoading] = useState(!initialSections);

    useEffect(() => {
        if (initialSections) return;
        fetch("/api/gallery")
            .then((res) => (res.ok ? res.json() : []))
            .then(setSections)
            .catch((error) => console.error("Failed to load gallery", error))
            .finally(() => setLoading(false));
    }, [initialSections]);

    const items = sections.flatMap((s) => s.items.map((item) => ({ ...item, sectionTitle: s.title })));

    // Arrow buttons scroll the row by most of its visible width.
    const rowRef = useRef<HTMLDivElement>(null);
    const [edges, setEdges] = useState({ start: true, end: true });
    const updateEdges = useCallback(() => {
        const el = rowRef.current;
        if (!el) return;
        setEdges({ start: el.scrollLeft <= 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 });
    }, []);
    useEffect(() => {
        updateEdges();
        window.addEventListener("resize", updateEdges);
        return () => window.removeEventListener("resize", updateEdges);
    }, [updateEdges, items.length]);
    const scrollRow = (direction: -1 | 1) => {
        const el = rowRef.current;
        if (el) el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: "smooth" });
    };

    if (loading) {
        return (
            <section className="section flex justify-center bg-primary-50">
                <Loader2 className="animate-spin text-primary w-10 h-10" />
            </section>
        );
    }

    if (items.length === 0) {
        return (
            <section className="section bg-primary-50">
                <div className="container-page">
                    <div className="card px-8 py-16 text-center">
                        <span className="eyebrow">Visual Journey</span>
                        <h2 className="mt-4 text-2xl font-bold text-ink">Gallery Content Coming Soon</h2>
                        <p className="mt-2 text-slate-500">Add photos from the Admin Dashboard to see them here.</p>
                    </div>
                </div>
            </section>
        );
    }

    const arrowClass =
        "flex h-11 w-11 items-center justify-center rounded-md border border-slate-300 text-ink transition-colors hover:border-primary hover:bg-primary hover:text-white disabled:pointer-events-none disabled:opacity-30";

    return (
        <section id="gallery" className="section scroll-mt-24 overflow-hidden bg-primary-50">
            <div className="container-page">
                <SectionHeader
                    eyebrow="Visual Journey"
                    title="Our Campus & Events"
                    action={
                        <div className="flex items-center gap-2">
                            {!(edges.start && edges.end) && (
                                <>
                                    <button type="button" onClick={() => scrollRow(-1)} disabled={edges.start} className={arrowClass} aria-label="Scroll gallery left">
                                        <ChevronLeft size={20} />
                                    </button>
                                    <button type="button" onClick={() => scrollRow(1)} disabled={edges.end} className={arrowClass} aria-label="Scroll gallery right">
                                        <ChevronRight size={20} />
                                    </button>
                                </>
                            )}
                            <Link href="/gallery" className="btn-outline group ml-2">
                                View full gallery <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                            </Link>
                        </div>
                    }
                />

                {/* One row, scrolls to the right. Each item keeps its own shape at a fixed height. */}
                <div
                    ref={rowRef}
                    onScroll={updateEdges}
                    className="section-head-gap -mx-4 flex snap-x gap-4 overflow-x-auto scroll-smooth px-4 pb-4 [scrollbar-width:thin] sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
                    aria-label="Gallery, scroll sideways for more"
                >
                    {items.map((item) => (
                        <GalleryTile key={item._id} item={item} onSized={updateEdges} />
                    ))}
                </div>
            </div>
        </section>
    );
}

/** A fixed-height tile whose width follows the photo / video shape (kept between tall-portrait and wide-landscape). */
function GalleryTile({ item, onSized }: { item: GalleryItem & { sectionTitle: string }; onSized: () => void }) {
    const [ratio, setRatio] = useState(4 / 3);
    const alt = item.caption || item.sectionTitle;

    return (
        <figure
            className="relative h-60 shrink-0 snap-start overflow-hidden rounded-md bg-slate-200 sm:h-72"
            style={{ aspectRatio: String(ratio) }}
        >
            <GalleryMedia
                url={item.imageUrl}
                mediaType={item.mediaType}
                alt={alt}
                onSize={(w, h) => {
                    if (!w || !h) return;
                    setRatio(Math.min(Math.max(w / h, 0.6), 2));
                    requestAnimationFrame(onSized);
                }}
            />
            {item.caption && item.mediaType !== "video" && (
                <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-3 pb-2.5 pt-8 text-sm text-white">
                    {item.caption}
                </figcaption>
            )}
        </figure>
    );
}

/** "4 photos · 1 video" */
export function countLabel(items: GalleryItem[]) {
    const videos = items.filter((i) => i.mediaType === "video").length;
    const photos = items.length - videos;
    return [photos && `${photos} photo${photos === 1 ? "" : "s"}`, videos && `${videos} video${videos === 1 ? "" : "s"}`]
        .filter(Boolean)
        .join(" · ");
}
