"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Building2 } from "lucide-react";
import Link from "next/link";
import SectionHeader from "@/components/ui/SectionHeader";

export interface Partner {
    _id: string;
    name: string;
    logo: string;
    slug?: string;
}

interface PartnersProps {
    limit?: number;
    fullWidth?: boolean;
    /** Partners loaded on the server. When given, the section renders immediately without fetching. */
    initialPartners?: Partner[];
}

export default function Partners({ limit, fullWidth = false, initialPartners }: PartnersProps) {
    const [partners, setPartners] = useState<Partner[]>(() =>
        initialPartners ? (limit ? initialPartners.slice(0, limit) : initialPartners) : []
    );
    const [loading, setLoading] = useState(!initialPartners);

    useEffect(() => {
        if (initialPartners) return;
        const fetchPrograms = async () => {
            try {
                const res = await fetch("/api/partners");
                if (res.ok) {
                    const data = await res.json();
                    setPartners(limit ? data.slice(0, limit) : data);
                }
            } catch (error) {
                console.error("Failed to load programs", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPrograms();
    }, [limit, initialPartners]);

    const header = (
        <SectionHeader
            eyebrow="Our Universities"
            title={<>Our University <span className="italic text-primary">Partners</span></>}
            lead="We proudly partner with top universities to provide world-class educational opportunities. Explore our trusted network of academic institutions dedicated to your success."
            align="center"
        />
    );

    const spinner = (
        <div className="flex justify-center p-20">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <section id="partners" className="section overflow-hidden bg-white">
            <div className="container-page relative">
                {fullWidth ? (
                    // Full page layout: heading on top, grid below
                    <div>
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            {header}
                        </motion.div>

                        <div className="mt-12 lg:mt-16">
                            {loading ? spinner : partners.length === 0 ? (
                                <div className="card px-8 py-16 text-center">
                                    <h3 className="text-lg font-semibold text-ink">University Partners Coming Soon</h3>
                                    <p className="mt-2 text-slate-500">Check back soon to see our academic collaborations.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
                                    {partners.map((partner, index) => (
                                        <PartnerCard key={partner._id} partner={partner} index={index} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    // Homepage layout: heading on top, endlessly scrolling logo strip below
                    <div>
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            {header}
                        </motion.div>

                        <div className="mt-12 lg:mt-16">
                            {loading ? spinner : partners.length === 0 ? (
                                <div className="card mx-auto max-w-xl px-8 py-14 text-center">
                                    <h3 className="text-base font-semibold text-slate-500">Partner List Pending</h3>
                                </div>
                            ) : (
                                <PartnerMarquee partners={partners} />
                            )}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}

/** Infinite, auto-scrolling strip of university cards (pauses on hover). */
function PartnerMarquee({ partners }: { partners: Partner[] }) {
    // Too few to scroll nicely: show them as a centred row instead of repeating the same logo.
    if (partners.length < 4) {
        return (
            <div className="flex flex-wrap justify-center gap-5">
                {partners.map((partner, index) => (
                    <div key={partner._id} className="w-48 sm:w-56">
                        <PartnerCard partner={partner} index={index} />
                    </div>
                ))}
            </div>
        );
    }

    // Repeat short lists so the strip is always wider than the screen, then double it for a seamless loop.
    const repeats = Math.max(1, Math.ceil(8 / partners.length));
    const row = Array.from({ length: repeats }, () => partners).flat();

    return (
        <div className="marquee-mask overflow-hidden py-4">
            <div className="marquee-track flex w-max gap-5">
                {[...row, ...row].map((partner, i) => {
                    const isCopy = i >= partners.length;
                    return (
                        <div key={`${partner._id}-${i}`} className="w-48 shrink-0 sm:w-56" aria-hidden={isCopy || undefined}>
                            <PartnerCard partner={partner} index={0} animate={false} focusable={!isCopy} />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function PartnerCard({ partner, index, animate = true, focusable = true }: { partner: Partner; index: number; animate?: boolean; focusable?: boolean }) {
    return (
        <Link href={`/partners/${partner.slug || partner._id}`} className="block h-full" tabIndex={focusable ? undefined : -1}>
            <motion.div
                initial={animate ? { opacity: 0, y: 12 } : false}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06, duration: 0.5 }}
                className="card card-hover group flex h-full flex-col items-center justify-center gap-3 p-6 text-center"
            >
                <div className="flex h-20 w-full items-center justify-center">
                    {partner.logo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={partner.logo}
                            alt={partner.name}
                            className="max-h-full max-w-full object-contain opacity-80 grayscale transition duration-300 group-hover:opacity-100 group-hover:grayscale-0"
                        />
                    ) : (
                        <Building2 className="text-primary-200 transition-colors group-hover:text-primary" size={40} />
                    )}
                </div>
                <span className="text-sm font-medium leading-snug text-slate-600 transition-colors group-hover:text-ink line-clamp-2">
                    {partner.name}
                </span>
            </motion.div>
        </Link>
    );
}
