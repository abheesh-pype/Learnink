"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Users, BookOpen, MessageSquare, TrendingUp, ArrowRight, Activity, Server, Database, Globe, Sparkles } from "lucide-react";
import Link from "next/link";
import CountUp from "@/components/ui/CountUp";

export default function AdminDashboard() {
    const { data: session } = useSession();
    const [counts, setCounts] = useState({
        programs: 0,
        partners: 0,
        enquiries: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCounts = async () => {
            try {
                const [progRes, partRes, enqRes] = await Promise.all([
                    fetch("/api/admin/programs"),
                    fetch("/api/partners"),
                    fetch("/api/enquiries")
                ]);

                const progs = progRes.ok ? await progRes.json() : [];
                const parts = partRes.ok ? await partRes.json() : [];
                const enqs = enqRes.ok ? await enqRes.json() : [];

                setCounts({
                    programs: Array.isArray(progs) ? progs.length : 0,
                    partners: Array.isArray(parts) ? parts.length : 0,
                    enquiries: Array.isArray(enqs) ? enqs.length : 0
                });
            } catch (error) {
                console.error("Failed to fetch dashboard counts:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCounts();
    }, []);

    const stats = [
        { name: "Total Programs", value: counts.programs.toString(), icon: BookOpen, gradient: "from-primary to-violet", href: "/admin/programs", trend: loading ? "Loading..." : "Live data" },
        { name: "Universities", value: counts.partners.toString(), icon: Users, gradient: "from-violet to-fuchsia-500", href: "/admin/partners", trend: loading ? "Loading..." : "Live data" },
        { name: "New Enquiries", value: counts.enquiries.toString(), icon: MessageSquare, gradient: "from-fuchsia-500 to-glow", href: "/admin/enquiries", trend: loading ? "Loading..." : "Live data" },
    ];

    return (
        <div className="space-y-8">
            {/* Welcome banner */}
            <div className="bg-brand-gradient relative overflow-hidden rounded-3xl p-8 text-white shadow-2xl shadow-violet/25 lg:p-10">
                <div className="glow-blob -right-16 -top-16 h-72 w-72 bg-glow/30" aria-hidden="true" />
                <div className="absolute inset-0 opacity-15 [background-image:radial-gradient(rgba(255,255,255,0.6)_1px,transparent_1px)] [background-size:22px_22px]" aria-hidden="true" />
                <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-end">
                    <div>
                        <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider backdrop-blur">
                            <Sparkles size={14} /> Dashboard
                        </span>
                        <h1 className="mt-4 text-3xl font-extrabold tracking-tight lg:text-4xl">
                            Welcome Back, <span className="text-shimmer-light">{session?.user?.name?.split(' ')[0] || 'Admin'}</span>
                        </h1>
                        <p className="mt-2 text-lg font-medium text-white/80">Here&apos;s what&apos;s happening today at Learnink.</p>
                    </div>
                    <div className="flex w-fit items-center gap-3 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur">
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" />
                            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                        </span>
                        System Operational
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {stats.map((stat, index) => (
                    <motion.div
                        key={stat.name}
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + index * 0.1, duration: 0.5 }}
                    >
                        <Link href={stat.href} className="card card-hover group relative block overflow-hidden p-7">
                            <stat.icon size={110} className="absolute -right-5 -top-5 text-primary/5 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110" aria-hidden="true" />

                            <div className="relative">
                                <span className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${stat.gradient} text-white shadow-lg shadow-violet/25 transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110`}>
                                    <stat.icon size={26} strokeWidth={2} />
                                </span>
                                <p className="mt-6 text-xs font-semibold uppercase tracking-widest text-slate-400">{stat.name}</p>
                                <p className="mt-1 text-5xl font-extrabold tracking-tight text-ink">
                                    <CountUp value={stat.value} duration={1} />
                                </p>

                                <div className="mt-4 flex w-fit items-center gap-2 rounded-lg bg-primary-50 px-3 py-1.5 text-sm font-semibold text-primary">
                                    <TrendingUp size={16} />
                                    {stat.trend}
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>

            {/* Content Sections */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                {/* Recent Activity / Enquiries */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="card flex flex-col overflow-hidden lg:col-span-2"
                >
                    <div className="flex items-center justify-between border-b border-slate-100 p-7">
                        <h3 className="flex items-center gap-3 text-xl font-bold text-ink">
                            <span className="icon-tile h-10 w-10">
                                <Activity size={20} />
                            </span>
                            Recent Enquiries
                        </h3>
                        <Link href="/admin/enquiries" className="group flex items-center gap-1 text-sm font-semibold text-primary">
                            View All <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                        </Link>
                    </div>

                    <div className="flex flex-1 flex-col items-center justify-center p-10 text-center">
                        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary-50 animate-float">
                            <MessageSquare className="text-primary-200" size={32} />
                        </div>
                        <p className="font-medium text-slate-500">No recent enquiries to display.</p>
                        <p className="text-sm text-slate-400">New messages will appear here.</p>
                    </div>
                </motion.div>

                {/* System Status / Quick Links */}
                <div className="space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                        className="relative overflow-hidden rounded-3xl bg-primary-darker p-7 text-white shadow-2xl shadow-primary/20"
                    >
                        <div className="glow-blob -right-16 -top-16 h-56 w-56 bg-violet/40" aria-hidden="true" />

                        <h3 className="relative mb-6 flex items-center gap-3 text-xl font-bold">
                            <Server className="text-primary-200" size={24} />
                            System Health
                        </h3>

                        <div className="relative space-y-3">
                            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                                <div className="flex items-center gap-3">
                                    <Database size={18} className="text-emerald-400" />
                                    <span className="font-semibold text-white/90">Database</span>
                                </div>
                                <span className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300">
                                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" /> Online
                                </span>
                            </div>

                            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                                <div className="flex items-center gap-3">
                                    <Globe size={18} className="text-primary-200" />
                                    <span className="font-semibold text-white/90">Website</span>
                                </div>
                                <span className="rounded-full border border-violet/30 bg-violet/20 px-3 py-1 text-xs font-bold text-primary-200">
                                    Live
                                </span>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.5 }}
                        className="card p-7"
                    >
                        <h3 className="mb-5 text-lg font-bold text-ink">Quick Actions</h3>
                        <div className="space-y-3">
                            <Link href="/admin/programs" className="group flex items-center gap-4 rounded-2xl bg-primary-50 p-4 transition-all duration-300 hover:translate-x-1 hover:bg-gradient-to-r hover:from-primary hover:to-violet hover:text-white hover:shadow-lg hover:shadow-violet/25">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-primary shadow-sm transition-transform group-hover:scale-110">
                                    <BookOpen size={20} />
                                </div>
                                <span className="font-semibold">Add New Program</span>
                                <ArrowRight size={16} className="ml-auto opacity-0 transition-all group-hover:opacity-100" />
                            </Link>
                            <Link href="/admin/partners" className="group flex items-center gap-4 rounded-2xl bg-primary-50 p-4 transition-all duration-300 hover:translate-x-1 hover:bg-gradient-to-r hover:from-primary hover:to-violet hover:text-white hover:shadow-lg hover:shadow-violet/25">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-primary shadow-sm transition-transform group-hover:scale-110">
                                    <Users size={20} />
                                </div>
                                <span className="font-semibold">Manage Universities</span>
                                <ArrowRight size={16} className="ml-auto opacity-0 transition-all group-hover:opacity-100" />
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
