"use client";

import { useCallback, useEffect, useState } from "react";
import { FolderPlus, Loader2, Images } from "lucide-react";
import GallerySectionCard, { type AdminGallerySection } from "@/components/admin/GallerySectionCard";

const inputClass =
    "w-full rounded-md border-2 border-slate-200 bg-white px-4 py-3 font-semibold text-slate-900 focus:border-primary focus:outline-none";

/**
 * Admin → Photo Gallery: create headings (sections) such as "Annual Day 2026", then add several photos and
 * videos to each. The website shows each heading followed by its photos / videos, in this order.
 */
export default function AdminGallery() {
    const [sections, setSections] = useState<AdminGallerySection[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState("");

    const load = useCallback(async () => {
        try {
            const res = await fetch("/api/admin/gallery-sections");
            if (!res.ok) throw new Error();
            setSections(await res.json());
            setLoadError("");
        } catch {
            setLoadError("Couldn't load the gallery. Refresh the page to try again.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const createSection = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreateError("");
        if (!title.trim()) return setCreateError("Please enter a heading.");
        setCreating(true);
        try {
            const res = await fetch("/api/admin/gallery-sections", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, description }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || "Couldn't create the section.");
            setTitle("");
            setDescription("");
            await load();
        } catch (err) {
            setCreateError(err instanceof Error ? err.message : "Couldn't create the section.");
        } finally {
            setCreating(false);
        }
    };

    // Swap a section with its neighbour, then save the new positions (0, 1, 2, …).
    const moveSection = async (index: number, direction: -1 | 1) => {
        const target = index + direction;
        if (target < 0 || target >= sections.length) return;
        const reordered = [...sections];
        [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
        setSections(reordered);
        const changed = reordered.map((s, i) => ({ s, i })).filter(({ s, i }) => s.order !== i);
        await Promise.all(
            changed.map(({ s, i }) =>
                fetch(`/api/admin/gallery-sections/${s._id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ order: i }),
                })
            )
        ).catch(() => null);
        load();
    };

    const totalItems = sections.reduce((n, s) => n + s.items.length, 0);

    return (
        <div className="space-y-8 pb-20">
            <div>
                <h1 className="mb-2 text-3xl font-extrabold tracking-tight text-ink">Photo Gallery</h1>
                <p className="font-medium text-slate-600">
                    Create a heading for each event or collection, then add its photos and videos. The website shows them in this order.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                {/* New section */}
                <div className="lg:col-span-1">
                    <form onSubmit={createSection} className="space-y-4 rounded-lg border border-slate-200 bg-white p-6 lg:sticky lg:top-10">
                        <div className="flex items-center gap-3 border-b border-slate-100 pb-4 text-slate-800">
                            <div className="icon-tile h-10 w-10">
                                <FolderPlus size={20} />
                            </div>
                            <h3 className="text-xl font-bold">New Section</h3>
                        </div>
                        <div className="space-y-1.5">
                            <label htmlFor="section-title" className="pl-1 text-xs font-bold uppercase tracking-widest text-slate-500">Heading</label>
                            <input
                                id="section-title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                maxLength={120}
                                placeholder="e.g. Annual Day 2026"
                                className={inputClass}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label htmlFor="section-description" className="pl-1 text-xs font-bold uppercase tracking-widest text-slate-500">
                                Description <span className="font-medium normal-case tracking-normal text-slate-400">(optional)</span>
                            </label>
                            <textarea
                                id="section-description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                maxLength={500}
                                rows={3}
                                placeholder="A line about this event or collection"
                                className={`${inputClass} resize-y font-medium`}
                            />
                        </div>
                        {createError && <p className="pl-1 text-sm font-bold text-rose-600">{createError}</p>}
                        <button
                            type="submit"
                            disabled={creating}
                            className="flex w-full items-center justify-center gap-2 rounded-md bg-primary py-3.5 font-bold text-white transition-colors hover:bg-primary-dark disabled:opacity-50"
                        >
                            {creating ? <Loader2 className="animate-spin" size={18} /> : "Create Section"}
                        </button>
                        <p className="text-xs text-slate-500">
                            After creating it, add photos and videos to it on the right.
                        </p>
                    </form>
                </div>

                {/* Sections */}
                <div className="space-y-6 lg:col-span-2">
                    {loading ? (
                        <div className="flex justify-center p-20">
                            <Loader2 className="animate-spin text-primary" size={40} />
                        </div>
                    ) : loadError ? (
                        <p className="font-bold text-rose-600">{loadError}</p>
                    ) : sections.length === 0 ? (
                        <div className="rounded-lg border border-slate-200 bg-white p-16 text-center">
                            <Images size={40} className="mx-auto text-slate-300" />
                            <h3 className="mt-4 text-xl font-bold text-slate-800">No sections yet</h3>
                            <p className="mt-1 text-slate-500">Create your first heading, e.g. &quot;Annual Day 2026&quot;.</p>
                        </div>
                    ) : (
                        <>
                            <p className="text-sm font-semibold text-slate-500">
                                {sections.length} section{sections.length === 1 ? "" : "s"} · {totalItems} item{totalItems === 1 ? "" : "s"}
                            </p>
                            {sections.map((section, i) => (
                                <GallerySectionCard
                                    key={section._id}
                                    section={section}
                                    isFirst={i === 0}
                                    isLast={i === sections.length - 1}
                                    onMove={(direction) => moveSection(i, direction)}
                                    onChanged={load}
                                    onDeleted={load}
                                />
                            ))}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
