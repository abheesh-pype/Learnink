"use client";

import Link from "next/link";
import { preload } from "react-dom";
import { ArrowRight } from "lucide-react";
import { useSiteConfig } from "@/components/SiteConfigProvider";
import QuickEnquiryForm from "@/components/QuickEnquiryForm";

// Entrance animations are plain CSS (.hero-* in globals.css) so they start the moment the page paints.
const delay = (seconds: number) => ({ animationDelay: `${seconds}s` });

/**
 * Full-screen homepage hero: the image uploaded in Admin → SEO Settings → Hero Background fills the screen
 * (behind the floating navbar). Title on the left, quick enquiry form on the right.
 */
export default function Hero() {
    const { heroBg } = useSiteConfig();

    // Puts <link rel="preload"> in the page <head> so the browser downloads the image first.
    if (heroBg) preload(heroBg, { as: "image", fetchPriority: "high" });

    return (
        <section className="relative isolate flex min-h-[100svh] overflow-hidden bg-primary-darker">
            {/* Background image: one slow zoom-out when the page loads, then still */}
            {heroBg && (
                <div className="hero-settle absolute inset-0 -z-20" aria-hidden="true">
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
            <div className="absolute inset-0 -z-10 bg-gradient-to-t from-primary-darker/90 via-primary-darker/35 to-primary-darker/15" aria-hidden="true" />
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary-darker/60 via-transparent to-transparent" aria-hidden="true" />
            <div className="absolute inset-x-0 top-0 -z-10 h-40 bg-gradient-to-b from-black/30 to-transparent" aria-hidden="true" />

            <div className="container-page grid w-full grid-cols-1 content-end gap-10 lg:content-stretch pb-12 pt-28 sm:pb-16 lg:grid-cols-[1fr_400px] lg:gap-16 lg:pb-20 lg:pt-24">
                {/* Left: title */}
                <div className="max-w-3xl self-end">
                    <h1 className="hero-up font-display text-5xl font-medium leading-[1.05] text-white sm:text-6xl lg:text-[5rem]" style={delay(0.1)}>
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
                            className="inline-flex items-center justify-center rounded-md border border-white/40 px-6 py-3.5 text-base font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                        >
                            About Learnink
                        </Link>
                    </div>
                </div>

                {/* Right: quick enquiry form (saved to the hero_enquiries table, shown in Admin → Enquiries) */}
                <div className="hero-up rounded-lg bg-white p-6 shadow-2xl shadow-black/30 sm:p-7 lg:self-center" style={delay(0.35)}>
                    <QuickEnquiryForm source="hero" />
                </div>
            </div>
        </section>
    );
}
