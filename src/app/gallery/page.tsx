import { Metadata } from "next";
import { withPageUrl } from "@/lib/site";
import GalleryPage from "@/components/GalleryPage";

// Gallery with every heading ("All" filter).
export default function Gallery() {
    return <GalleryPage sectionId={null} />;
}

export async function generateMetadata(): Promise<Metadata> {
    return withPageUrl(
        {
            title: "Gallery",
            description: "Photos and videos from Learnink's campus, events and celebrations.",
        },
        "/gallery"
    );
}
