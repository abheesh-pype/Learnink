"use client";

import { motion } from "framer-motion";
import { ArrowRight, ScrollText, Rocket, RotateCcw, Laptop2, BookText, Award, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import SectionHeader from "@/components/ui/SectionHeader";

interface Program {
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
}

export default function Programs({ limit }: ProgramsProps) {
    const [programs, setPrograms] = useState<Program[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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
    }, [limit]);

    return (
        <section id="programs" className="section bg-primary-50">
            <div className="container-page">
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
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.08, duration: 0.5 }}
                                        className="card card-hover group flex flex-col p-6 sm:p-7"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white">
                                                <Icon size={24} strokeWidth={1.75} />
                                            </span>
                                            {program.category && (
                                                <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary">
                                                    {program.category}
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="mt-5 text-xl font-bold text-ink transition-colors group-hover:text-primary">
                                            {program.title}
                                        </h3>
                                        <p className="mt-3 flex-1 text-[15px] leading-relaxed text-slate-600 line-clamp-3">
                                            {program.description}
                                        </p>
                                        <div className="mt-6 border-t border-slate-100 pt-5">
                                            <Link
                                                href={`/programs/${program.slug}`}
                                                className="inline-flex items-center gap-2 text-sm font-semibold text-primary"
                                            >
                                                Learn More <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
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
