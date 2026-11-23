
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
import { PageSEO } from "@/lib/models";
import { getGalleryPhotos, getPartners, getPrograms, getSiteConfig, getTestimonials } from "@/lib/publicData";
import dbConnect from "@/lib/db";

async function buildMetadata(): Promise<Metadata> {
  try {
    await dbConnect();
    const [pageSeo, globalConfig] = await Promise.all([
      PageSEO.findOne({ pageKey: 'home' }).lean(),
      getSiteConfig(),
    ]);

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
  // Everything the page shows is loaded here, in parallel, so it arrives with the HTML.
  const [contact, programs, partners, photos, testimonials] = await Promise.all([
    getContactInfo(),
    getPrograms(),
    getPartners(),
    getGalleryPhotos(),
    getTestimonials(),
  ]);

  return (
    <main className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <Hero />
      <Stats numbers={contact} />

      {/* Featured Programs Section */}
      <div className="bg-primary-50 pb-16 lg:pb-24">
        <Programs limit={3} initialPrograms={programs} />
        <div className="-mt-4 text-center lg:-mt-8">
          <Link href="/programs" className="btn-primary">
            View All Programs <ArrowRight size={18} />
          </Link>
        </div>
      </div>

      {/* Featured Partners Section */}
      <div className="bg-white pb-16 lg:pb-24">
        <Partners limit={6} initialPartners={partners} />
        <div className="-mt-4 text-center lg:-mt-8">
          <Link href="/partners" className="btn-outline">
            View All Universities <ArrowRight size={18} />
          </Link>
        </div>
      </div>

      <Gallery initialPhotos={photos} />
      <Testimonials initialTestimonials={testimonials} />

      {/* Call to action */}
      <section className="bg-primary">
        <div className="container-page">
          <div className="relative py-20 text-center lg:py-24">
            <div className="relative">
              <h2 className="font-display text-4xl font-medium text-white sm:text-5xl lg:text-6xl">
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
                  className="inline-flex items-center justify-center rounded-md border border-white/50 px-7 py-3.5 text-base font-semibold text-white transition-colors hover:bg-white/10"
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
