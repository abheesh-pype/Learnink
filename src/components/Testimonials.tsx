"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Quote, Star } from "lucide-react";
import TestimonialAvatar from "@/components/TestimonialAvatar";
import SectionHeader from "@/components/ui/SectionHeader";
import GoogleReviewTag from "@/components/GoogleReviewTag";

export interface Testimonial {
    _id: string;
    name: string;
    content: string;
    role?: string;
    imageUrl?: string;
    rating: number;
    source?: "website" | "google";
    sourceUrl?: string | null;
}

/** `initialTestimonials`: loaded on the server, so the section renders immediately without fetching. */
export default function Testimonials({ initialTestimonials }: { initialTestimonials?: Testimonial[] }) {
    const [testimonials, setTestimonials] = useState<Testimonial[]>(initialTestimonials ?? []);
    const [loading, setLoading] = useState(!initialTestimonials);

    useEffect(() => {
        if (initialTestimonials) return;
        const fetchTestimonials = async () => {
            try {
                const res = await fetch("/api/testimonials");
                if (res.ok) {
                    const data = await res.json();
                    setTestimonials(data);
                }
            } catch (error) {
                console.error("Failed to load testimonials", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTestimonials();
    }, [initialTestimonials]);

    if (loading) return null;
    if (testimonials.length === 0) {
        return (
            <section className="section bg-white">
                <div className="container-page">
                    <div className="card px-8 py-16 text-center">
                        <span className="eyebrow">Success Stories</span>
                        <h2 className="mt-4 text-2xl font-bold text-ink">Testimonials Coming Soon</h2>
                        <p className="mt-2 text-slate-500">Add student reviews from the Admin Dashboard to see them here.</p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="section bg-white">
            <div className="container-page">
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <SectionHeader eyebrow="Success Stories" title="What Our Students Say" />
                </motion.div>

                <div className="mt-16 grid grid-cols-1 gap-x-6 gap-y-10 md:grid-cols-2 lg:mt-20 lg:grid-cols-3">
                    {testimonials.map((item, index) => (
                        <motion.figure
                            key={item._id}
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-60px" }}
                            transition={{ delay: index * 0.12, duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
                            className="card flex flex-col p-7 sm:p-8"
                        >

                            <div className="flex items-center justify-between gap-3">
                                <div className="flex gap-1" aria-label={`Rated ${item.rating} out of 5`}>
                                    {[...Array(item.rating)].map((_, i) => (
                                        <Star key={i} size={15} className="fill-primary text-primary" />
                                    ))}
                                </div>
                                {item.source === "google" && <GoogleReviewTag url={item.sourceUrl} />}
                            </div>

                            <Quote size={28} strokeWidth={1.25} className="mt-5 text-primary-200" aria-hidden="true" />
                            <blockquote className="mt-3 flex-1 font-display text-xl leading-relaxed text-ink/85">
                                {item.content}
                            </blockquote>

                            <figcaption className="mt-6 flex items-center gap-4 border-t border-slate-100 pt-5">
                                <TestimonialAvatar name={item.name} imageUrl={item.imageUrl} className="h-12 w-12" />
                                <div>
                                    <p className="font-semibold leading-tight text-ink">{item.name}</p>
                                    {item.role && <p className="mt-0.5 text-sm text-slate-500">{item.role}</p>}
                                </div>
                            </figcaption>
                        </motion.figure>
                    ))}
                </div>
            </div>
        </section>
    );
}
