import { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import { withPageUrl } from "@/lib/site";
import About from "@/components/About";
import { getContactInfo } from "@/lib/contactSettings";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { PageSEO, SiteConfig } from "@/lib/models";
import dbConnect from "@/lib/db";

async function buildMetadata(): Promise<Metadata> {
    try {
        await dbConnect();
        const pageSeo = await PageSEO.findOne({ pageKey: 'about' }).lean();
        const globalConfig = await SiteConfig.findOne({ key: 'global-seo' }).lean();

        const title = pageSeo?.title || "About Us";
        const description = pageSeo?.description || "Learn about Learnink Education Pvt Ltd - an all-in-one education platform offering degree programs, fast track courses, and career development.";
        const keywords = pageSeo?.keywords?.length ? pageSeo.keywords : ["about learnink", "education company", "degree programs"];
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
            title: "About Us",
            description: "Learn about Learnink Education Pvt Ltd",
        };
    }
}

export default async function AboutPage() {
    const { yearsCount } = await getContactInfo(); // Admin → Contact → Numbers

    return (
        <main className="flex min-h-screen flex-col bg-white">
            <Navbar />
            <PageHeader
                breadcrumbs={[{ label: "About" }]}
                eyebrow="About Us"
                title={<>Linking Learning, Skills <span className="italic text-primary">&amp; Careers</span></>}
                lead="Who we are, what we do and the vision behind Learnink Education."
            />
            <div className="w-full flex-1">
                <About yearsCount={yearsCount} />
            </div>
            <Footer />
        </main>
    );
}

// Each page gets its own canonical URL instead of inheriting the homepage's.
export async function generateMetadata(): Promise<Metadata> {
    return withPageUrl(await buildMetadata(), "/about");
}
