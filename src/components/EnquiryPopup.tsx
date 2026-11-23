"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import QuickEnquiryForm, { ENQUIRY_SUBMITTED_KEY } from "@/components/QuickEnquiryForm";

const OPEN_AFTER_MS = 10_000;

function alreadySubmitted() {
    try {
        return localStorage.getItem(ENQUIRY_SUBMITTED_KEY) === "1";
    } catch {
        return false;
    }
}

/** Enquiry form popup that opens 10 seconds after the page loads (skipped once the visitor has enquired). */
export default function EnquiryPopup() {
    const [open, setOpen] = useState(false);
    const closeRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (alreadySubmitted()) return;
        let timer: ReturnType<typeof setTimeout>;
        const tryOpen = () => {
            if (alreadySubmitted()) return;
            // Don't interrupt someone who is typing in a form (e.g. the hero form): try again shortly.
            const el = document.activeElement;
            if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) {
                timer = setTimeout(tryOpen, 5_000);
                return;
            }
            setOpen(true);
        };
        timer = setTimeout(tryOpen, OPEN_AFTER_MS);
        return () => clearTimeout(timer);
    }, []);

    // While open: Escape closes, page doesn't scroll, focus starts on the close button.
    useEffect(() => {
        if (!open) return;
        const previous = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        closeRef.current?.focus();
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
        window.addEventListener("keydown", onKey);
        return () => {
            document.body.style.overflow = previous;
            window.removeEventListener("keydown", onKey);
        };
    }, [open]);

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    className="fixed inset-0 z-[70] flex items-center justify-center bg-primary-darker/60 p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setOpen(false)}
                >
                    <motion.div
                        role="dialog"
                        aria-modal="true"
                        aria-label="Enquiry form"
                        className="relative max-h-[calc(100svh-2rem)] w-full max-w-md overflow-y-auto rounded-lg bg-white p-6 shadow-2xl sm:p-8"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 16 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            ref={closeRef}
                            type="button"
                            onClick={() => setOpen(false)}
                            className="absolute right-3 top-3 rounded-md p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                            aria-label="Close enquiry form"
                        >
                            <X size={20} />
                        </button>
                        <QuickEnquiryForm
                            source="popup"
                            title="Find Your Program"
                            subtitle="Tell us what you'd like to study and our counsellor will call you back."
                            onSubmitted={() => setTimeout(() => setOpen(false), 2500)}
                        />
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
