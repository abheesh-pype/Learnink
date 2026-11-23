"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import GalleryMedia from "@/components/GalleryMedia";
import { isEmbeddedVideo } from "@/lib/videoUrl";
import type { GallerySection } from "@/components/Gallery";

// --- Collage -------------------------------------------------------------------------------------------
// Justified rows (like Google Photos): every item keeps its own shape (portrait narrow, landscape wide),
// each row is scaled so it fills the full width exactly, and rows aim for a target height, which acts as
// the maximum size of the tiles. Nothing is cropped and there are no blank bars.

const DEFAULT_RATIO = 4 / 3; // until a photo / video has loaded and reported its real size
const EMBED_RATIO = 16 / 9; // YouTube / Drive players

/** Target row height and gap for the current gallery width. */
function rowSettings(width: number) {
    if (width < 640) return { target: 170, gap: 8, minPerRow: 2 }; // phones: 4 per row would be too small
    if (width < 1024) return { target: 210, gap: 12, minPerRow: 4 };
    return { target: 260, gap: 16, minPerRow: 4 };
}

interface Row<T> {
    items: T[];
    height: number;
    full: boolean; // full rows stretch edge to edge; the last row keeps the target height
}

/**
 * Splits items (with width ÷ height ratios) into rows whose height is as close to `target` as possible,
 * with at least `minPerRow` items in every row (when there are that many left).
 */
function buildRows<T extends { ratio: number }>(items: T[], width: number, target: number, gap: number, minPerRow: number): Row<T>[] {
    const rows: Row<T>[] = [];
    let current: T[] = [];
    let sum = 0;

    const heightFor = (ratioSum: number, count: number) => (width - gap * (count - 1)) / ratioSum;

    for (const item of items) {
        current.push(item);
        sum += item.ratio;
        const h = heightFor(sum, current.length);
        if (h > target || current.length < minPerRow) continue; // still room, or not enough items yet

        // The row is full. Keep the last item if that lands closer to the target height, else move it down.
        if (current.length - 1 >= minPerRow) {
            const without = heightFor(sum - item.ratio, current.length - 1);
            if (without - target < target - h) {
                rows.push({ items: current.slice(0, -1), height: without, full: true });
                current = [item];
                sum = item.ratio;
                continue;
            }
        }
        rows.push({ items: current, height: h, full: true });
        current = [];
        sum = 0;
    }
    if (current.length) {
        // Last row: normal height, left-aligned, unless its items would be wider than the gallery; then fit it exactly.
        const h = heightFor(sum, current.length);
        rows.push(h < target ? { items: current, height: h, full: true } : { items: current, height: target, full: false });
    }
    return rows;
}

interface GalleryCollageProps {
    section: GallerySection;
    /** Show only this many rows (the homepage shows 1). */
    maxRows?: number;
}

export default function GalleryCollage({ section, maxRows }: GalleryCollageProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [width, setWidth] = useState(0);
    // Real width ÷ height of each item, measured in the browser once it loads.
    const [ratios, setRatios] = useState<Record<string, number>>({});

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const observer = new ResizeObserver(([entry]) => setWidth(Math.floor(entry.contentRect.width)));
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    const setRatio = (id: string, w: number, h: number) => {
        if (!w || !h) return;
        const r = w / h;
        setRatios((prev) => (Math.abs((prev[id] ?? 0) - r) < 0.001 ? prev : { ...prev, [id]: r }));
    };

    const items = section.items.map((item) => ({
        item,
        ratio:
            item.mediaType === "video" && isEmbeddedVideo(item.imageUrl)
                ? EMBED_RATIO
                : ratios[item._id] ?? DEFAULT_RATIO,
    }));
    const { target, gap, minPerRow } = rowSettings(width || 1200);
    const allRows = width
        ? buildRows(items, width, target, gap, minPerRow)
        : // Before the width is known (first render): rows of `minPerRow` at the target height.
          Array.from({ length: Math.ceil(items.length / minPerRow) }, (_, i) => ({
              items: items.slice(i * minPerRow, (i + 1) * minPerRow),
              height: target,
              full: false,
          }));
    const rows = maxRows ? allRows.slice(0, maxRows) : allRows;

    let index = 0;
    return (
        <div ref={containerRef} className="mt-6 flex flex-col" style={{ gap }}>
            {rows.map((row, r) => (
                <div key={r} className="flex overflow-hidden" style={{ gap, height: row.height }}>
                    {row.items.map(({ item, ratio }) => {
                        const i = index++;
                        return (
                            <motion.figure
                                key={item._id}
                                initial={{ opacity: 0, y: 16 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-40px" }}
                                transition={{ delay: (i % 6) * 0.06, duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
                                className="group relative min-w-0 overflow-hidden rounded-md bg-primary-100"
                                style={
                                    row.full
                                        ? { flex: `${ratio} 1 0` } // share the row width in proportion to shape
                                        : { flex: "none", width: Math.min(row.height * ratio, width || Infinity) }
                                }
                            >
                                <GalleryMedia
                                    url={item.imageUrl}
                                    mediaType={item.mediaType}
                                    fit="fill"
                                    onSize={(w, h) => setRatio(item._id, w, h)}
                                    className="absolute inset-0 h-full w-full"
                                    alt={item.caption || `${section.title} ${item.mediaType === "video" ? "video" : "photo"}`}
                                />
                                {item.caption && (
                                    // Photos: caption over the bottom. Videos: at the top so it doesn't cover the player controls.
                                    <figcaption
                                        className={
                                            item.mediaType === "video"
                                                ? "pointer-events-none absolute inset-x-0 top-0 bg-gradient-to-b from-primary-darker/80 to-transparent px-4 pb-8 pt-3"
                                                : "pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-primary-darker/90 via-primary-darker/40 to-transparent px-4 pb-4 pt-12"
                                        }
                                    >
                                        <p className="text-sm font-medium text-white">{item.caption}</p>
                                    </figcaption>
                                )}
                            </motion.figure>
                        );
                    })}
                </div>
            ))}
        </div>
    );
}
