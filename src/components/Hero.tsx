"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, GraduationCap, BadgeCheck, Clock, Compass, Sparkles, PlayCircle } from "lucide-react";
import { useState, useEffect } from "react";

// Shown when no Hero Background is uploaded in Admin → SEO Settings (same photo the About section uses).
const FALLBACK_HERO_IMAGE = "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=1600&auto=format&fit=crop";

const highlights = [
    { icon: BadgeCheck, text: "Leading Universities" },
    { icon: Clock, text: "Flexible Learning" },
    { icon: Compass, text: "Career Counselling" },
];

const fadeUp = (delay: number) => ({
    initial: { opacity: 0, y: 28 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay, ease: [0.21, 0.47, 0.32, 0.98] as const },
});

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
        <section className="relative overflow-hidden bg-white pt-20">
            {/* Animated background */}
            <div className="absolute inset-0 bg-dots opacity-60 [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_75%)]" aria-hidden="true" />
            <div className="glow-blob -left-32 top-10 h-[28rem] w-[28rem] bg-primary/25" aria-hidden="true" />
            <div className="glow-blob right-[-6rem] top-[-4rem] h-[30rem] w-[30rem] bg-violet/25 [animation-delay:-5s]" aria-hidden="true" />
            <div className="glow-blob bottom-[-10rem] left-1/3 h-[26rem] w-[26rem] bg-glow/20 [animation-delay:-9s]" aria-hidden="true" />

            <div className="container-page relative z-10 grid grid-cols-1 items-center gap-14 pb-24 pt-14 lg:grid-cols-2 lg:gap-10 lg:pb-32 lg:pt-20">
                {/* Left Content */}
                <div>
                    <motion.span {...fadeUp(0)} className="eyebrow">
                        <Sparkles size={14} className="text-violet" />
                        Start your favourite course
                    </motion.span>

                    <motion.h1
                        {...fadeUp(0.1)}
                        className="mt-6 text-5xl font-extrabold leading-[1.05] tracking-tight text-ink sm:text-6xl lg:text-7xl"
                    >
                        Rebuild Your <br />
                        <span className="text-shimmer">Career</span>
                    </motion.h1>

                    <motion.p {...fadeUp(0.2)} className="mt-6 max-w-lg text-lg leading-relaxed text-slate-600 sm:text-xl">
                        Learn from anywhere and build your <span className="font-semibold text-ink">brighter career</span>.
                    </motion.p>

                    <motion.div {...fadeUp(0.3)} className="mt-10 flex flex-wrap gap-4">
                        <Link href="/programs" className="btn-primary group px-7 py-4 text-base">
                            Explore Programs
                            <ArrowRight className="transition-transform group-hover:translate-x-1" size={18} />
                        </Link>
                        <Link href="/about" className="btn-outline group px-7 py-4 text-base">
                            <PlayCircle size={20} className="text-violet transition-transform group-hover:scale-110" />
                            Learn More
                        </Link>
                    </motion.div>

                    <motion.ul {...fadeUp(0.4)} className="mt-10 flex flex-wrap gap-x-6 gap-y-3">
                        {highlights.map(({ icon: Icon, text }) => (
                            <li key={text} className="flex items-center gap-2 text-sm font-medium text-slate-600">
                                <Icon size={18} className="text-violet" />
                                {text}
                            </li>
                        ))}
                    </motion.ul>
                </div>

                {/* Right visual */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.9, delay: 0.2, ease: [0.21, 0.47, 0.32, 0.98] }}
                    className="relative mx-auto w-full max-w-lg lg:max-w-none"
                >
                    {/* Spinning gradient ring */}
                    <div className="absolute -inset-4 rounded-[2.5rem] bg-[conic-gradient(from_0deg,var(--color-primary),var(--color-violet),var(--color-glow),var(--color-primary))] opacity-70 blur-md animate-spin-slow" aria-hidden="true" />

                    <div className="relative aspect-[4/3.6] overflow-hidden rounded-[2rem] border-4 border-white bg-primary-100 shadow-2xl">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={heroBg || FALLBACK_HERO_IMAGE}
                            alt="Students learning with Learnink"
                            referrerPolicy="no-referrer"
                            className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-primary-darker/50 via-transparent to-transparent" aria-hidden="true" />
                    </div>

                    {/* Floating glass badges */}
                    <div className="glass absolute -left-4 top-8 flex items-center gap-3 rounded-2xl px-4 py-3 animate-float sm:-left-10">
                        <span className="icon-tile h-10 w-10">
                            <GraduationCap size={20} />
                        </span>
                        <div>
                            <p className="text-sm font-bold text-ink">Admissions Open</p>
                            <p className="text-xs text-slate-500">Apply today</p>
                        </div>
                    </div>

                    <div className="glass absolute -right-3 bottom-10 flex items-center gap-3 rounded-2xl px-4 py-3 animate-float-slow [animation-delay:-3s] sm:-right-8">
                        <span className="relative">
                            <span className="absolute inset-0 rounded-xl bg-violet/60 animate-pulse-ring" aria-hidden="true" />
                            <span className="icon-tile relative h-10 w-10">
                                <Compass size={20} />
                            </span>
                        </span>
                        <div>
                            <p className="text-sm font-bold text-ink">Expert Counsellors</p>
                            <p className="text-xs text-slate-500">Guidance at every step</p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
