import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Testimonial } from "@/lib/models";
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
        await Testimonial.findByIdAndDelete(id);
        refreshPublicPages();
        return NextResponse.json({ message: "Testimonial deleted" });
    } catch {
        return NextResponse.json({ error: "Failed to delete testimonial" }, { status: 500 });
    }
}
