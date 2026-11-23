"use client";

import { useEffect, useState } from "react";
import { BookOpen, CalendarClock, Loader2, Mail, MessageSquare, Phone, Search, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickEnquiry {
    _id: string;
    name: string;
    email: string;
    phone: string;
    course: string;
    session: string;
    source: "hero" | "popup";
    status: "new" | "contacted" | "resolved";
    createdAt: string;
}

const SOURCE_LABEL: Record<QuickEnquiry["source"], string> = { hero: "Hero form", popup: "Popup (10s)" };
const STATUS_STYLE: Record<QuickEnquiry["status"], string> = {
    new: "bg-primary/10 text-primary border-primary/20",
    contacted: "bg-amber-50 text-amber-700 border-amber-200",
    resolved: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const formatDateTime = (value: string) =>
    new Date(value).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });

/** Admin → Enquiries → Quick Enquiries: submissions from the homepage hero form and the 10-second popup. */
export default function QuickEnquiriesList() {
    const [items, setItems] = useState<QuickEnquiry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [sourceFilter, setSourceFilter] = useState<"all" | QuickEnquiry["source"]>("all");

    useEffect(() => {
        fetch("/api/hero-enquiries")
            .then((res) => (res.ok ? res.json() : Promise.reject()))
            .then(setItems)
            .catch(() => setError("Couldn't load quick enquiries."))
            .finally(() => setLoading(false));
    }, []);

    const updateStatus = async (id: string, status: QuickEnquiry["status"]) => {
        const previous = items;
        setItems((list) => list.map((e) => (e._id === id ? { ...e, status } : e)));
        const res = await fetch(`/api/hero-enquiries/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status }),
        }).catch(() => null);
        if (!res?.ok) {
            setItems(previous);
            alert("Couldn't update the status. Please try again.");
        }
    };

    const remove = async (id: string) => {
        if (!confirm("Delete this enquiry?")) return;
        const res = await fetch(`/api/hero-enquiries/${id}`, { method: "DELETE" }).catch(() => null);
        if (res?.ok) setItems((list) => list.filter((e) => e._id !== id));
        else alert("Couldn't delete the enquiry. Please try again.");
    };

    const term = search.trim().toLowerCase();
    const visible = items.filter(
        (e) =>
            (sourceFilter === "all" || e.source === sourceFilter) &&
            (!term ||
                [e.name, e.email, e.phone, e.course, e.session].some((v) => v.toLowerCase().includes(term)))
    );

    if (loading) {
        return (
            <div className="flex justify-center p-20">
                <Loader2 className="animate-spin text-primary" size={40} />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-3 md:flex-row">
                <div className="flex flex-1 items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3">
                    <Search className="text-slate-400" size={20} />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search name, email, number, course or session..."
                        className="flex-1 bg-transparent font-medium text-slate-800 outline-none placeholder:text-slate-500"
                    />
                </div>
                <select
                    value={sourceFilter}
                    onChange={(e) => setSourceFilter(e.target.value as typeof sourceFilter)}
                    className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-primary"
                    aria-label="Filter by source"
                >
                    <option value="all">All sources</option>
                    <option value="hero">Hero form</option>
                    <option value="popup">Popup (10s)</option>
                </select>
            </div>

            {error && <p className="text-sm font-semibold text-rose-600">{error}</p>}

            {visible.length === 0 ? (
                <div className="rounded-lg border border-slate-200 bg-white p-16 text-center">
                    <MessageSquare size={40} className="mx-auto text-slate-300" />
                    <h3 className="mt-4 text-xl font-bold text-slate-800">No Quick Enquiries</h3>
                    <p className="mt-1 text-slate-500">
                        {term || sourceFilter !== "all"
                            ? "Try a different search or filter."
                            : "Enquiries from the homepage hero form and popup will appear here."}
                    </p>
                </div>
            ) : (
                <div className="grid gap-3">
                    {visible.map((e) => (
                        <div key={e._id} className="rounded-lg border border-slate-200 bg-white p-5 transition-colors hover:border-slate-300">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h3 className="text-lg font-bold text-slate-800">{e.name}</h3>
                                        <span className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                                            {SOURCE_LABEL[e.source] ?? e.source}
                                        </span>
                                    </div>
                                    <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1.5 text-sm text-slate-600">
                                        <a href={`mailto:${e.email}`} className="flex items-center gap-2 hover:text-primary">
                                            <Mail size={14} className="text-slate-400" /> {e.email}
                                        </a>
                                        <a href={`tel:${e.phone}`} className="flex items-center gap-2 hover:text-primary">
                                            <Phone size={14} className="text-slate-400" /> {e.phone}
                                        </a>
                                    </div>
                                    <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1.5 text-sm">
                                        <span className="flex items-center gap-2 text-slate-700">
                                            <BookOpen size={14} className="text-slate-400" />
                                            <span className="text-slate-500">Course:</span> <span className="font-semibold">{e.course}</span>
                                        </span>
                                        <span className="flex items-center gap-2 text-slate-700">
                                            <CalendarClock size={14} className="text-slate-400" />
                                            <span className="text-slate-500">Session:</span> <span className="font-semibold">{e.session}</span>
                                        </span>
                                    </div>
                                </div>

                                <div className="flex shrink-0 items-center gap-3 lg:flex-col lg:items-end">
                                    <span className="text-xs font-semibold text-slate-500">{formatDateTime(e.createdAt)}</span>
                                    <div className="flex items-center gap-2">
                                        <select
                                            value={e.status}
                                            onChange={(ev) => updateStatus(e._id, ev.target.value as QuickEnquiry["status"])}
                                            className={cn("rounded-md border px-2.5 py-1.5 text-xs font-bold uppercase tracking-wider outline-none", STATUS_STYLE[e.status])}
                                            aria-label={`Status for ${e.name}`}
                                        >
                                            <option value="new">New</option>
                                            <option value="contacted">Contacted</option>
                                            <option value="resolved">Resolved</option>
                                        </select>
                                        <button
                                            onClick={() => remove(e._id)}
                                            className="rounded-md p-2 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-500"
                                            title="Delete"
                                            aria-label={`Delete enquiry from ${e.name}`}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
