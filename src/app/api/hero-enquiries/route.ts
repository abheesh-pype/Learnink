import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { HeroEnquiry } from "@/lib/models";
import { validateQuickEnquiry, type QuickEnquiryInput } from "@/lib/quickEnquiry";

// Admin: list quick enquiries (hero form + popup), newest first.
export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        await dbConnect();
        const enquiries = await HeroEnquiry.find({}).sort({ createdAt: -1 }).lean();
        return NextResponse.json(JSON.parse(JSON.stringify(enquiries)));
    } catch (e) {
        console.error("Failed to fetch quick enquiries", e);
        return NextResponse.json({ error: "Failed to fetch enquiries" }, { status: 500 });
    }
}

// Public: submit the hero / popup enquiry form.
export async function POST(req: Request) {
    let body: Record<string, unknown>;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    // Hidden "website" field: real visitors leave it empty, spam bots fill it in.
    if (typeof body.website === "string" && body.website.trim()) {
        return NextResponse.json({ ok: true }, { status: 201 });
    }

    // Only accept the known fields, as trimmed strings.
    const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
    const input: QuickEnquiryInput = {
        name: str(body.name),
        email: str(body.email),
        phone: str(body.phone),
        course: str(body.course),
        session: str(body.session),
    };
    const error = validateQuickEnquiry(input);
    if (error) return NextResponse.json({ error }, { status: 400 });

    const source = body.source === "popup" ? "popup" : "hero";

    try {
        await dbConnect();
        await HeroEnquiry.create({ ...input, source, status: "new" });
        return NextResponse.json({ ok: true }, { status: 201 });
    } catch (e) {
        console.error("Failed to save quick enquiry", e);
        return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
    }
}
