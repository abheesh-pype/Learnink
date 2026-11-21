"use client";

import { motion } from "framer-motion";

interface RevealProps {
    children: React.ReactNode;
    className?: string;
    delay?: number;
    /** Direction the element slides in from. */
    from?: "up" | "left" | "right" | "scale";
}

const offsets = {
    up: { y: 32 },
    left: { x: -40 },
    right: { x: 40 },
    scale: { scale: 0.92 },
};

/** Fades and slides its children in when they scroll into view (once). */
export default function Reveal({ children, className, delay = 0, from = "up" }: RevealProps) {
    return (
        <motion.div
            className={className}
            initial={{ opacity: 0, ...offsets[from] }}
            whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
        >
            {children}
        </motion.div>
    );
}
