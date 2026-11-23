"use client";

import Link from "next/link";
import { Facebook, Twitter, Instagram, Linkedin, Youtube, Loader2, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useSiteConfig } from "@/components/SiteConfigProvider";
import { DEFAULT_LOGO } from "@/lib/site";

export default function Footer() {
    const [email, setEmail] = useState("");
    const [subscribing, setSubscribing] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    // Logo and social links come from Admin → SEO Settings (loaded once in the root layout).
    const { logo, socialLinks } = useSiteConfig();

    const handleNewsletterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubscribing(true);
        setMessage(null);

        try {
            const res = await fetch("/api/newsletter", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage({ type: 'success', text: data.message });
                setEmail("");
            } else {
                setMessage({ type: 'error', text: data.error });
            }
        } catch {
            setMessage({ type: 'error', text: "Something went wrong. Please try again." });
        } finally {
            setSubscribing(false);
        }
    };

    const socialIcons = [
        { icon: Facebook, key: 'facebook', href: socialLinks.facebook },
        { icon: Twitter, key: 'twitter', href: socialLinks.twitter },
        { icon: Instagram, key: 'instagram', href: socialLinks.instagram },
        { icon: Linkedin, key: 'linkedin', href: socialLinks.linkedin },
        { icon: Youtube, key: 'youtube', href: socialLinks.youtube },
    ].filter(s => s.href);

    const linkClass = "inline-block text-white/70 underline-offset-4 transition-colors hover:text-white hover:underline";

    return (
        <footer className="relative mt-auto overflow-hidden bg-primary-darker text-white/70">
            <div className="container-page relative py-16 lg:py-20">
                <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-12">
                    <div className="space-y-5 lg:col-span-4">
                        <Link href="/" className="inline-flex">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={logo}
                                alt="Learnink"
                                referrerPolicy="no-referrer"
                                onError={(e) => {
                                    if (!e.currentTarget.src.endsWith(DEFAULT_LOGO)) e.currentTarget.src = DEFAULT_LOGO;
                                }}
                                className="h-11 w-auto rounded-md object-contain"
                            />
                        </Link>
                        <p className="max-w-xs text-sm leading-relaxed">
                            Linking learning, skills, and careers in a single platform. We&apos;re committed to breaking barriers in education.
                        </p>
                        {socialIcons.length > 0 && (
                            <div className="flex gap-3 pt-1">
                                {socialIcons.map((social) => (
                                    <a
                                        key={social.key}
                                        href={social.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex h-10 w-10 items-center justify-center rounded-md border border-white/20 text-white/80 transition-colors hover:bg-white hover:text-primary-darker"
                                        aria-label={`Follow us on ${social.key}`}
                                    >
                                        <social.icon size={18} />
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="lg:col-span-2">
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Quick Links</h3>
                        <ul className="mt-5 space-y-3 text-sm">
                            <li><Link href="/about" className={linkClass}>About Us</Link></li>
                            <li><Link href="/programs" className={linkClass}>Programs</Link></li>
                            <li><Link href="/partners" className={linkClass}>Universities</Link></li>
                            <li><Link href="/contact" className={linkClass}>Contact</Link></li>
                        </ul>
                    </div>

                    <div className="lg:col-span-2">
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Programs</h3>
                        <ul className="mt-5 space-y-3 text-sm">
                            <li><Link href="/programs" className={linkClass}>Fast Track Degree</Link></li>
                            <li><Link href="/programs" className={linkClass}>Credit Transfer</Link></li>
                            <li><Link href="/programs" className={linkClass}>Online Degree</Link></li>
                            <li><Link href="/programs" className={linkClass}>Secondary (10th)</Link></li>
                        </ul>
                    </div>

                    <div className="sm:col-span-2 lg:col-span-4">
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Newsletter</h3>
                        <p className="mt-5 text-sm">Subscribe to get latest updates entirely free.</p>
                        <form onSubmit={handleNewsletterSubmit} className="mt-4">
                            <div className="flex gap-2 rounded-lg border border-white/15 bg-white/5 p-1.5 transition-colors focus-within:border-white/40">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Email Address"
                                    required
                                    aria-label="Email address"
                                    className="min-w-0 flex-1 bg-transparent px-3 text-sm text-white outline-none placeholder:text-white/40"
                                />
                                <button
                                    type="submit"
                                    disabled={subscribing}
                                    className="inline-flex items-center gap-2 rounded-md bg-white px-4 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary-100 disabled:opacity-50"
                                >
                                    {subscribing ? <Loader2 size={16} className="animate-spin" /> : <>Subscribe <ArrowRight size={16} /></>}
                                </button>
                            </div>
                        </form>
                        {message && (
                            <p className={`mt-3 text-xs font-medium ${message.type === 'success' ? 'text-green-300' : 'text-red-300'}`}>
                                {message.text}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <div className="relative border-t border-white/10">
                <div className="container-page flex flex-col items-center justify-between gap-4 py-6 text-sm md:flex-row">
                    <p className="text-white/60">
                        © {new Date().getFullYear()} Learnink Education Pvt Ltd. <span className="mx-2 hidden md:inline">•</span> All rights reserved.
                    </p>
                    <div className="flex gap-6">
                        <Link href="/privacy" className="text-white/60 transition-colors hover:text-white">Privacy Policy</Link>
                        <Link href="/terms" className="text-white/60 transition-colors hover:text-white">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
