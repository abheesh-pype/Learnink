"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Phone, Mail, MapPin, Building2, GraduationCap, BarChart3, Save, Loader2, ExternalLink, CheckCircle2, Plus, Trash2 } from "lucide-react";
import { DEFAULT_CONTACT, EMAIL_RE, MAX_EXTRAS_PER_TYPE, type ContactExtras, type ContactInfo, type ContactTextField } from "@/lib/contact";

type Field = {
    key: ContactTextField;
    label: string;
    placeholder?: string;
    hint?: string;
    type?: "text" | "email" | "tel" | "url";
    multiline?: boolean;
    required?: boolean;
};

type ExtraType = keyof ContactExtras;

/** "+ Add another …" entries for a section; each becomes its own card on the Contact page. */
type ExtraConfig = {
    type: ExtraType;
    itemLabel: string; // "Phone", "Email", …
    fields: { key: string; label: string; type?: "text" | "email" | "tel" | "url"; placeholder?: string; multiline?: boolean; main?: boolean }[];
};

// Each section matches a card on the public Contact page.
const SECTIONS: { title: string; description: string; icon: typeof Phone; fields: Field[]; extra?: ExtraConfig }[] = [
    {
        title: "Call Us",
        description: "Phone card. Visitors can tap the number to call.",
        icon: Phone,
        fields: [
            { key: "phone", label: "Phone Number", type: "tel", placeholder: DEFAULT_CONTACT.phone, required: true },
            { key: "phoneHours", label: "Calling Hours", placeholder: DEFAULT_CONTACT.phoneHours },
        ],
        extra: {
            type: "phones",
            itemLabel: "Phone",
            fields: [
                { key: "phone", label: "Phone Number", type: "tel", placeholder: "+91 90000 00000", main: true },
                { key: "note", label: "Note Under Title", placeholder: "e.g. Admissions desk, Mon-Fri" },
            ],
        },
    },
    {
        title: "Email Us",
        description: "Email card. Also used on the Privacy Policy and Terms pages.",
        icon: Mail,
        fields: [
            { key: "email", label: "Email Address", type: "email", placeholder: DEFAULT_CONTACT.email, required: true },
            { key: "emailNote", label: "Note Under Title", placeholder: DEFAULT_CONTACT.emailNote },
        ],
        extra: {
            type: "emails",
            itemLabel: "Email",
            fields: [
                { key: "email", label: "Email Address", type: "email", placeholder: "admissions@example.com", main: true },
                { key: "note", label: "Note Under Title", placeholder: "e.g. Admissions team" },
            ],
        },
    },
    {
        title: "Visit Us",
        description: "Location card. Clicking it opens the map.",
        icon: MapPin,
        fields: [
            { key: "visitLocation", label: "Location", placeholder: DEFAULT_CONTACT.visitLocation },
            { key: "visitNote", label: "Note Under Title", placeholder: DEFAULT_CONTACT.visitNote },
            {
                key: "mapUrl", label: "Google Maps Link (optional)", type: "url", placeholder: "https://maps.app.goo.gl/...",
                hint: "Leave empty to search Google Maps for the headquarters address.",
            },
        ],
        extra: {
            type: "locations",
            itemLabel: "Location (white card)",
            fields: [
                { key: "location", label: "Location", placeholder: "e.g. Kochi, Kerala", main: true },
                { key: "note", label: "Note Under Title", placeholder: "e.g. Branch Office" },
                { key: "mapUrl", label: "Google Maps Link (optional)", type: "url", placeholder: "https://maps.app.goo.gl/..." },
            ],
        },
    },
    {
        title: "Headquarters",
        description: "Dark address card.",
        icon: Building2,
        fields: [
            { key: "hqName", label: "Office Name", placeholder: DEFAULT_CONTACT.hqName },
            { key: "hqAddress", label: "Address", placeholder: DEFAULT_CONTACT.hqAddress, multiline: true, hint: "Press Enter for a new line." },
            { key: "hqHours", label: "Office Hours", placeholder: DEFAULT_CONTACT.hqHours },
        ],
        extra: {
            type: "offices",
            itemLabel: "Office (dark card)",
            fields: [
                { key: "name", label: "Office Name", placeholder: "e.g. Learnink Kochi Centre", main: true },
                { key: "address", label: "Address", placeholder: "Street, City - PIN", multiline: true },
                { key: "hours", label: "Office Hours", placeholder: "Mon - Sat: 9am - 6pm" },
            ],
        },
    },
    {
        title: "Admissions",
        description: "Green admissions card.",
        icon: GraduationCap,
        fields: [
            { key: "admissionsTitle", label: "Heading", placeholder: DEFAULT_CONTACT.admissionsTitle },
            { key: "admissionsText", label: "Text", placeholder: DEFAULT_CONTACT.admissionsText },
        ],
    },
    {
        title: "Numbers",
        description: "Contact page stat cards, homepage stats and the About section's experience badge.",
        icon: BarChart3,
        fields: [
            { key: "studentsCount", label: "Students", placeholder: DEFAULT_CONTACT.studentsCount, hint: "Contact page + homepage" },
            { key: "universitiesCount", label: "Universities", placeholder: DEFAULT_CONTACT.universitiesCount, hint: "Contact page + homepage" },
            { key: "coursesCount", label: "Courses Offered", placeholder: DEFAULT_CONTACT.coursesCount, hint: "Homepage" },
            { key: "yearsCount", label: "Years of Experience", placeholder: DEFAULT_CONTACT.yearsCount, hint: "Homepage + About section (\"10+ Years\")" },
        ],
    },
];

const inputClass =
    "w-full px-4 py-3.5 rounded-xl bg-white border-2 border-slate-200 focus:outline-none focus:border-violet focus:ring-4 focus:ring-violet/15 transition-all text-slate-900 font-bold";

export default function AdminContact() {
    const [form, setForm] = useState<ContactInfo>(DEFAULT_CONTACT);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [savedAt, setSavedAt] = useState<Date | null>(null);

    useEffect(() => {
        fetch("/api/admin/contact")
            .then((res) => (res.ok ? res.json() : Promise.reject()))
            .then((data: ContactInfo) => setForm(data))
            .catch(() => setError("Couldn't load the saved contact details. Showing the defaults."))
            .finally(() => setLoading(false));
    }, []);

    const update = (key: ContactTextField, value: string) => {
        setForm((prev) => ({ ...prev, [key]: value }));
        setSavedAt(null);
    };

    // --- Additional entries ---
    const setExtras = (type: ExtraType, change: (list: Record<string, string>[]) => Record<string, string>[]) => {
        setForm((prev) => ({
            ...prev,
            extras: { ...prev.extras, [type]: change(prev.extras[type] as unknown as Record<string, string>[]) },
        }));
        setSavedAt(null);
    };
    const addExtra = (config: ExtraConfig) =>
        setExtras(config.type, (list) => [...list, Object.fromEntries(config.fields.map((f) => [f.key, ""]))]);
    const removeExtra = (type: ExtraType, index: number) => setExtras(type, (list) => list.filter((_, i) => i !== index));
    const updateExtra = (type: ExtraType, index: number, key: string, value: string) =>
        setExtras(type, (list) => list.map((item, i) => (i === index ? { ...item, [key]: value } : item)));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (!EMAIL_RE.test(form.email.trim())) {
            setError("Please enter a valid email address.");
            return;
        }

        setSaving(true);
        try {
            const res = await fetch("/api/admin/contact", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to save.");
            setForm(data);
            setSavedAt(new Date());
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to save.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-primary" size={40} /></div>;
    }

    return (
        <form onSubmit={handleSubmit} className="max-w-5xl mx-auto animate-[fade-in_0.5s_ease-out_forwards] space-y-8 pb-28">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-ink mb-2">Contact Details</h1>
                    <p className="text-slate-600 font-medium">Phone, email and address shown on the website&apos;s Contact page.</p>
                </div>
                <Link
                    href="/contact"
                    target="_blank"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-bold text-slate-700 hover:border-primary hover:text-primary transition-all self-start sm:self-auto"
                >
                    View Contact Page <ExternalLink size={16} />
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {SECTIONS.map(({ title, description, icon: Icon, fields, extra }) => (
                    <section key={title} className="bg-white p-6 lg:p-8 rounded-lg border border-slate-200 shadow-sm space-y-5">
                        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                            <div className="icon-tile w-10 h-10">
                                <Icon size={20} />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-800">{title}</h2>
                                <p className="text-xs text-slate-500">{description}</p>
                            </div>
                        </div>

                        {fields.map((field) => {
                            const id = `contact-${field.key}`;
                            return (
                                <div key={field.key} className="space-y-2">
                                    <label htmlFor={id} className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">
                                        {field.label}
                                        {field.required && <span className="text-rose-500"> *</span>}
                                    </label>
                                    {field.multiline ? (
                                        <textarea
                                            id={id}
                                            value={form[field.key]}
                                            onChange={(e) => update(field.key, e.target.value)}
                                            placeholder={field.placeholder}
                                            rows={3}
                                            maxLength={300}
                                            className={`${inputClass} resize-y`}
                                        />
                                    ) : (
                                        <input
                                            id={id}
                                            type={field.type ?? "text"}
                                            value={form[field.key]}
                                            onChange={(e) => update(field.key, e.target.value)}
                                            placeholder={field.placeholder}
                                            required={field.required}
                                            maxLength={300}
                                            className={inputClass}
                                        />
                                    )}
                                    {field.hint && <p className="text-xs text-slate-500 pl-1">{field.hint}</p>}
                                </div>
                            );
                        })}

                        {extra && (
                            <ExtraEntries
                                config={extra}
                                items={form.extras[extra.type] as unknown as Record<string, string>[]}
                                onAdd={() => addExtra(extra)}
                                onRemove={(i) => removeExtra(extra.type, i)}
                                onChange={(i, key, value) => updateExtra(extra.type, i, key, value)}
                            />
                        )}
                    </section>
                ))}
            </div>

            <p className="text-sm text-slate-500">
                Fields left empty show their default text (shown in grey) on the website.
            </p>

            {/* Sticky save bar */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 lg:left-[calc(50%+9rem)] z-20 w-[calc(100%-2rem)] max-w-xl">
                <div className="bg-white/90 backdrop-blur-md p-3 rounded-lg border border-slate-200 shadow-sm flex items-center gap-3">
                    <div className="flex-1 min-w-0 text-sm font-bold pl-2" aria-live="polite">
                        {error ? (
                            <span className="text-rose-600">{error}</span>
                        ) : savedAt ? (
                            <span className="text-emerald-600 inline-flex items-center gap-1.5">
                                <CheckCircle2 size={16} /> Saved. The Contact page is updated.
                            </span>
                        ) : (
                            <span className="text-slate-400">Changes appear on the website after saving.</span>
                        )}
                    </div>
                    <button
                        type="submit"
                        disabled={saving}
                        className="shrink-0 bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl font-bold hover:shadow-sm transition-all flex items-center gap-2 shadow-lg disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        Save
                    </button>
                </div>
            </div>
        </form>
    );
}

/** List of additional entries for one section, with "+ Add another" and delete buttons. */
function ExtraEntries({
    config, items, onAdd, onRemove, onChange,
}: {
    config: ExtraConfig;
    items: Record<string, string>[];
    onAdd: () => void;
    onRemove: (index: number) => void;
    onChange: (index: number, key: string, value: string) => void;
}) {
    const full = items.length >= MAX_EXTRAS_PER_TYPE;
    return (
        <div className="space-y-4 border-t border-dashed border-slate-200 pt-5">
            {items.map((item, i) => (
                <div key={i} className="space-y-3 rounded-md border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-bold uppercase tracking-widest text-primary">
                            Additional {config.itemLabel} #{i + 1}
                        </p>
                        <button
                            type="button"
                            onClick={() => onRemove(i)}
                            className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-bold text-rose-600 transition-colors hover:bg-rose-50"
                            aria-label={`Delete additional ${config.itemLabel.toLowerCase()} #${i + 1}`}
                        >
                            <Trash2 size={14} /> Delete
                        </button>
                    </div>
                    {config.fields.map((field) => {
                        const id = `extra-${config.type}-${i}-${field.key}`;
                        const common = {
                            id,
                            value: item[field.key] ?? "",
                            placeholder: field.placeholder,
                            maxLength: 300,
                        };
                        return (
                            <div key={field.key} className="space-y-1.5">
                                <label htmlFor={id} className="pl-1 text-xs font-bold uppercase tracking-widest text-slate-500">
                                    {field.label}
                                    {field.main && <span className="text-rose-500"> *</span>}
                                </label>
                                {field.multiline ? (
                                    <textarea {...common} rows={2} onChange={(e) => onChange(i, field.key, e.target.value)} className={`${inputClass} resize-y`} />
                                ) : (
                                    <input {...common} type={field.type ?? "text"} onChange={(e) => onChange(i, field.key, e.target.value)} className={inputClass} />
                                )}
                            </div>
                        );
                    })}
                    <p className="pl-1 text-xs text-slate-500">Shown as its own card on the Contact page. Leave the starred field empty to skip it.</p>
                </div>
            ))}
            <button
                type="button"
                onClick={onAdd}
                disabled={full}
                className="inline-flex w-full items-center justify-center gap-2 rounded-md border-2 border-dashed border-slate-300 py-3 text-sm font-bold text-slate-600 transition-colors hover:border-primary hover:text-primary disabled:opacity-50"
            >
                <Plus size={16} /> {full ? `Maximum ${MAX_EXTRAS_PER_TYPE} reached` : `Add another ${config.itemLabel.toLowerCase()}`}
            </button>
        </div>
    );
}
