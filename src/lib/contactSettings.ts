// Server-side only (reads the database).
import { cache } from "react";
import dbConnect from "@/lib/db";
import { ContactSettings } from "@/lib/models";
import { DEFAULT_CONTACT, withContactDefaults, type ContactInfo } from "@/lib/contact";

/** Contact details for server components. Falls back to defaults if nothing is saved or the DB is unreachable. */
// cache(): the layout and the page both need this; it runs once per request.
export const getContactInfo = cache(async (): Promise<ContactInfo> => {
    try {
        await dbConnect();
        const saved = await ContactSettings.findOne({ key: "contact" }).lean();
        return withContactDefaults(saved);
    } catch (e) {
        console.error("Failed to load contact settings", e);
        return { ...DEFAULT_CONTACT };
    }
});
