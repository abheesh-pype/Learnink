"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";

/**
 * Animates the number inside a display string when it scrolls into view,
 * e.g. "10K+" counts 0 → 10 and keeps the "K+". Strings without a number are shown as-is.
 */
export default function CountUp({ value, duration = 1.6 }: { value: string; duration?: number }) {
    const ref = useRef<HTMLSpanElement>(null);
    const inView = useInView(ref, { once: true, margin: "-40px" });
    const reduceMotion = useReducedMotion();

    const match = value.match(/^(\D*)([\d,]*\.?\d+)(.*)$/);
    const prefix = match?.[1] ?? "";
    const target = match ? parseFloat(match[2].replace(/,/g, "")) : NaN;
    const suffix = match?.[3] ?? "";
    const decimals = match?.[2].includes(".") ? match[2].split(".")[1].length : 0;
    const useCommas = match?.[2].includes(",") ?? false;

    // null = not animated yet → show the real value (so it's never stuck at "0" if the animation can't run).
    const [current, setCurrent] = useState<number | null>(null);

    useEffect(() => {
        if (!inView || Number.isNaN(target) || reduceMotion) return;
        const controls = animate(0, target, {
            duration,
            ease: "easeOut",
            onUpdate: (v) => setCurrent(v),
        });
        return () => controls.stop();
    }, [inView, target, duration, reduceMotion]);

    // No number to animate, reduced-motion visitors, or before the count starts: show the value as written.
    if (Number.isNaN(target) || reduceMotion || current === null) return <span ref={ref}>{value}</span>;

    const shown = current;
    const formatted = useCommas
        ? shown.toLocaleString("en-IN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
        : shown.toFixed(decimals);

    return (
        <span ref={ref} aria-label={value}>
            <span aria-hidden="true">{prefix}{formatted}{suffix}</span>
        </span>
    );
}
