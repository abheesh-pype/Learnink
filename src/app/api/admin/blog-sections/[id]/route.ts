import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { BlogSection } from "@/lib/models";
import { UUID_RE } from "@/lib/blog";
import { BLOG_LIMITS } from "@/lib/blogShared";
import { refreshPublicPages } from "@/lib/revalidate";

// Admin: rename a heading or change its position.
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    if (!UUID_RE.test(id)) return NextResponse.json({ error: "Heading not found." }, { status: 404 });

    try {
        const body = await req.json();
        const update: Record<string, unknown> = {};
        if (body.title !== undefined) {
            const title = typeof body.title === "string" ? body.title.trim() : "";
            if (!title) return NextResponse.json({ error: "Please enter a heading." }, { status: 400 });
            if (title.length > BLOG_LIMITS.sectionTitle) {
                return NextResponse.json({ error: `Heading must be ${BLOG_LIMITS.sectionTitle} characters or fewer.` }, { status: 400 });
            }
            update.title = title;
        }
        if (body.order !== undefined) {
            const order = Number(body.order);
            if (!Number.isFinite(order)) return NextResponse.json({ error: "Invalid position." }, { status: 400 });
            update.order = Math.trunc(order);
        }
        await dbConnect();
        const section = await BlogSection.findByIdAndUpdate(id, update, { new: true });
        if (!section) return NextResponse.json({ error: "Heading not found." }, { status: 404 });
        refreshPublicPages();
        return NextResponse.json(section);
    } catch (e) {
        console.error("Failed to update blog heading", e);
        return NextResponse.json({ error: "Failed to update heading" }, { status: 500 });
    }
}

// Admin: delete a heading. Its posts are kept and shown under "More Articles".
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    if (!UUID_RE.test(id)) return NextResponse.json({ error: "Heading not found." }, { status: 404 });
    try {
        await dbConnect();
        await BlogSection.findByIdAndDelete(id);
        refreshPublicPages();
        return NextResponse.json({ message: "Heading deleted" });
    } catch (e) {
        console.error("Failed to delete blog heading", e);
        return NextResponse.json({ error: "Failed to delete heading" }, { status: 500 });
    }
}
