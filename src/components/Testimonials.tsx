"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
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

    // One row that scrolls sideways; the arrow buttons move by one card.
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
    }, [updateEdges, testimonials.length]);
    const scrollByCard = (direction: -1 | 1) => {
        const el = rowRef.current;
        const card = el?.querySelector("figure");
        if (!el || !card) return;
        el.scrollBy({ left: direction * (card.getBoundingClientRect().width + 24), behavior: "smooth" });
    };

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
        <section id="testimonials" className="section scroll-mt-24 overflow-hidden bg-white">
            <div className="container-page">
                <SectionHeader
                    eyebrow="Success Stories"
                    title="What Our Students Say"
                    action={
                        !(edges.start && edges.end) && (
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => scrollByCard(-1)}
                                    disabled={edges.start}
                                    className="flex h-11 w-11 items-center justify-center rounded-md border border-slate-300 text-ink transition-colors hover:border-primary hover:bg-primary hover:text-white disabled:pointer-events-none disabled:opacity-30"
                                    aria-label="Previous testimonials"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => scrollByCard(1)}
                                    disabled={edges.end}
                                    className="flex h-11 w-11 items-center justify-center rounded-md border border-slate-300 text-ink transition-colors hover:border-primary hover:bg-primary hover:text-white disabled:pointer-events-none disabled:opacity-30"
                                    aria-label="Next testimonials"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        )
                    }
                />

                {/* One row, scrolls to the right */}
                <div
                    ref={rowRef}
                    onScroll={updateEdges}
                    className="section-head-gap -mx-4 flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth px-4 pb-4 [scrollbar-width:thin] sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
                    tabIndex={0}
                    aria-label="Student testimonials, scroll sideways for more"
                >
                    {testimonials.map((item) => (
                        <figure
                            key={item._id}
                            className="card flex w-[85%] shrink-0 snap-start flex-col p-7 sm:w-[360px] sm:p-8"
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
                        </figure>
                    ))}
                </div>
            </div>
        </section>
    );
}
