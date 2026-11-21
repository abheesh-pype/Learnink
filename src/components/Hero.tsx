"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, GraduationCap, BadgeCheck, Clock, Compass } from "lucide-react";
import { useState, useEffect } from "react";

const highlights = [
    { icon: BadgeCheck, title: "Leading Universities", text: "Programs from our partner universities." },
    { icon: Clock, title: "Flexible Learning", text: "Online, distance and fast-track degree options." },
    { icon: Compass, title: "Career Counselling", text: "Dedicated counsellors to guide your choice." },
];

export default function Hero() {
    const [heroBg, setHeroBg] = useState("");

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const res = await fetch("/api/admin/seo");
                if (res.ok) {
                    const data = await res.json();
                    if (data.images?.heroBg) setHeroBg(data.images.heroBg);
                }
            } catch {
                console.error("Failed to load site config");
            }
        };
        fetchConfig();
    }, []);
    return (
        <section className="relative overflow-hidden bg-primary-darker pt-20">
            {/* Background image (Admin → SEO Settings → Hero Background) with brand overlay */}
            {heroBg && (
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: `url(${heroBg})` }}
                    aria-hidden="true"
                />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-primary-darker via-primary-darker/90 to-primary/70" aria-hidden="true" />
            <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-primary-light/20 blur-3xl" aria-hidden="true" />

            <div className="container-page relative z-10 grid grid-cols-1 items-center gap-12 py-20 lg:grid-cols-12 lg:py-28">
                {/* Left Content */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                    className="lg:col-span-7"
                >
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-white/90">
                        <GraduationCap size={16} />
                        Start your favourite course
                    </span>

                    <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                        Rebuild Your <span className="text-primary-200">Career</span>
                        <br className="hidden sm:block" /> with the Right Education
                    </h1>

                    <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/80">
                        Learn from anywhere and build your <span className="font-semibold text-white">brighter career</span>.
                    </p>

                    <div className="mt-10 flex flex-wrap gap-4">
                        <Link href="/programs" className="btn-light group px-7 py-3.5 text-base">
                            Explore Programs
                            <ArrowRight className="transition-transform group-hover:translate-x-1" size={18} />
                        </Link>
                        <Link
                            href="/about"
                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/30 px-7 py-3.5 text-base font-semibold text-white transition-colors hover:bg-white/10"
                        >
                            Learn More
                        </Link>
                    </div>
                </motion.div>

                {/* Right: why choose us */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.15 }}
                    className="lg:col-span-5"
                >
                    <div className="rounded-2xl border border-white/15 bg-white/10 p-6 backdrop-blur-md sm:p-8">
                        <p className="text-sm font-semibold uppercase tracking-wider text-primary-200">Why choose Learnink</p>
                        <ul className="mt-6 space-y-6">
                            {highlights.map(({ icon: Icon, title, text }) => (
                                <li key={title} className="flex gap-4">
                                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-primary">
                                        <Icon size={22} />
                                    </span>
                                    <div>
                                        <p className="font-semibold text-white">{title}</p>
                                        <p className="mt-1 text-sm leading-relaxed text-white/70">{text}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
