"use client";

import { motion } from "framer-motion";
import { ArrowRight, ScrollText, Rocket, RotateCcw, Laptop2, BookText, Award, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import SectionHeader from "@/components/ui/SectionHeader";

export interface Program {
    _id: string;
    title: string;
    description: string;
    category: string;
    slug: string;
}

const getIcon = (category: string) => {
    switch (category) {
        case 'Degree Breaking': return ScrollText;
        case 'Fast Track': return Rocket;
        case 'Credit Transfer': return RotateCcw;
        case 'Online Degree': return Laptop2;
        case 'Secondary (10th)': return BookText;
        default: return Award;
    }
};

interface ProgramsProps {
    limit?: number;
    /** Programs loaded on the server. When given, the section renders immediately without fetching. */
    initialPrograms?: Program[];
}

export default function Programs({ limit, initialPrograms }: ProgramsProps) {
    const [programs, setPrograms] = useState<Program[]>(() =>
        initialPrograms ? (limit ? initialPrograms.slice(0, limit) : initialPrograms) : []
    );
    const [loading, setLoading] = useState(!initialPrograms);

    useEffect(() => {
        if (initialPrograms) return;
        const fetchPrograms = async () => {
            try {
                const res = await fetch("/api/programs");
                if (res.ok) {
                    const data = await res.json();
                    setPrograms(limit ? data.slice(0, limit) : data);
                }
            } catch (error) {
                console.error("Failed to load programs", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPrograms();
    }, [limit, initialPrograms]);

    return (
        <section id="programs" className="section overflow-hidden bg-primary-50">
            <div className="glow-blob -right-40 top-0 h-96 w-96 bg-violet/15" aria-hidden="true" />
            <div className="glow-blob -left-40 bottom-0 h-96 w-96 bg-glow/10 [animation-delay:-6s]" aria-hidden="true" />
            <div className="container-page relative">
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <SectionHeader
                        eyebrow="Our Programs"
                        title={<>Designed for Your <span className="text-primary">Success</span></>}
                        lead="Choose from our wide range of flexible educational programs tailored to meet your career goals and academic needs."
                    />
                </motion.div>

                <div className="mt-12 lg:mt-16">
                    {loading ? (
                        <div className="flex justify-center p-20">
                            <Loader2 className="animate-spin text-primary w-10 h-10" />
                        </div>
                    ) : programs.length === 0 ? (
                        <div className="card px-8 py-16 text-center">
                            <h3 className="text-lg font-semibold text-ink">Course Catalog Pending</h3>
                            <p className="mt-2 text-slate-500">New programs are being finalized. Check back soon!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {programs.map((program, index) => {
                                const Icon = getIcon(program.category);
                                return (
                                    <motion.article
                                        key={program._id}
                                        initial={{ opacity: 0, y: 40 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true, margin: "-60px" }}
                                        transition={{ delay: index * 0.1, duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
                                        className="card card-hover group flex flex-col overflow-hidden p-6 sm:p-7"
                                    >
                                        {/* Corner glow that grows on hover */}
                                        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-violet/10 blur-2xl transition-all duration-500 group-hover:scale-150 group-hover:bg-violet/20" aria-hidden="true" />
                                        <div className="relative flex items-start justify-between gap-4">
                                            <span className="icon-tile h-14 w-14 transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110">
                                                <Icon size={26} strokeWidth={1.75} />
                                            </span>
                                            {program.category && (
                                                <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary">
                                                    {program.category}
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="relative mt-6 text-xl font-bold text-ink transition-colors group-hover:text-primary">
                                            {program.title}
                                        </h3>
                                        <p className="mt-3 flex-1 text-[15px] leading-relaxed text-slate-600 line-clamp-3">
                                            {program.description}
                                        </p>
                                        <div className="mt-6 border-t border-slate-100 pt-5">
                                            <Link
                                                href={`/programs/${program.slug}`}
                                                className="inline-flex items-center gap-2 text-sm font-semibold text-primary after:absolute after:inset-0 after:content-['']"
                                            >
                                                Learn More
                                                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-100 transition-all duration-300 group-hover:translate-x-1 group-hover:bg-primary group-hover:text-white">
                                                    <ArrowRight size={14} />
                                                </span>
                                            </Link>
                                        </div>
                                    </motion.article>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
