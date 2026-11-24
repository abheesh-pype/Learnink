"use client";

import { useId, useState } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { EMAIL_RE } from "@/lib/contact";

/**
 * Enquiry form shown under each blog article. Saved like the Contact page form, so it appears in
 * Admin → Enquiries → Contact Page (with the article title in the message).
 */
export default function BlogEnquiryForm({ postTitle }: { postTitle: string }) {
    const id = useId();
    const [form, setForm] = useState({ name: "", email: "", phone: "", qualification: "", course: "", note: "" });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [done, setDone] = useState(false);

    const set = (key: keyof typeof form, value: string) => setForm((f) => ({ ...f, [key]: value }));

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (!form.name.trim()) return setError("Please enter your name.");
        if (!EMAIL_RE.test(form.email.trim())) return setError("Please enter a valid email.");
        if (form.phone.replace(/\D/g, "").length < 7) return setError("Please enter your WhatsApp number.");

        setSubmitting(true);
        try {
            const message = [
                `From blog: ${postTitle}`,
                form.qualification.trim() && `Previous qualification: ${form.qualification.trim()}`,
                form.note.trim() && `Note: ${form.note.trim()}`,
            ]
                .filter(Boolean)
                .join("\n");
            const res = await fetch("/api/enquiries", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: form.name.trim(),
                    email: form.email.trim(),
                    phone: form.phone.trim(),
                    interest: form.course.trim(),
                    message,
                }),
            });
            if (!res.ok) throw new Error();
            setDone(true);
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const field = "w-full rounded-sm border border-white/20 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-white/60";
    const label = "mb-1.5 block text-sm font-semibold text-white";

    if (done) {
        return (
            <div className="rounded-md bg-primary-darker p-8 text-center text-white" role="status">
                <CheckCircle2 size={40} strokeWidth={1.5} className="mx-auto" />
                <p className="mt-3 font-display text-3xl font-semibold">Thank you!</p>
                <p className="mt-1 text-white/80">We&apos;ve received your enquiry. Our counsellor will contact you shortly.</p>
            </div>
        );
    }

    return (
        <form onSubmit={submit} noValidate className="space-y-4 rounded-md bg-primary-darker p-6 sm:p-8">
            <div>
                <p className="font-display text-3xl font-semibold text-white">Interested? Talk to a counsellor</p>
                <p className="mt-1 text-sm text-white/70">Leave your details and we&apos;ll get back to you.</p>
            </div>
            <div>
                <label htmlFor={`${id}-name`} className={label}>Name</label>
                <input id={`${id}-name`} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Name" autoComplete="name" maxLength={120} className={field} />
            </div>
            <div>
                <label htmlFor={`${id}-email`} className={label}>Email</label>
                <input id={`${id}-email`} type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="Email" autoComplete="email" maxLength={200} className={field} />
            </div>
            <div>
                <label htmlFor={`${id}-phone`} className={label}>WhatsApp Number</label>
                <input id={`${id}-phone`} type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="WhatsApp Number" autoComplete="tel" maxLength={20} className={field} />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                    <label htmlFor={`${id}-qual`} className={label}>Previous Qualification</label>
                    <input id={`${id}-qual`} value={form.qualification} onChange={(e) => set("qualification", e.target.value)} placeholder="e.g. Plus Two, Diploma, B.Com" maxLength={120} className={field} />
                </div>
                <div>
                    <label htmlFor={`${id}-course`} className={label}>Interested Course</label>
                    <input id={`${id}-course`} value={form.course} onChange={(e) => set("course", e.target.value)} placeholder="e.g. MBA, BBA, Online Degree" maxLength={120} className={field} />
                </div>
            </div>
            <div>
                <label htmlFor={`${id}-note`} className={label}>Note</label>
                <textarea id={`${id}-note`} value={form.note} onChange={(e) => set("note", e.target.value)} rows={3} maxLength={1000} className={`${field} resize-y`} />
            </div>
            {error && <p className="text-sm font-semibold text-rose-300" role="alert">{error}</p>}
            <div className="text-center">
                <button type="submit" disabled={submitting} className="btn-light px-8">
                    {submitting ? <Loader2 size={18} className="animate-spin" /> : <>Submit <Send size={16} /></>}
                </button>
            </div>
        </form>
    );
}
