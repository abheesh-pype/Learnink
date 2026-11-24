import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { BlogPost } from "@/lib/models";
import { uniqueSlug } from "@/lib/blog";
import { parseBlogPostInput } from "@/lib/blogInput";
import { refreshPublicPages } from "@/lib/revalidate";

// Admin: create a blog post.
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        await dbConnect();
        const input = await parseBlogPostInput(await req.json());
        if ("error" in input) return NextResponse.json({ error: input.error }, { status: 400 });

        const post = await BlogPost.create({ ...input, slug: await uniqueSlug(input.title) });
        refreshPublicPages();
        return NextResponse.json(post, { status: 201 });
    } catch (e) {
        console.error("Failed to create blog post", e);
        return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
    }
}
