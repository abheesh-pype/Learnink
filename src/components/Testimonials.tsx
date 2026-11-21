"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Quote, Star } from "lucide-react";
import TestimonialAvatar from "@/components/TestimonialAvatar";
import SectionHeader from "@/components/ui/SectionHeader";

interface Testimonial {
    _id: string;
    name: string;
    content: string;
    role?: string;
    imageUrl?: string;
    rating: number;
}

export default function Testimonials() {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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
    }, []);

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

                <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:mt-16 lg:grid-cols-3">
                    {testimonials.map((item, index) => (
                        <motion.figure
                            key={item._id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.08 }}
                            className="card relative flex flex-col p-7"
                        >
                            <Quote size={40} className="absolute right-6 top-6 text-primary-100" aria-hidden="true" />

                            <div className="flex gap-1" aria-label={`Rated ${item.rating} out of 5`}>
                                {[...Array(item.rating)].map((_, i) => (
                                    <Star key={i} size={16} className="fill-primary text-primary" />
                                ))}
                            </div>

                            <blockquote className="mt-5 flex-1 text-[15px] leading-relaxed text-slate-600">
                                &quot;{item.content}&quot;
                            </blockquote>

                            <figcaption className="mt-6 flex items-center gap-4 border-t border-slate-100 pt-5">
                                <TestimonialAvatar name={item.name} imageUrl={item.imageUrl} className="h-12 w-12 rounded-full shadow-none" />
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
