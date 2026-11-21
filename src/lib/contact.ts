/** Contact details shown on the Contact page, edited in Admin → Contact. Safe to import on client and server. */
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
}

export const CONTACT_FIELDS = [
    "phone", "phoneHours", "email", "emailNote", "visitLocation", "visitNote", "mapUrl",
    "hqName", "hqAddress", "hqHours", "admissionsTitle", "admissionsText", "studentsCount", "universitiesCount", "coursesCount", "yearsCount",
] as const satisfies readonly (keyof ContactInfo)[];

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
};

/** Fills any empty field with its default, so the page never shows a blank card. */
export function withContactDefaults(saved: Partial<Record<keyof ContactInfo, unknown>> | null | undefined): ContactInfo {
    const out = { ...DEFAULT_CONTACT };
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
