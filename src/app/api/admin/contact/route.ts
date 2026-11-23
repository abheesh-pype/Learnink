import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { ContactSettings } from "@/lib/models";
import { CONTACT_FIELDS, EMAIL_RE, normalizeExtras, validateExtras, withContactDefaults, type ContactTextField } from "@/lib/contact";
import { getContactInfo } from "@/lib/contactSettings";
import { refreshPublicPages } from "@/lib/revalidate";

const MAX_LENGTH = 300;

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    return NextResponse.json(await getContactInfo());
}

export async function PUT(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await req.json();

        // Keep only known text fields, trimmed.
        const data = {} as Record<ContactTextField, string>;
        for (const field of CONTACT_FIELDS) {
            const value = body?.[field];
            data[field] = typeof value === "string" ? value.trim() : "";
            if (data[field].length > MAX_LENGTH) {
                return NextResponse.json({ error: `"${field}" is too long (max ${MAX_LENGTH} characters).` }, { status: 400 });
            }
        }

        if (!data.phone || !/\d{6,}/.test(data.phone.replace(/[^\d]/g, ""))) {
            return NextResponse.json({ error: "Please enter a valid phone number." }, { status: 400 });
        }
        if (!EMAIL_RE.test(data.email)) {
            return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
        }
        if (data.mapUrl && !/^https?:\/\//i.test(data.mapUrl)) {
            return NextResponse.json({ error: "The map link must start with https://" }, { status: 400 });
        }

        // Additional phones / emails / locations / offices.
        const extras = normalizeExtras(body?.extras);
        const extrasError = validateExtras(extras);
        if (extrasError) return NextResponse.json({ error: extrasError }, { status: 400 });

        await dbConnect();
        const saved = await ContactSettings.findOneAndUpdate({ key: "contact" }, { ...data, extras }, { upsert: true }).lean();
        refreshPublicPages();
        return NextResponse.json(withContactDefaults(saved));
    } catch (e) {
        console.error("Failed to save contact settings", e);
        return NextResponse.json({ error: "Failed to save contact details." }, { status: 500 });
    }
}
