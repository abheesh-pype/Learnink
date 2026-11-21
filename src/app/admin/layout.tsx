"use client";

import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";
import {
    LayoutDashboard,
    BookOpen,
    Users,
    MessageSquare,
    LogOut,
    GraduationCap,
    Menu,
    X,
    Globe,
    Image as ImageIcon,
    Star,
    Loader2,
    Settings,
    Phone,
    ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Bypass layout and checks for login page
    if (pathname === "/admin/login") {
        return <>{children}</>;
    }

    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-primary-50 text-primary font-bold">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-primary w-10 h-10" />
                    <span className="text-slate-500">Loading Dashboard...</span>
                </div>
            </div>
        );
    }

    if (status === "unauthenticated") return null;
    if (!session) return null;

    const menuItems = [
        { name: "Dashboard", href: "/admin", icon: LayoutDashboard, exact: true },
        { name: "Programs", href: "/admin/programs", icon: BookOpen },
        { name: "Universities", href: "/admin/partners", icon: Users },
        { name: "Photo Gallery", href: "/admin/gallery", icon: ImageIcon },
        { name: "Testimonials", href: "/admin/testimonials", icon: Star },
        { name: "Enquiries", href: "/admin/enquiries", icon: MessageSquare },
        { name: "Contact", href: "/admin/contact", icon: Phone },
        { name: "SEO Settings", href: "/admin/seo", icon: Globe },
        { name: "Integrations", href: "/admin/settings", icon: Settings },
    ];

    return (
        <div className="relative flex min-h-screen flex-col bg-primary-50 font-sans lg:flex-row">
            {/* Soft animated background for the content area */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
                <div className="glow-blob -right-40 -top-40 h-[30rem] w-[30rem] bg-violet/10" />
                <div className="glow-blob -bottom-40 left-1/3 h-[26rem] w-[26rem] bg-glow/10 [animation-delay:-7s]" />
            </div>

            {/* Mobile Header */}
            <header className="sticky top-0 z-50 flex items-center justify-between border-b border-white/60 bg-white/80 p-4 backdrop-blur-xl lg:hidden">
                <Link href="/" className="flex items-center gap-2">
                    <span className="icon-tile h-9 w-9">
                        <GraduationCap className="h-5 w-5" />
                    </span>
                    <span className="text-lg font-extrabold tracking-tight text-ink">Learnink Admin</span>
                </Link>
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100"
                    aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </header>

            {/* Sidebar */}
            <aside className={cn(
                "fixed inset-y-0 left-0 z-40 flex w-72 flex-col overflow-hidden bg-primary-darker text-white shadow-2xl transition-transform duration-300 ease-in-out lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
                isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                {/* Sidebar glow */}
                <div className="glow-blob -left-24 -top-24 h-72 w-72 bg-violet/40" aria-hidden="true" />
                <div className="glow-blob -bottom-24 -right-24 h-72 w-72 bg-glow/20 [animation-delay:-6s]" aria-hidden="true" />

                <div className="relative hidden border-b border-white/10 p-7 lg:block">
                    <Link href="/" className="group flex items-center gap-3">
                        <span className="icon-tile h-11 w-11 transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110">
                            <GraduationCap className="h-6 w-6" />
                        </span>
                        <div className="flex flex-col">
                            <span className="text-xl font-extrabold leading-none tracking-tight">Learnink</span>
                            <span className="mt-1 text-[11px] font-semibold uppercase tracking-widest text-white/50">Admin Portal</span>
                        </div>
                    </Link>
                </div>

                <div className="relative flex-1 overflow-y-auto p-4 lg:px-5 lg:py-6">
                    <nav className="space-y-1">
                        <p className="mb-3 mt-2 px-4 text-[11px] font-semibold uppercase tracking-widest text-white/40">Main Menu</p>
                        {menuItems.map((item) => {
                            const isActive = item.exact
                                ? pathname === item.href
                                : pathname.startsWith(item.href);

                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={cn(
                                        "group relative flex items-center gap-3 overflow-hidden rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300",
                                        isActive
                                            ? "text-white shadow-lg shadow-violet/30"
                                            : "text-white/60 hover:translate-x-1 hover:bg-white/5 hover:text-white"
                                    )}
                                >
                                    {isActive && (
                                        <motion.span
                                            layoutId="admin-active-nav"
                                            className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary to-violet"
                                            transition={{ type: "spring", stiffness: 380, damping: 32 }}
                                        />
                                    )}
                                    <item.icon size={20} className={cn("relative transition-transform duration-300", isActive ? "text-white" : "text-white/50 group-hover:scale-110 group-hover:text-white")} strokeWidth={isActive ? 2.5 : 2} />
                                    <span className="relative">{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="relative border-t border-white/10 p-4">
                    <div className="mb-2 flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet to-glow font-bold text-white">
                            {session.user?.name?.charAt(0) || "A"}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-white">{session.user?.name || "Admin"}</p>
                            <p className="truncate text-xs text-white/50">Administrator</p>
                        </div>
                    </div>
                    <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-rose-300 transition-all hover:bg-rose-500/15 hover:text-rose-200"
                    >
                        <LogOut size={18} />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Overlay for mobile */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 z-30 bg-primary-darker/40 backdrop-blur-sm lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Main Content */}
            <main className="relative h-screen flex-1 overflow-y-auto overflow-x-hidden">
                {/* Top bar */}
                <div className="sticky top-0 z-20 hidden items-center justify-between border-b border-white/60 bg-white/70 px-10 py-4 backdrop-blur-xl lg:flex">
                    <p className="text-sm font-medium text-slate-500">
                        Signed in as <span className="font-semibold text-ink">{session.user?.name || "Admin"}</span>
                    </p>
                    <Link
                        href="/"
                        target="_blank"
                        className="group inline-flex items-center gap-2 rounded-xl border-2 border-primary-200 bg-white px-4 py-2 text-sm font-semibold text-primary transition-all hover:-translate-y-0.5 hover:border-violet hover:shadow-lg hover:shadow-violet/15"
                    >
                        View Website <ExternalLink size={15} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </Link>
                </div>

                <motion.div
                    key={pathname}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: [0.21, 0.47, 0.32, 0.98] }}
                    className="mx-auto max-w-7xl p-4 pt-6 lg:p-10"
                >
                    {children}
                </motion.div>
            </main>
        </div>
    );
}
