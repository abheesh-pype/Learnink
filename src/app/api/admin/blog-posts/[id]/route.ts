import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { BlogPost } from "@/lib/models";
import { UUID_RE, uniqueSlug } from "@/lib/blog";
import { parseBlogPostInput } from "@/lib/blogInput";
import { refreshPublicPages } from "@/lib/revalidate";

async function requireAdmin() {
    const session = await getServerSession(authOptions);
    return session ? null : NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

// Admin: one post with its full text (for the editor).
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const denied = await requireAdmin();
    if (denied) return denied;
    const { id } = await params;
    if (!UUID_RE.test(id)) return NextResponse.json({ error: "Post not found." }, { status: 404 });
    try {
        await dbConnect();
        const post = await BlogPost.findById(id).lean();
        if (!post) return NextResponse.json({ error: "Post not found." }, { status: 404 });
        return NextResponse.json(JSON.parse(JSON.stringify(post)));
    } catch (e) {
        console.error("Failed to load blog post", e);
        return NextResponse.json({ error: "Failed to load post" }, { status: 500 });
    }
}

// Admin: update a post. The web address (slug) follows the title.
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const denied = await requireAdmin();
    if (denied) return denied;
    const { id } = await params;
    if (!UUID_RE.test(id)) return NextResponse.json({ error: "Post not found." }, { status: 404 });
    try {
        await dbConnect();
        const input = await parseBlogPostInput(await req.json());
        if ("error" in input) return NextResponse.json({ error: input.error }, { status: 400 });
        const post = await BlogPost.findByIdAndUpdate(id, { ...input, slug: await uniqueSlug(input.title, id) }, { new: true });
        if (!post) return NextResponse.json({ error: "Post not found." }, { status: 404 });
        refreshPublicPages();
        return NextResponse.json(post);
    } catch (e) {
        console.error("Failed to update blog post", e);
        return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
    }
}

// Admin: delete a post.
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const denied = await requireAdmin();
    if (denied) return denied;
    const { id } = await params;
    if (!UUID_RE.test(id)) return NextResponse.json({ error: "Post not found." }, { status: 404 });
    try {
        await dbConnect();
        await BlogPost.findByIdAndDelete(id);
        refreshPublicPages();
        return NextResponse.json({ message: "Post deleted" });
    } catch (e) {
        console.error("Failed to delete blog post", e);
        return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
    }
}
