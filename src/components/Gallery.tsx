"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";

interface Photo {
    _id: string;
    imageUrl: string;
    caption?: string;
}

export default function Gallery() {
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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
    }, []);

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
        <section className="section bg-primary-50">
            <div className="container-page">
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <SectionHeader eyebrow="Visual Journey" title="Our Campus & Events" />
                </motion.div>

                <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3">
                    {photos.map((photo, index) => (
                        <motion.figure
                            key={photo._id}
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.06 }}
                            className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-primary-100 shadow-sm"
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={photo.imageUrl}
                                alt={photo.caption || "Gallery Photo"}
                                referrerPolicy="no-referrer"
                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            {photo.caption && (
                                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-primary-darker/90 via-primary-darker/40 to-transparent px-5 pb-4 pt-12">
                                    <p className="text-sm font-semibold text-white">{photo.caption}</p>
                                </figcaption>
                            )}
                        </motion.figure>
                    ))}
                </div>
            </div>
        </section>
    );
}
