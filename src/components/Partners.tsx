"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Building2 } from "lucide-react";
import Link from "next/link";
import SectionHeader from "@/components/ui/SectionHeader";

interface Partner {
    _id: string;
    name: string;
    logo: string;
    slug?: string;
}

interface PartnersProps {
    limit?: number;
    fullWidth?: boolean;
}

export default function Partners({ limit, fullWidth = false }: PartnersProps) {
    const [partners, setPartners] = useState<Partner[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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
    }, [limit]);

    const header = (
        <SectionHeader
            eyebrow="Our Universities"
            title={<>Our University <span className="text-primary">Partners</span></>}
            lead="We proudly partner with top universities to provide world-class educational opportunities. Explore our trusted network of academic institutions dedicated to your success."
            align={fullWidth ? "center" : "left"}
        />
    );

    const spinner = (
        <div className="flex justify-center p-20">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <section id="partners" className="section bg-white">
            <div className="container-page">
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
                    // Homepage layout: heading left, logos right
                    <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-3 lg:gap-16">
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            {header}
                        </motion.div>

                        <div className="w-full lg:col-span-2">
                            {loading ? spinner : partners.length === 0 ? (
                                <div className="card px-8 py-14 text-center">
                                    <h3 className="text-base font-semibold text-slate-500">Partner List Pending</h3>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3">
                                    {partners.map((partner, index) => (
                                        <PartnerCard key={partner._id} partner={partner} index={index} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}

function PartnerCard({ partner, index }: { partner: Partner; index: number }) {
    return (
        <Link href={`/partners/${partner.slug || partner._id}`} className="block">
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06 }}
                className="card card-hover group flex h-full flex-col items-center justify-center gap-3 p-5 text-center"
            >
                <div className="flex h-20 w-full items-center justify-center">
                    {partner.logo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={partner.logo}
                            alt={partner.name}
                            className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                        />
                    ) : (
                        <Building2 className="text-primary-200 transition-colors group-hover:text-primary" size={40} />
                    )}
                </div>
                <span className="text-sm font-semibold leading-snug text-slate-700 transition-colors group-hover:text-primary line-clamp-2">
                    {partner.name}
                </span>
            </motion.div>
        </Link>
    );
}
