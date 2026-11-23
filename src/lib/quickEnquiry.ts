// Shared by the hero / popup enquiry form (browser) and /api/hero-enquiries (server).
import { EMAIL_RE } from "@/lib/contact";

export type QuickEnquirySource = "hero" | "popup";

export interface QuickEnquiryInput {
    name: string;
    email: string;
    phone: string;
    course: string;
    session: string;
}

export const EMPTY_QUICK_ENQUIRY: QuickEnquiryInput = { name: "", email: "", phone: "", course: "", session: "" };

export const QUICK_ENQUIRY_FIELDS: {
    key: keyof QuickEnquiryInput;
    label: string;
    type: "text" | "email" | "tel";
    placeholder: string;
    autoComplete: string;
}[] = [
    { key: "name", label: "Name", type: "text", placeholder: "Your full name", autoComplete: "name" },
    { key: "email", label: "Email ID", type: "email", placeholder: "you@example.com", autoComplete: "email" },
    { key: "phone", label: "Number", type: "tel", placeholder: "+91 98765 43210", autoComplete: "tel" },
    { key: "course", label: "Interested Course", type: "text", placeholder: "e.g. MBA, B.Com", autoComplete: "off" },
    { key: "session", label: "Interested Session", type: "text", placeholder: "e.g. 2026 batch, weekend", autoComplete: "off" },
];

const MAX_LENGTH = 200;
const PHONE_RE = /^\+?[\d\s()-]{7,20}$/;

/** Returns a user-facing error message, or null when the input is valid. */
export function validateQuickEnquiry(input: QuickEnquiryInput): string | null {
    for (const { key, label } of QUICK_ENQUIRY_FIELDS) {
        const value = input[key].trim();
        if (!value) return `Please enter your ${label.toLowerCase()}.`;
        if (value.length > MAX_LENGTH) return `${label} is too long.`;
    }
    if (!EMAIL_RE.test(input.email.trim())) return "Please enter a valid email ID.";
    if (!PHONE_RE.test(input.phone.trim())) return "Please enter a valid phone number.";
    return null;
}
