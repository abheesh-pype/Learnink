import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { GallerySection } from "@/lib/models";
import { loadGallerySections, MAX_DESCRIPTION, MAX_TITLE } from "@/lib/gallery";
import { refreshPublicPages } from "@/lib/revalidate";

// Admin: every section (including empty ones) with its photos / videos.
export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    try {
        return NextResponse.json(await loadGallerySections({ includeEmpty: true }));
    } catch (e) {
        console.error("Failed to load gallery sections", e);
        return NextResponse.json({ error: "Failed to load gallery" }, { status: 500 });
    }
}

// Admin: create a section (heading).
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await req.json();
        const title = typeof body.title === "string" ? body.title.trim() : "";
        const description = typeof body.description === "string" ? body.description.trim() : "";
        if (!title) return NextResponse.json({ error: "Please enter a heading." }, { status: 400 });
        if (title.length > MAX_TITLE) return NextResponse.json({ error: `Heading must be ${MAX_TITLE} characters or fewer.` }, { status: 400 });
        if (description.length > MAX_DESCRIPTION) return NextResponse.json({ error: `Description must be ${MAX_DESCRIPTION} characters or fewer.` }, { status: 400 });

        await dbConnect();
        // New sections go to the end.
        const last = await GallerySection.findOne({}).sort({ order: -1 }).lean();
        const section = await GallerySection.create({ title, description, order: (last?.order ?? -1) + 1 });
        refreshPublicPages();
        return NextResponse.json({ ...section, items: [] }, { status: 201 });
    } catch (e) {
        console.error("Failed to create gallery section", e);
        return NextResponse.json({ error: "Failed to create section" }, { status: 500 });
    }
}
