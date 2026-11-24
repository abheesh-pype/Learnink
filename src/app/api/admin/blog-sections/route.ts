import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { BlogSection } from "@/lib/models";
import { loadBlog } from "@/lib/blog";
import { BLOG_LIMITS } from "@/lib/blogShared";
import { refreshPublicPages } from "@/lib/revalidate";

// Admin: every heading (including empty ones) with its posts (including drafts), plus posts without a heading.
export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    try {
        const { sections, unsorted } = await loadBlog({ includeDrafts: true, includeEmptySections: true });
        return NextResponse.json({ sections, unsorted });
    } catch (e) {
        console.error("Failed to load blog", e);
        return NextResponse.json({ error: "Failed to load blog" }, { status: 500 });
    }
}

// Admin: create a heading.
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    try {
        const body = await req.json();
        const title = typeof body.title === "string" ? body.title.trim() : "";
        if (!title) return NextResponse.json({ error: "Please enter a heading." }, { status: 400 });
        if (title.length > BLOG_LIMITS.sectionTitle) {
            return NextResponse.json({ error: `Heading must be ${BLOG_LIMITS.sectionTitle} characters or fewer.` }, { status: 400 });
        }
        await dbConnect();
        const last = await BlogSection.findOne({}).sort({ order: -1 }).lean();
        const section = await BlogSection.create({ title, order: (last?.order ?? -1) + 1 });
        refreshPublicPages();
        return NextResponse.json({ ...section, posts: [] }, { status: 201 });
    } catch (e) {
        console.error("Failed to create blog heading", e);
        return NextResponse.json({ error: "Failed to create heading" }, { status: 500 });
    }
}
