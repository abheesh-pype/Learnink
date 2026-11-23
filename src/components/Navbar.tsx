"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSiteConfig } from "@/components/SiteConfigProvider";
import { DEFAULT_LOGO } from "@/lib/site";

// Only a few links are shown in the header pill; the full list lives in the Menu.
const QuickLinks = [
    { name: "Programs", href: "/programs" },
    { name: "Universities", href: "/partners" },
    { name: "Gallery", href: "/gallery" },
    { name: "Contact", href: "/contact" },
];

const MenuLinks = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Programs", href: "/programs" },
    { name: "Universities", href: "/partners" },
    { name: "Gallery", href: "/gallery" },
    { name: "Contact", href: "/contact" },
];

const pill = "flex items-center rounded-md bg-primary-darker/90 p-1.5 shadow-lg shadow-black/20 ring-1 ring-white/10 backdrop-blur-md";
const pillItem =
    "rounded px-4 py-2 text-[15px] font-medium text-white/90 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
    const { logo } = useSiteConfig(); // Admin → SEO Settings → Site Logo (falls back to /logo.png)

    // "/" only matches the home page; other links also stay active on their sub-pages (e.g. /programs/some-slug).
    const isActive = (href: string) =>
        href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

    // While the full-screen menu is open: lock page scrolling and close on Escape.
    useEffect(() => {
        if (!isOpen) return;
        const previous = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && setIsOpen(false);
        window.addEventListener("keydown", onKey);
        return () => {
            document.body.style.overflow = previous;
            window.removeEventListener("keydown", onKey);
        };
    }, [isOpen]);

    return (
        <>
            {/* Floating header: no bar, just the logo and two pills over the page */}
            <nav className="pointer-events-none fixed inset-x-0 top-0 z-50">
                <div className="container-page flex h-20 items-center justify-between gap-4 pt-2">
                    <Link href="/" className="pointer-events-auto flex shrink-0 items-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={logo}
                            alt="Learnink"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                                if (!e.currentTarget.src.endsWith(DEFAULT_LOGO)) e.currentTarget.src = DEFAULT_LOGO;
                            }}
                            className="h-12 w-auto object-contain shadow-lg shadow-black/20"
                        />
                    </Link>

                    <div className="pointer-events-auto flex items-center gap-3">
                        {/* Quick links (desktop) */}
                        <div className={cn(pill, "hidden md:flex")}>
                            {QuickLinks.map((link) => {
                                const active = isActive(link.href);
                                return (
                                    <Link
                                        key={link.name}
                                        href={link.href}
                                        aria-current={active ? "page" : undefined}
                                        className={cn(pillItem, active && "bg-white font-semibold text-brand-blue hover:bg-white hover:text-brand-blue")}
                                    >
                                        {link.name}
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Enquire + Menu */}
                        <div className={pill}>
                            <Link href="/contact#enquiry-form" className={cn(pillItem, "hidden sm:inline-flex items-center gap-1.5")}>
                                Enquire <ArrowUpRight size={16} />
                            </Link>
                            <button
                                type="button"
                                onClick={() => setIsOpen(true)}
                                className={cn(pillItem, "inline-flex items-center gap-2")}
                                aria-expanded={isOpen}
                                aria-controls="site-menu"
                            >
                                Menu <Menu size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Full-screen menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        id="site-menu"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Site menu"
                        className="fixed inset-0 z-[60] overflow-y-auto bg-primary-darker text-white"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                    >
                        <div className="absolute -right-40 -top-40 h-[32rem] w-[32rem] rounded-full bg-violet/25 blur-3xl" aria-hidden="true" />
                        <div className="container-page relative flex min-h-full flex-col pb-10">
                            <div className="flex h-20 items-center justify-between pt-2">
                                <Link href="/" onClick={() => setIsOpen(false)}>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={logo} alt="Learnink" referrerPolicy="no-referrer" className="h-12 w-auto object-contain" />
                                </Link>
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className={cn(pill, pillItem, "gap-2 px-5")}
                                    autoFocus
                                >
                                    Close <X size={18} />
                                </button>
                            </div>

                            <ul className="mt-12 flex-1 space-y-2 lg:mt-16">
                                {MenuLinks.map((link, i) => {
                                    const active = isActive(link.href);
                                    return (
                                        <motion.li
                                            key={link.name}
                                            initial={{ opacity: 0, y: 24 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.05 + i * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                                        >
                                            <Link
                                                href={link.href}
                                                onClick={() => setIsOpen(false)}
                                                aria-current={active ? "page" : undefined}
                                                className="group inline-flex items-center gap-4 py-1 font-display text-5xl text-white/85 transition-colors hover:text-white sm:text-6xl lg:text-7xl"
                                            >
                                                <span className={cn("border-b-2 pb-1", active ? "border-white text-white" : "border-transparent")}>
                                                    {link.name}
                                                </span>
                                                <ArrowUpRight className="opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100" size={36} />
                                            </Link>
                                        </motion.li>
                                    );
                                })}
                            </ul>

                            <div className="mt-12 flex flex-wrap items-center gap-3 border-t border-white/15 pt-8">
                                <Link
                                    href="/contact#enquiry-form"
                                    onClick={() => setIsOpen(false)}
                                    className="btn-light px-6 py-3 text-base"
                                >
                                    Enquire Now <ArrowUpRight size={18} />
                                </Link>
                                <Link
                                    href="/admin/login"
                                    onClick={() => setIsOpen(false)}
                                    className="rounded-xl px-5 py-3 text-sm font-semibold text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                                >
                                    Staff Login
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
