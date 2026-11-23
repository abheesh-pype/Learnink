import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { GallerySection } from "@/lib/models";
import { MAX_DESCRIPTION, MAX_TITLE, UUID_RE } from "@/lib/gallery";
import { refreshPublicPages } from "@/lib/revalidate";

// Admin: rename a section, change its description or its position.
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    if (!UUID_RE.test(id)) return NextResponse.json({ error: "Section not found." }, { status: 404 });

    try {
        const body = await req.json();
        const update: Record<string, unknown> = {};
        if (body.title !== undefined) {
            const title = typeof body.title === "string" ? body.title.trim() : "";
            if (!title) return NextResponse.json({ error: "Please enter a heading." }, { status: 400 });
            if (title.length > MAX_TITLE) return NextResponse.json({ error: `Heading must be ${MAX_TITLE} characters or fewer.` }, { status: 400 });
            update.title = title;
        }
        if (body.description !== undefined) {
            const description = typeof body.description === "string" ? body.description.trim() : "";
            if (description.length > MAX_DESCRIPTION) return NextResponse.json({ error: `Description must be ${MAX_DESCRIPTION} characters or fewer.` }, { status: 400 });
            update.description = description;
        }
        if (body.order !== undefined) {
            const order = Number(body.order);
            if (!Number.isFinite(order)) return NextResponse.json({ error: "Invalid position." }, { status: 400 });
            update.order = Math.trunc(order);
        }

        await dbConnect();
        const section = await GallerySection.findByIdAndUpdate(id, update, { new: true });
        if (!section) return NextResponse.json({ error: "Section not found." }, { status: 404 });
        refreshPublicPages();
        return NextResponse.json(section);
    } catch (e) {
        console.error("Failed to update gallery section", e);
        return NextResponse.json({ error: "Failed to update section" }, { status: 500 });
    }
}

// Admin: delete a section and all of its photos / videos.
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    if (!UUID_RE.test(id)) return NextResponse.json({ error: "Section not found." }, { status: 404 });

    try {
        await dbConnect();
        await GallerySection.findByIdAndDelete(id); // items are removed by ON DELETE CASCADE
        refreshPublicPages();
        return NextResponse.json({ message: "Section deleted" });
    } catch (e) {
        console.error("Failed to delete gallery section", e);
        return NextResponse.json({ error: "Failed to delete section" }, { status: 500 });
    }
}
