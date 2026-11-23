"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import GalleryCollage from "@/components/GalleryCollage";
import { countLabel, type GallerySection } from "@/components/Gallery";

interface GalleryBrowserProps {
    sections: GallerySection[];
    /** Heading to show first (from /gallery/<id>, e.g. a homepage "Explore More" button); null = All. */
    initialSectionId: string | null;
}

/**
 * Gallery page: filter buttons ("All" + one per heading). "All" shows every heading with all its photos and
 * videos; a heading's button shows only that heading. The address bar follows the filter (/gallery or
 * /gallery/<id>) so a filtered view can be shared or bookmarked.
 */
export default function GalleryBrowser({ sections, initialSectionId }: GalleryBrowserProps) {
    const [selected, setSelected] = useState<string | null>(
        initialSectionId && sections.some((s) => s._id === initialSectionId) ? initialSectionId : null
    );

    const choose = (id: string | null) => {
        setSelected(id);
        window.history.replaceState(null, "", id ? `/gallery/${id}` : "/gallery");
    };

    const visible = selected ? sections.filter((s) => s._id === selected) : sections;
    const totalItems = sections.reduce((n, s) => n + s.items.length, 0);

    if (sections.length === 0) {
        return (
            <div className="card px-8 py-16 text-center">
                <h2 className="text-2xl font-bold text-ink">Gallery Coming Soon</h2>
                <p className="mt-2 text-slate-500">Photos and videos will appear here soon.</p>
            </div>
        );
    }

    return (
        <div>
            {/* Filters */}
            <div className="flex flex-wrap justify-center gap-2" role="tablist" aria-label="Filter gallery by heading">
                <FilterButton active={selected === null} onClick={() => choose(null)} label="All" count={totalItems} />
                {sections.map((s) => (
                    <FilterButton key={s._id} active={selected === s._id} onClick={() => choose(s._id)} label={s.title} count={s.items.length} />
                ))}
            </div>

            <div className="mt-10 space-y-16 lg:mt-12 lg:space-y-20">
                {visible.map((section) => (
                    <section key={section._id} aria-labelledby={`gallery-${section._id}`}>
                        <div className="flex flex-col gap-2 border-b border-primary-200 pb-4 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <h2 id={`gallery-${section._id}`} className="font-display text-3xl font-semibold text-ink sm:text-4xl">
                                    {section.title}
                                </h2>
                                {section.description && (
                                    <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-slate-600">{section.description}</p>
                                )}
                            </div>
                            <p className="shrink-0 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{countLabel(section.items)}</p>
                        </div>
                        {/* Every photo and video of the heading (no row limit) */}
                        <GalleryCollage key={section._id} section={section} />
                    </section>
                ))}
            </div>
        </div>
    );
}

function FilterButton({ active, onClick, label, count }: { active: boolean; onClick: () => void; label: string; count: number }) {
    return (
        <button
            type="button"
            role="tab"
            aria-selected={active}
            onClick={onClick}
            className={cn(
                "inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                active ? "border-primary bg-primary text-white" : "border-slate-300 bg-white text-slate-700 hover:border-primary hover:text-primary"
            )}
        >
            {label}
            <span className={cn("text-xs font-medium", active ? "text-white/70" : "text-slate-400")}>{count}</span>
        </button>
    );
}
