"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";
import GalleryMedia from "@/components/GalleryMedia";

export interface Photo {
    _id: string;
    imageUrl: string; // photo or video URL
    mediaType?: "image" | "video";
    caption?: string;
}

/** `initialPhotos`: photos loaded on the server, so the section renders immediately without fetching. */
export default function Gallery({ initialPhotos }: { initialPhotos?: Photo[] }) {
    const [photos, setPhotos] = useState<Photo[]>(initialPhotos ?? []);
    const [loading, setLoading] = useState(!initialPhotos);

    useEffect(() => {
        if (initialPhotos) return;
        const fetchPhotos = async () => {
            try {
                const res = await fetch("/api/gallery");
                if (res.ok) {
                    const data = await res.json();
                    setPhotos(data);
                }
            } catch (error) {
                console.error("Failed to load gallery", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPhotos();
    }, [initialPhotos]);

    if (loading) {
        return (
            <section className="section flex justify-center bg-primary-50">
                <Loader2 className="animate-spin text-primary w-10 h-10" />
            </section>
        );
    }

    if (photos.length === 0) {
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
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <SectionHeader eyebrow="Visual Journey" title="Our Campus & Events" />
                </motion.div>

                <div className="mt-12 grid auto-rows-[220px] grid-cols-1 gap-5 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3">
                    {photos.map((photo, index) => (
                        <motion.figure
                            key={photo._id}
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-40px" }}
                            transition={{ delay: (index % 6) * 0.08, duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
                            className={`group relative overflow-hidden rounded-md bg-primary-100 ${
                                index === 0 && photos.length >= 3 ? "sm:col-span-2 sm:row-span-2" : ""
                            }`}
                        >
                            <GalleryMedia
                                url={photo.imageUrl}
                                mediaType={photo.mediaType}
                                alt={photo.caption || (photo.mediaType === "video" ? "Gallery video" : "Gallery photo")}
                            />
                            {photo.caption && (
                                // Photos: caption over the bottom. Videos: caption at the top so it doesn't cover the player controls.
                                <figcaption
                                    className={
                                        photo.mediaType === "video"
                                            ? "pointer-events-none absolute inset-x-0 top-0 bg-gradient-to-b from-primary-darker/80 to-transparent px-5 pb-10 pt-4"
                                            : "absolute inset-x-0 bottom-0 bg-gradient-to-t from-primary-darker/90 via-primary-darker/40 to-transparent px-5 pb-5 pt-14"
                                    }
                                >
                                    <p className="text-sm font-medium text-white">{photo.caption}</p>
                                </figcaption>
                            )}
                        </motion.figure>
                    ))}
                </div>
            </div>
        </section>
    );
}
