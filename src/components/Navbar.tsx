"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { motion, useScroll, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSiteConfig } from "@/components/SiteConfigProvider";
import { DEFAULT_LOGO } from "@/lib/site";

const NavLinks = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Programs", href: "/programs" },
    { name: "Universities", href: "/partners" },
    { name: "Contact", href: "/contact" },
];

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const pathname = usePathname();
    const { logo } = useSiteConfig(); // Admin → SEO Settings → Site Logo (falls back to /logo.png)
    const { scrollYProgress } = useScroll();
    const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 25, mass: 0.3 });

    // "/" only matches the home page; other links also stay active on their sub-pages (e.g. /programs/some-slug).
    const isActive = (href: string) =>
        href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <nav
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
                scrolled
                    ? "border-b border-white/60 bg-white/80 shadow-lg shadow-primary/5 backdrop-blur-xl"
                    : "border-b border-transparent bg-white"
            )}
        >
            {/* Scroll progress bar */}
            <motion.div
                className="absolute bottom-0 left-0 right-0 h-[3px] origin-left bg-gradient-to-r from-primary via-violet to-glow"
                style={{ scaleX: progress }}
                aria-hidden="true"
            />
            <div className="container-page">
                <div className="flex h-20 items-center justify-between gap-6">
                    <Link href="/" className="flex shrink-0 items-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={logo}
                            alt="Learnink"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                                if (!e.currentTarget.src.endsWith(DEFAULT_LOGO)) e.currentTarget.src = DEFAULT_LOGO;
                            }}
                            className="h-11 w-auto object-contain transition-transform duration-300 hover:scale-105"
                        />
                    </Link>

                    {/* Desktop Links */}
                    <div className="hidden md:flex items-center gap-8">
                        {NavLinks.map((link) => {
                            const active = isActive(link.href);
                            return (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    aria-current={active ? "page" : undefined}
                                    className={cn(
                                        "relative py-2 text-[15px] font-semibold transition-colors after:content-[''] after:absolute after:-bottom-0.5 after:left-0 after:h-0.5 after:rounded-full after:transition-all after:duration-300",
                                        active
                                            ? "text-brand-blue after:w-full after:bg-brand-blue"
                                            : "text-slate-600 hover:text-slate-900 after:w-0 after:bg-slate-900 hover:after:w-full"
                                    )}
                                >
                                    {link.name}
                                </Link>
                            );
                        })}
                    </div>

                    <div className="hidden md:flex items-center gap-2">
                        <Link
                            href="/admin/login"
                            className="rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
                        >
                            Login
                        </Link>
                        <Link
                            href="/contact"
                            className="inline-flex items-center rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-xl"
                        >
                            Enquire Now
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden rounded-lg p-2 text-slate-800 transition-colors hover:bg-slate-100"
                        onClick={() => setIsOpen(!isOpen)}
                        aria-label={isOpen ? "Close menu" : "Open menu"}
                        aria-expanded={isOpen}
                    >
                        {isOpen ? <X size={26} /> : <Menu size={26} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden border-t border-slate-200 bg-white shadow-lg animate-[fadeInUp_0.25s_ease-out_forwards]">
                    <div className="container-page flex flex-col py-4">
                        {NavLinks.map((link) => {
                            const active = isActive(link.href);
                            return (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    aria-current={active ? "page" : undefined}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-3 text-base font-semibold",
                                        active ? "text-brand-blue" : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                                    )}
                                    onClick={() => setIsOpen(false)}
                                >
                                    <span
                                        className={cn(
                                            "pb-1 border-b-2",
                                            active ? "border-brand-blue" : "border-transparent"
                                        )}
                                    >
                                        {link.name}
                                    </span>
                                </Link>
                            );
                        })}
                        <div className="mt-3 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
                            <Link
                                href="/admin/login"
                                className="rounded-lg border border-slate-200 px-4 py-3 text-center text-sm font-semibold text-slate-600 hover:bg-slate-50"
                                onClick={() => setIsOpen(false)}
                            >
                                Staff Login
                            </Link>
                            <Link
                                href="/contact"
                                className="rounded-lg bg-slate-900 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-slate-700"
                                onClick={() => setIsOpen(false)}
                            >
                                Enquire Now
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
