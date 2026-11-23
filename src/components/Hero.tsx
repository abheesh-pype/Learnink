"use client";

import Link from "next/link";
import { useState } from "react";
import { preload } from "react-dom";
import { ArrowRight, Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSiteConfig } from "@/components/SiteConfigProvider";

// Entrance animations are plain CSS (.hero-* in globals.css) so they start the moment the page paints.
const delay = (seconds: number) => ({ animationDelay: `${seconds}s` });

/**
 * Full-screen homepage hero: the image uploaded in Admin → SEO Settings → Hero Background fills the screen
 * (behind the floating navbar), with a large serif title at the bottom left.
 */
export default function Hero() {
    const { heroBg } = useSiteConfig();
    const [paused, setPaused] = useState(false);

    // Puts <link rel="preload"> in the page <head> so the browser downloads the image first.
    if (heroBg) preload(heroBg, { as: "image", fetchPriority: "high" });

    return (
        <section className="relative isolate flex h-[100svh] min-h-[600px] max-h-[1100px] items-end overflow-hidden bg-primary-darker">
            {/* Background image with a slow, endless drift (can be paused) */}
            {heroBg && (
                <div
                    className={cn("hero-drift absolute inset-0 -z-20", paused && "[animation-play-state:paused]")}
                    aria-hidden="true"
                >
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

            {/* Shading: darker at the bottom-left so the title is readable on any photo */}
            <div className="absolute inset-0 -z-10 bg-gradient-to-t from-primary-darker/90 via-primary-darker/30 to-primary-darker/10" aria-hidden="true" />
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary-darker/60 via-transparent to-transparent" aria-hidden="true" />
            <div className="absolute inset-x-0 top-0 -z-10 h-40 bg-gradient-to-b from-black/30 to-transparent" aria-hidden="true" />

            <div className="container-page flex w-full items-end justify-between gap-8 pb-12 sm:pb-16 lg:pb-20">
                <div className="max-w-3xl">
                    <h1 className="hero-up font-display text-5xl font-medium leading-[1.05] text-white sm:text-6xl lg:text-[5.25rem]" style={delay(0.1)}>
                        Rebuild Your Career
                    </h1>
                    <p className="hero-up mt-5 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg" style={delay(0.25)}>
                        Learn from anywhere with flexible programs from leading universities, and build your brighter career.
                    </p>
                    <div className="hero-up mt-8 flex flex-wrap gap-3" style={delay(0.4)}>
                        <Link href="/programs" className="btn-light group px-6 py-3.5 text-base">
                            Explore Programs
                            <ArrowRight className="transition-transform group-hover:translate-x-1" size={18} />
                        </Link>
                        <Link
                            href="/about"
                            className="inline-flex items-center justify-center rounded-xl border border-white/40 px-6 py-3.5 text-base font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                        >
                            About Learnink
                        </Link>
                    </div>
                </div>

                {heroBg && (
                    <button
                        type="button"
                        onClick={() => setPaused((p) => !p)}
                        className="hero-up mb-1 hidden h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-white/70 text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:flex"
                        style={delay(0.5)}
                        aria-label={paused ? "Play background motion" : "Pause background motion"}
                        aria-pressed={paused}
                    >
                        {paused ? <Play size={22} className="ml-0.5" /> : <Pause size={22} />}
                    </button>
                )}
            </div>
        </section>
    );
}
