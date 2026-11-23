import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { GalleryPhoto } from "@/lib/models";
import { getServerSession } from "next-auth";
import { refreshPublicPages } from "@/lib/revalidate";

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        await dbConnect();
        const { id } = await params;
        await GalleryPhoto.findByIdAndDelete(id);
        refreshPublicPages();
        return NextResponse.json({ message: "Photo deleted" });
    } catch {
        return NextResponse.json({ error: "Failed to delete photo" }, { status: 500 });
    }
}

// Admin: edit an item's caption.
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await req.json();
        const caption = typeof body.caption === "string" ? body.caption.trim().slice(0, 300) : "";
        await dbConnect();
        const { id } = await params;
        const item = await GalleryPhoto.findByIdAndUpdate(id, { caption }, { new: true });
        if (!item) return NextResponse.json({ error: "Item not found." }, { status: 404 });
        refreshPublicPages();
        return NextResponse.json(item);
    } catch {
        return NextResponse.json({ error: "Failed to update item" }, { status: 500 });
    }
}
