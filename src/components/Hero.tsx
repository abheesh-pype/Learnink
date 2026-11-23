"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, GraduationCap, BadgeCheck, Clock, Compass, Sparkles, PlayCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { preload } from "react-dom";
import { useSiteConfig } from "@/components/SiteConfigProvider";

const highlights = [
    { icon: BadgeCheck, text: "Leading Universities" },
    { icon: Clock, text: "Flexible Learning" },
    { icon: Compass, text: "Career Counselling" },
];

// The last headline word cycles through these. The first one is what search engines and screen readers get.
const ROTATING_WORDS = ["Career", "Future", "Skills", "Life"];
const ROTATE_EVERY_MS = 2600;

const EASE = [0.22, 1, 0.36, 1] as const;

// Entrance animations are plain CSS (see .hero-* in globals.css) so they start the moment the page
// paints, instead of waiting for JavaScript to load. Only the rotating word needs JavaScript.
const delay = (seconds: number) => ({ animationDelay: `${seconds}s` });

/** A word that slides up from behind an invisible mask. */
function MaskedWord({ children, delay: d }: { children: React.ReactNode; delay: number }) {
    return (
        <span className="inline-block overflow-hidden pb-2 align-bottom">
            <span className="hero-mask" style={delay(d)}>
                {children}
            </span>
        </span>
    );
}

export default function Hero() {
    const [wordIndex, setWordIndex] = useState(0);
    const reduceMotion = useReducedMotion();
    // Only the Hero Background uploaded in Admin → SEO Settings is shown. It comes from the server
    // with the page, so there is no placeholder photo to flash before it loads.
    const { heroBg } = useSiteConfig();
    // Puts <link rel="preload"> in the page <head> so the browser downloads the image first.
    if (heroBg) preload(heroBg, { as: "image", fetchPriority: "high" });

    useEffect(() => {
        if (reduceMotion) return;
        const timer = setInterval(() => setWordIndex((i) => (i + 1) % ROTATING_WORDS.length), ROTATE_EVERY_MS);
        return () => clearInterval(timer);
    }, [reduceMotion]);

    return (
        <section className="relative isolate overflow-hidden bg-primary-darker pt-20">
            {/* Background image: shown as soon as it downloads (high priority), then slowly zooms out */}
            {heroBg && (
                <div className="hero-zoom absolute inset-0 -z-20" aria-hidden="true">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={heroBg}
                        alt=""
                        referrerPolicy="no-referrer"
                        fetchPriority="high"
                        className="h-full w-full object-cover"
                    />
                </div>
            )}

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
                    <span
                        className="hero-up inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur"
                    >
                        <Sparkles size={14} className="text-glow" />
                        Start your favourite course
                    </span>

                    <h1 className="mt-6 text-5xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
                        <span className="sr-only">Rebuild Your {ROTATING_WORDS[0]}</span>
                        <span aria-hidden="true">
                            <MaskedWord delay={0.05}>Rebuild</MaskedWord>{" "}
                            <MaskedWord delay={0.12}>Your</MaskedWord>
                            <br />
                            <span className="relative inline-block overflow-hidden pb-3 align-bottom">
                                <span className="hero-mask" style={delay(0.2)}>
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
                                </span>
                                {/* Hand-drawn underline that draws itself */}
                                <svg className="absolute -bottom-0.5 left-0 h-4 w-full" viewBox="0 0 200 16" preserveAspectRatio="none" fill="none">
                                    <path
                                        className="hero-draw"
                                        pathLength={1}
                                        d="M3 11 C 50 3, 120 3, 197 9"
                                        stroke="url(#hero-underline)"
                                        strokeWidth="5"
                                        strokeLinecap="round"
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

                    <p className="hero-up mt-6 max-w-lg text-lg leading-relaxed text-white/80 sm:text-xl" style={delay(0.3)}>
                        Learn from anywhere and build your <span className="font-semibold text-white">brighter career</span>.
                    </p>

                    <div className="hero-up mt-10 flex flex-wrap gap-4" style={delay(0.4)}>
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
                    </div>

                    <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-3">
                        {highlights.map(({ icon: Icon, text }, i) => (
                            <li
                                key={text}
                                style={delay(0.5 + i * 0.06)}
                                className="hero-up flex items-center gap-2 text-sm font-medium text-white/80"
                            >
                                <Icon size={18} className="text-glow" />
                                {text}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Right: floating glass badges over the background */}
                <div className="relative hidden h-full min-h-[22rem] lg:block">
                    <div className="hero-slide-in absolute right-6 top-[18%]" style={delay(0.5)}>
                        <div className="glass-dark flex items-center gap-3 rounded-2xl px-5 py-4 shadow-2xl shadow-black/20 animate-float">
                            <span className="icon-tile h-11 w-11">
                                <GraduationCap size={22} />
                            </span>
                            <div>
                                <p className="text-sm font-bold text-white">Admissions Open</p>
                                <p className="text-xs text-white/70">Apply today</p>
                            </div>
                        </div>
                    </div>

                    <div className="hero-slide-in absolute bottom-[18%] left-4" style={delay(0.65)}>
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
                    </div>
                </div>
            </div>
        </section>
    );
}
