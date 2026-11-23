"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";
import GalleryCollage from "@/components/GalleryCollage";

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
 * Homepage gallery: each heading with ONE row of its photos / videos and an "Explore More" button that opens
 * the Gallery page filtered to that heading. Grouped by heading (Admin → Photo Gallery → sections), in the admin's order.
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

    if (loading) {
        return (
            <section className="section flex justify-center bg-primary-50">
                <Loader2 className="animate-spin text-primary w-10 h-10" />
            </section>
        );
    }

    if (sections.length === 0) {
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

    return (
        <section id="gallery" className="section scroll-mt-24 overflow-hidden bg-primary-50">
            <div className="container-page relative">
                <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                    <SectionHeader eyebrow="Visual Journey" title="Our Campus & Events" />
                </motion.div>

                <div className="mt-12 space-y-16 lg:mt-16 lg:space-y-20">
                    {sections.map((section) => (
                        <div key={section._id}>
                            {/* Section heading, e.g. "Annual Day 2026" */}
                            <div className="flex flex-col gap-2 border-b border-primary-200 pb-4 sm:flex-row sm:items-end sm:justify-between">
                                <div>
                                    <h3 className="font-display text-3xl font-semibold text-ink sm:text-4xl">{section.title}</h3>
                                    {section.description && (
                                        <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-slate-600">{section.description}</p>
                                    )}
                                </div>
                                <p className="shrink-0 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                                    {countLabel(section.items)}
                                </p>
                            </div>

                            <GalleryCollage section={section} maxRows={1} />

                            <div className="mt-6">
                                <Link href={`/gallery/${section._id}`} className="btn-outline group">
                                    Explore More
                                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
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
