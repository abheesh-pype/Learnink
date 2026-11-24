import Navbar from "@/components/Navbar";
import PageHeader from "@/components/ui/PageHeader";
import { getPartners } from "@/lib/publicData";
import Partners from "@/components/Partners";
import Footer from "@/components/Footer";
import { Metadata } from "next";
import { withPageUrl } from "@/lib/site";
import { PageSEO, SiteConfig } from "@/lib/models";
import dbConnect from "@/lib/db";

async function buildMetadata(): Promise<Metadata> {
    try {
        await dbConnect();
        const pageSeo = await PageSEO.findOne({ pageKey: 'partners' }).lean();
        const globalConfig = await SiteConfig.findOne({ key: 'global-seo' }).lean();

        const title = pageSeo?.title || `Our University Partners | Learnink Education`;
        const description = pageSeo?.description || globalConfig?.description || "Explore our network of prestigious global university partners.";
        const keywords = pageSeo?.keywords?.length ? pageSeo.keywords : globalConfig?.keywords;
        const ogImage = pageSeo?.ogImage || globalConfig?.ogImage;

        return {
            title,
            description,
            keywords,
            openGraph: {
                title,
                description,
                images: ogImage ? [{ url: ogImage }] : undefined,
            },
        };
    } catch {
        return {
            title: "Our University Partners | Learnink Education",
        };
    }
}

export default async function PartnersPage() {
    const partners = await getPartners();

    return (
        <main className="flex min-h-screen flex-col bg-white">
            <Navbar />
            <PageHeader
                breadcrumbs={[{ label: "Universities" }]}
                eyebrow="Our Universities"
                title={<>University <span className="italic text-primary">Partners</span></>}
                lead="Trusted universities offering accredited programs through Learnink. Choose one to see its programs."
            />
            <section className="section w-full flex-1">
                <div className="container-page">
                    <Partners fullWidth initialPartners={partners} />
                </div>
            </section>
            <Footer />
        </main>
    );
}

// Each page gets its own canonical URL instead of inheriting the homepage's.
export async function generateMetadata(): Promise<Metadata> {
    return withPageUrl(await buildMetadata(), "/partners");
}
