import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GalleryBrowser from "@/components/GalleryBrowser";
import SectionHeader from "@/components/ui/SectionHeader";
import { getGallerySections } from "@/lib/publicData";

/**
 * Shared by /gallery (All) and /gallery/<sectionId> (that heading pre-selected).
 * Same structure as the Programs / Universities / Contact pages: light section, centred label + serif title + intro.
 */
export default async function GalleryPage({ sectionId }: { sectionId: string | null }) {
    const sections = await getGallerySections();

    return (
        <main className="flex min-h-screen flex-col bg-white pt-20">
            <Navbar />
            <div className="w-full flex-1">
                <section className="section overflow-hidden bg-primary-50">
                    <div className="container-page relative">
                        <SectionHeader
                            as="h1"
                            eyebrow="Visual Journey"
                            title={<>Our <span className="italic text-primary">Gallery</span></>}
                            lead="Photos and videos from our campus, events and celebrations. Choose a heading to see its collection."
                        />
                        <div className="mt-12 lg:mt-16">
                            <GalleryBrowser sections={sections} initialSectionId={sectionId} />
                        </div>
                    </div>
                </section>
            </div>
            <Footer />
        </main>
    );
}
