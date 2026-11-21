
import { Metadata } from "next";
import { withPageUrl } from "@/lib/site";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Stats from "@/components/Stats";
import { getContactInfo } from "@/lib/contactSettings";
import Programs from "@/components/Programs";
import Partners from "@/components/Partners";
import Gallery from "@/components/Gallery";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageSEO, SiteConfig } from "@/lib/models";
import dbConnect from "@/lib/db";

async function buildMetadata(): Promise<Metadata> {
  try {
    await dbConnect();
    const pageSeo = await PageSEO.findOne({ pageKey: 'home' }).lean();
    const globalConfig = await SiteConfig.findOne({ key: 'global-seo' }).lean();

    const title = pageSeo?.title || globalConfig?.title || "Learnink Education | Linking Learning, Skills & Careers";
    const description = pageSeo?.description || globalConfig?.description || "Learnink Education Pvt Ltd is an all-in-one education platform offering degree programs, fast track courses, and more.";
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
      title: "Learnink Education | Linking Learning, Skills & Careers",
      description: "Learnink Education Pvt Ltd is an all-in-one education platform offering degree programs, fast track courses, and more.",
    };
  }
}

export default async function Home() {
  // Stats numbers are edited in Admin → Contact → Numbers.
  const contact = await getContactInfo();

  return (
    <main className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <Hero />
      <Stats numbers={contact} />

      {/* Featured Programs Section */}
      <div className="bg-primary-50 pb-16 lg:pb-24">
        <Programs limit={3} />
        <div className="-mt-4 text-center lg:-mt-8">
          <Link href="/programs" className="btn-primary">
            View All Programs <ArrowRight size={18} />
          </Link>
        </div>
      </div>

      {/* Featured Partners Section */}
      <div className="bg-white pb-16 lg:pb-24">
        <Partners limit={6} />
        <div className="-mt-4 text-center lg:-mt-8">
          <Link href="/partners" className="btn-outline">
            View All Universities <ArrowRight size={18} />
          </Link>
        </div>
      </div>

      <Gallery />
      <Testimonials />

      {/* Call to action */}
      <section className="bg-white pb-16 lg:pb-24">
        <div className="container-page">
          <div className="bg-brand-gradient relative overflow-hidden rounded-[2rem] px-6 py-14 text-center shadow-2xl shadow-violet/30 sm:px-12 lg:py-20">
            <div className="glow-blob -left-16 -top-16 h-64 w-64 bg-glow/30" aria-hidden="true" />
            <div className="glow-blob -bottom-20 -right-10 h-72 w-72 bg-white/15 [animation-delay:-6s]" aria-hidden="true" />
            <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(rgba(255,255,255,0.6)_1px,transparent_1px)] [background-size:22px_22px]" aria-hidden="true" />
            <div className="relative">
              <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
                Ready to Start Your <span className="text-shimmer-light">Journey?</span>
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-white/80">
                Talk to our counsellors and find the right program for your career goals.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Link href="/contact" className="btn-light px-7 py-3.5 text-base">
                  Enquire Now <ArrowRight size={18} />
                </Link>
                <Link
                  href="/programs"
                  className="inline-flex items-center justify-center rounded-xl border-2 border-white/40 px-7 py-3.5 text-base font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/10"
                >
                  Browse Programs
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

// Each page gets its own canonical URL instead of inheriting the homepage's.
export async function generateMetadata(): Promise<Metadata> {
    return withPageUrl(await buildMetadata(), "/");
}
