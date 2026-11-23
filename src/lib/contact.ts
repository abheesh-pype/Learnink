/** Contact details shown on the Contact page, edited in Admin → Contact. Safe to import on client and server. */

// --- Additional entries (Admin → Contact → "+ Add another …") ---------------------------------------------
export interface ExtraPhone { phone: string; note: string }
export interface ExtraEmail { email: string; note: string }
/** Extra white "Visit Us" card. */
export interface ExtraLocation { location: string; note: string; mapUrl: string }
/** Extra dark "Headquarters" card. */
export interface ExtraOffice { name: string; address: string; hours: string }

export interface ContactExtras {
    phones: ExtraPhone[];
    emails: ExtraEmail[];
    locations: ExtraLocation[];
    offices: ExtraOffice[];
}

export const EMPTY_EXTRAS: ContactExtras = { phones: [], emails: [], locations: [], offices: [] };
export const MAX_EXTRAS_PER_TYPE = 10;
const MAX_EXTRA_LENGTH = 300;

const str = (v: unknown) => (typeof v === "string" ? v.trim().slice(0, MAX_EXTRA_LENGTH) : "");
const list = (v: unknown) => (Array.isArray(v) ? v.slice(0, MAX_EXTRAS_PER_TYPE) : []) as Record<string, unknown>[];

/** Cleans saved / submitted extras: known fields only, trimmed, entries with no main value dropped. */
export function normalizeExtras(raw: unknown): ContactExtras {
    const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
    return {
        phones: list(r.phones).map((p) => ({ phone: str(p?.phone), note: str(p?.note) })).filter((p) => p.phone),
        emails: list(r.emails).map((e) => ({ email: str(e?.email), note: str(e?.note) })).filter((e) => e.email),
        locations: list(r.locations)
            .map((l) => ({ location: str(l?.location), note: str(l?.note), mapUrl: str(l?.mapUrl) }))
            .filter((l) => l.location),
        offices: list(r.offices)
            .map((o) => ({ name: str(o?.name), address: str(o?.address), hours: str(o?.hours) }))
            .filter((o) => o.name || o.address),
    };
}

/** Returns a user-facing error for invalid extras, or null when they are fine. */
export function validateExtras(extras: ContactExtras): string | null {
    for (const [i, p] of extras.phones.entries()) {
        if (!/\d{6,}/.test(p.phone.replace(/[^\d]/g, ""))) return `Additional phone #${i + 1} is not a valid number.`;
    }
    for (const [i, e] of extras.emails.entries()) {
        if (!EMAIL_RE.test(e.email)) return `Additional email #${i + 1} is not a valid email address.`;
    }
    for (const [i, l] of extras.locations.entries()) {
        if (l.mapUrl && !/^https?:\/\//i.test(l.mapUrl)) return `The map link for additional location #${i + 1} must start with https://`;
    }
    return null;
}

export interface ContactInfo {
    phone: string;
    phoneHours: string;
    email: string;
    emailNote: string;
    visitLocation: string;
    visitNote: string;
    /** Optional Google Maps link for the "Visit Us" card. */
    mapUrl: string;
    hqName: string;
    /** Multi-line address; each line is shown on its own line. */
    hqAddress: string;
    hqHours: string;
    admissionsTitle: string;
    admissionsText: string;
    // Numbers: shown on the Contact page cards, the homepage stats and the About "years" badge.
    studentsCount: string;
    universitiesCount: string;
    coursesCount: string;
    yearsCount: string;
    /** Additional phones, emails, locations and offices. */
    extras: ContactExtras;
}

/** The single-value text fields (everything except `extras`). */
export type ContactTextField = Exclude<keyof ContactInfo, "extras">;

export const CONTACT_FIELDS = [
    "phone", "phoneHours", "email", "emailNote", "visitLocation", "visitNote", "mapUrl",
    "hqName", "hqAddress", "hqHours", "admissionsTitle", "admissionsText", "studentsCount", "universitiesCount", "coursesCount", "yearsCount",
] as const satisfies readonly ContactTextField[];

/** The values that were hard-coded before; used until the admin saves their own. */
export const DEFAULT_CONTACT: ContactInfo = {
    phone: "+91 98765 43210",
    phoneHours: "Mon-Sat, 9am-6pm",
    email: "learninkclt@gmail.com",
    emailNote: "24/7 Support",
    visitLocation: "Calicut, Kerala",
    visitNote: "Head Office",
    mapUrl: "",
    hqName: "Learnink Education Hub",
    hqAddress: "Calicut, Kerala - 673001",
    hqHours: "Mon - Sat: 9am - 6pm",
    admissionsTitle: "Batch 2026",
    admissionsText: "Applications open for all degree programs.",
    studentsCount: "10K+",
    universitiesCount: "50+",
    coursesCount: "500+",
    yearsCount: "10+",
    extras: EMPTY_EXTRAS,
};

/** Fills any empty field with its default, so the page never shows a blank card. */
export function withContactDefaults(saved: Partial<Record<keyof ContactInfo, unknown>> | null | undefined): ContactInfo {
    const out = { ...DEFAULT_CONTACT, extras: normalizeExtras(saved?.extras) };
    for (const field of CONTACT_FIELDS) {
        const value = saved?.[field];
        if (typeof value === "string" && value.trim()) out[field] = value.trim();
        else if (field === "mapUrl") out[field] = "";
    }
    return out;
}

/** "tel:" link from a display number, e.g. "+91 98765 43210" → "tel:+919876543210". */
export function telHref(phone: string) {
    return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
