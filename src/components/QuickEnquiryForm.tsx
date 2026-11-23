"use client";

import { useId, useState } from "react";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    EMPTY_QUICK_ENQUIRY,
    QUICK_ENQUIRY_FIELDS,
    validateQuickEnquiry,
    type QuickEnquiryInput,
    type QuickEnquirySource,
} from "@/lib/quickEnquiry";

/** Set after a successful submit so the 10-second popup doesn't ask again. */
export const ENQUIRY_SUBMITTED_KEY = "learnink-quick-enquiry-submitted";

interface QuickEnquiryFormProps {
    /** Where the form is shown; saved with the enquiry so the admin can see it. */
    source: QuickEnquirySource;
    title?: string;
    subtitle?: string;
    onSubmitted?: () => void;
    className?: string;
}

/** Name, Email ID, Number, Interested Course and Interested Session. Saved to the hero_enquiries table. */
export default function QuickEnquiryForm({
    source,
    title = "Enquire Now",
    subtitle = "Leave your details and our counsellor will call you back.",
    onSubmitted,
    className,
}: QuickEnquiryFormProps) {
    const [form, setForm] = useState<QuickEnquiryInput>(EMPTY_QUICK_ENQUIRY);
    const [website, setWebsite] = useState(""); // hidden spam trap
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [done, setDone] = useState(false);
    const idPrefix = useId();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const problem = validateQuickEnquiry(form);
        if (problem) {
            setError(problem);
            return;
        }
        setError("");
        setSubmitting(true);
        try {
            const res = await fetch("/api/hero-enquiries", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...form, source, website }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || "Something went wrong. Please try again.");
            setDone(true);
            setForm(EMPTY_QUICK_ENQUIRY);
            try {
                localStorage.setItem(ENQUIRY_SUBMITTED_KEY, "1");
            } catch {
                // storage unavailable (private mode): the popup may just ask again
            }
            onSubmitted?.();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (done) {
        return (
            <div className={cn("flex flex-col items-center justify-center py-10 text-center", className)} role="status">
                <CheckCircle2 size={44} strokeWidth={1.5} className="text-primary" />
                <p className="mt-4 font-display text-3xl font-semibold text-ink">Thank you!</p>
                <p className="mt-2 max-w-xs text-sm text-slate-600">
                    We&apos;ve received your enquiry. Our counsellor will contact you shortly.
                </p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} noValidate className={className}>
            <p className="font-display text-3xl font-semibold text-ink">{title}</p>
            <p className="mt-1 text-sm text-slate-600">{subtitle}</p>

            <div className="mt-6 space-y-3.5">
                {QUICK_ENQUIRY_FIELDS.map((field) => {
                    const id = `${idPrefix}-${field.key}`;
                    return (
                        <div key={field.key}>
                            <label htmlFor={id} className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                                {field.label}
                            </label>
                            <input
                                id={id}
                                type={field.type}
                                value={form[field.key]}
                                onChange={(e) => setForm((prev) => ({ ...prev, [field.key]: e.target.value }))}
                                placeholder={field.placeholder}
                                autoComplete={field.autoComplete}
                                maxLength={200}
                                required
                                className="w-full rounded-md border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-slate-400 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
                            />
                        </div>
                    );
                })}

                {/* Spam trap: hidden from people, filled in by bots */}
                <input
                    type="text"
                    name="website"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                    className="absolute -left-[9999px] h-0 w-0 opacity-0"
                />
            </div>

            {error && (
                <p className="mt-3 text-sm font-medium text-rose-600" role="alert">
                    {error}
                </p>
            )}

            <button type="submit" disabled={submitting} className="btn-primary mt-5 w-full py-3">
                {submitting ? <Loader2 size={18} className="animate-spin" /> : <>Submit Enquiry <ArrowRight size={16} /></>}
            </button>
        </form>
    );
}
