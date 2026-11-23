"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
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

// The last headline word cycles through these. The first one is what search engines and screen readers get.
const ROTATING_WORDS = ["Career", "Future", "Skills", "Life"];
const ROTATE_EVERY_MS = 2600;

const EASE = [0.22, 1, 0.36, 1] as const;

const fadeUp = (delay: number) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay, ease: EASE },
});

/** A word that slides up from behind an invisible mask. */
function MaskedWord({ children, delay }: { children: React.ReactNode; delay: number }) {
    return (
        <span className="inline-block overflow-hidden pb-2 align-bottom">
            <motion.span
                className="inline-block"
                initial={{ y: "110%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, delay, ease: EASE }}
            >
                {children}
            </motion.span>
        </span>
    );
}

export default function Hero() {
    const [heroBg, setHeroBg] = useState("");
    const [wordIndex, setWordIndex] = useState(0);
    const reduceMotion = useReducedMotion();

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

    useEffect(() => {
        if (reduceMotion) return;
        const timer = setInterval(() => setWordIndex((i) => (i + 1) % ROTATING_WORDS.length), ROTATE_EVERY_MS);
        return () => clearInterval(timer);
    }, [reduceMotion]);

    return (
        <section className="relative isolate overflow-hidden bg-primary-darker pt-20">
            {/* Background image: fades in, then slowly zooms (Ken Burns) */}
            <motion.div
                key={heroBg || "fallback"}
                className="absolute inset-0 -z-20"
                initial={{ opacity: 0, scale: 1.15 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ opacity: { duration: 1.2 }, scale: { duration: 8, ease: "easeOut" } }}
                aria-hidden="true"
            >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={heroBg || FALLBACK_HERO_IMAGE}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover"
                />
            </motion.div>

            {/* Brand-colored overlay so the text stays readable on any photo */}
            <div
                className="absolute inset-0 -z-10 bg-gradient-to-r from-primary-darker/95 via-primary-dark/80 to-primary/40"
                aria-hidden="true"
            />
            <div
                className="absolute inset-0 -z-10 bg-gradient-to-t from-primary-darker/70 via-transparent to-primary-darker/30"
                aria-hidden="true"
            />
            <div className="absolute -right-40 -top-40 -z-10 h-[32rem] w-[32rem] rounded-full bg-violet/30 blur-3xl" aria-hidden="true" />
            <div className="absolute -bottom-48 left-1/4 -z-10 h-[28rem] w-[28rem] rounded-full bg-glow/15 blur-3xl" aria-hidden="true" />

            <div className="container-page relative grid min-h-[34rem] grid-cols-1 items-center gap-12 pb-24 pt-16 lg:min-h-[40rem] lg:grid-cols-[1.4fr_1fr] lg:pb-32 lg:pt-24">
                {/* Left Content */}
                <div>
                    <motion.span
                        {...fadeUp(0)}
                        className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur"
                    >
                        <Sparkles size={14} className="text-glow" />
                        Start your favourite course
                    </motion.span>

                    <h1 className="mt-6 text-5xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
                        <span className="sr-only">Rebuild Your {ROTATING_WORDS[0]}</span>
                        <span aria-hidden="true">
                            <MaskedWord delay={0.1}>Rebuild</MaskedWord>{" "}
                            <MaskedWord delay={0.22}>Your</MaskedWord>
                            <br />
                            <span className="relative inline-block overflow-hidden pb-3 align-bottom">
                                <motion.span
                                    className="inline-block"
                                    initial={{ y: "110%" }}
                                    animate={{ y: 0 }}
                                    transition={{ duration: 0.8, delay: 0.34, ease: EASE }}
                                >
                                    <AnimatePresence mode="wait" initial={false}>
                                        <motion.span
                                            key={ROTATING_WORDS[wordIndex]}
                                            className="inline-block bg-gradient-to-r from-white via-primary-200 to-glow bg-clip-text text-transparent"
                                            initial={{ y: "100%", opacity: 0, filter: "blur(6px)" }}
                                            animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                                            exit={{ y: "-100%", opacity: 0, filter: "blur(6px)" }}
                                            transition={{ duration: 0.5, ease: EASE }}
                                        >
                                            {ROTATING_WORDS[wordIndex]}
                                        </motion.span>
                                    </AnimatePresence>
                                </motion.span>
                                {/* Hand-drawn underline that draws itself */}
                                <svg className="absolute -bottom-0.5 left-0 h-4 w-full" viewBox="0 0 200 16" preserveAspectRatio="none" fill="none">
                                    <motion.path
                                        d="M3 11 C 50 3, 120 3, 197 9"
                                        stroke="url(#hero-underline)"
                                        strokeWidth="5"
                                        strokeLinecap="round"
                                        initial={{ pathLength: 0 }}
                                        animate={{ pathLength: 1 }}
                                        transition={{ duration: 0.9, delay: 0.9, ease: EASE }}
                                    />
                                    <defs>
                                        <linearGradient id="hero-underline" x1="0" x2="1">
                                            <stop offset="0" stopColor="var(--color-violet)" />
                                            <stop offset="1" stopColor="var(--color-glow)" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                            </span>
                        </span>
                    </h1>

                    <motion.p {...fadeUp(0.55)} className="mt-6 max-w-lg text-lg leading-relaxed text-white/80 sm:text-xl">
                        Learn from anywhere and build your <span className="font-semibold text-white">brighter career</span>.
                    </motion.p>

                    <motion.div {...fadeUp(0.65)} className="mt-10 flex flex-wrap gap-4">
                        <Link href="/programs" className="btn-light group px-7 py-4 text-base">
                            Explore Programs
                            <ArrowRight className="transition-transform group-hover:translate-x-1" size={18} />
                        </Link>
                        <Link
                            href="/about"
                            className="group inline-flex items-center justify-center gap-2 rounded-xl border-2 border-white/30 bg-white/5 px-7 py-4 text-base font-semibold text-white backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-white/60 hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                        >
                            <PlayCircle size={20} className="text-glow transition-transform group-hover:scale-110" />
                            Learn More
                        </Link>
                    </motion.div>

                    <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-3">
                        {highlights.map(({ icon: Icon, text }, i) => (
                            <motion.li
                                key={text}
                                {...fadeUp(0.75 + i * 0.08)}
                                className="flex items-center gap-2 text-sm font-medium text-white/80"
                            >
                                <Icon size={18} className="text-glow" />
                                {text}
                            </motion.li>
                        ))}
                    </ul>
                </div>

                {/* Right: floating glass badges over the background */}
                <div className="relative hidden h-full min-h-[22rem] lg:block">
                    <motion.div
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 1.0, ease: EASE }}
                        className="absolute right-6 top-[18%]"
                    >
                        <div className="glass-dark flex items-center gap-3 rounded-2xl px-5 py-4 shadow-2xl shadow-black/20 animate-float">
                            <span className="icon-tile h-11 w-11">
                                <GraduationCap size={22} />
                            </span>
                            <div>
                                <p className="text-sm font-bold text-white">Admissions Open</p>
                                <p className="text-xs text-white/70">Apply today</p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 1.2, ease: EASE }}
                        className="absolute bottom-[18%] left-4"
                    >
                        <div className="glass-dark flex items-center gap-3 rounded-2xl px-5 py-4 shadow-2xl shadow-black/20 animate-float-slow [animation-delay:-3s]">
                            <span className="relative">
                                <span className="absolute inset-0 rounded-xl bg-violet/60 animate-pulse-ring" aria-hidden="true" />
                                <span className="icon-tile relative h-11 w-11">
                                    <Compass size={22} />
                                </span>
                            </span>
                            <div>
                                <p className="text-sm font-bold text-white">Expert Counsellors</p>
                                <p className="text-xs text-white/70">Guidance at every step</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
