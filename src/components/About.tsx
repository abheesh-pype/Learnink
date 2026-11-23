"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

const features = [
    "All-in-one education platform",
    "Linking learning, skills, and careers",
    "Partnered with leading universities",
    "Fast-track degree programs",
    "Online and distance learning options",
    "Dedicated career counseling"
];

import { useState, useEffect } from "react";
import { DEFAULT_CONTACT } from "@/lib/contact";

/** `yearsCount` comes from Admin → Contact → Numbers → Years of Experience. */
export default function About({ yearsCount = DEFAULT_CONTACT.yearsCount }: { yearsCount?: string }) {
    const [aboutImage, setAboutImage] = useState("");

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const res = await fetch("/api/admin/seo");
                if (res.ok) {
                    const data = await res.json();
                    if (data.images?.aboutImage) setAboutImage(data.images.aboutImage);
                }
            } catch {
                console.error("Failed to load site config");
            }
        };
        fetchConfig();
    }, []);
    return (
        <section id="about" className="section overflow-hidden bg-white">
            <div className="container-page relative">
                <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-2 lg:gap-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                        className="relative pb-8 pr-4 sm:pr-8"
                    >
                        {/* Thin offset frame behind the photo */}
                        <div className="absolute bottom-0 right-0 h-[85%] w-[85%] rounded-md border border-primary-200" aria-hidden="true" />
                        <div className="group relative aspect-[4/3] overflow-hidden rounded-md bg-primary-100 lg:aspect-square">
                            {aboutImage ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={aboutImage} alt="About Us" className="w-full h-full object-cover transition-transform duration-[1200ms]" />
                            ) : (
                                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center transition-transform duration-[1200ms]"></div>
                            )}
                        </div>
                        <div className="absolute bottom-0 left-4 flex items-center gap-4 rounded-md bg-primary-darker px-6 py-5 text-white sm:left-8">
                            <p className="text-4xl font-light tracking-tight">{yearsCount}</p>
                            <p className="max-w-[10rem] text-sm leading-snug text-white/85">
                                <span className="font-semibold text-white">Years</span> of experience in educational consulting and excellence.
                            </p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7, delay: 0.1 }}
                    >
                        <span className="eyebrow">About Us</span>
                        <h2 className="section-title">
                            Learnink Education <span className="italic text-primary">Pvt Ltd</span>
                        </h2>
                        <p className="section-lead">
                            Learnink Education is a premier all-in-one education platform dedicated to transforming how individuals acquire knowledge and build their careers. Our platform is built on the vision of seamlessly linking academic learning with practical skills and professional growth.
                        </p>

                        <ul className="mt-8 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                            {features.map((feature, index) => (
                                <motion.li
                                    key={index}
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.2 + index * 0.08, duration: 0.5 }}
                                    className="group flex items-start gap-3"
                                >
                                    <span className="icon-tile mt-0.5 h-6 w-6 shrink-0 rounded-full transition-transform">
                                        <CheckCircle2 size={14} />
                                    </span>
                                    <span className="text-[15px] text-slate-700">{feature}</span>
                                </motion.li>
                            ))}
                        </ul>

                        <div className="mt-10 border-l-2 border-primary bg-primary-50 p-6">
                            <h3 className="font-display text-2xl font-semibold text-ink">Our Vision</h3>
                            <p className="mt-2 text-sm leading-relaxed text-slate-600">
                                To be the bridge that links every learner to their dream career by providing accessible, accredited, and industry-relevant educational programs.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
