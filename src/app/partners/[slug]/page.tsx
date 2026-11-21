import { Partner } from "@/lib/models";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, GraduationCap, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import dbConnect from "@/lib/db";

interface Props {
    params: Promise<{ slug: string }>;
}

interface ProgramItem {
    _id: string;
    title: string;
    description: string;
    category: string;
    slug: string;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    await dbConnect();
    const { slug } = await params;
    const partner = await Partner.findOne({ slug }).lean();

    if (!partner) return {};

    return {
        title: `${partner.name} | Learnink University Partner`,
        description: partner.description || `Learn about ${partner.name} and the programs they offer through Learnink Education.`,
        alternates: { canonical: `/partners/${slug}` },
    };
}

export default async function PartnerDetailPage({ params }: Props) {
    await dbConnect();
    const { slug } = await params;

    // Populate programs to show the list
    const partner = await Partner.findOne({ slug }).populate('programs').lean();

    if (!partner) notFound();

    return (
        <main className="min-h-screen pt-20 flex flex-col bg-white">
            <Navbar />

            {/* Page banner */}
            <header className="bg-primary-darker">
                <div className="container-page py-12 lg:py-16">
                    <Link href="/partners" className="inline-flex items-center gap-2 text-sm font-medium text-white/70 transition-colors hover:text-white">
                        <ArrowLeft size={18} /> Back to Partners
                    </Link>
                    <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-center">
                        <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-white p-3 shadow-lg">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={partner.logo} alt={partner.name} className="h-full w-full object-contain" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">{partner.name}</h1>
                            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/75">
                                <span className="inline-flex items-center gap-2">
                                    <CheckCircle2 size={16} className="text-primary-200" />
                                    Verified Partner
                                </span>
                                <span className="inline-flex items-center gap-2">
                                    <GraduationCap size={16} className="text-primary-200" />
                                    {partner.programs?.length || 0} Programs Offered
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex-1 bg-primary-50">
                <div className="container-page grid grid-cols-1 gap-8 py-12 lg:grid-cols-12 lg:py-16">
                    {/* Main Content: Description & Programs */}
                    <div className="space-y-8 lg:col-span-8">
                        {/* University Description */}
                        <section className="card p-6 sm:p-8">
                            <h2 className="text-xl font-bold text-ink">About the University</h2>
                            <div className="prose mt-4 max-w-none leading-relaxed text-slate-600">
                                {partner.description || "Information about this prestigious partner will be updated shortly."}
                            </div>
                        </section>

                        {/* Programs Offered */}
                        <section>
                            <h2 className="text-xl font-bold text-ink">
                                Available Programs at {partner.name}
                            </h2>

                            <div className="mt-5 grid grid-cols-1 gap-4">
                                {partner.programs?.length > 0 ? (
                                    partner.programs.map((program: ProgramItem) => (
                                        <div key={program._id} className="card card-hover group flex flex-col justify-between gap-5 p-6 md:flex-row md:items-center">
                                            <div className="flex-1">
                                                <span className="inline-block rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary">
                                                    {program.category}
                                                </span>
                                                <h3 className="mt-3 text-lg font-bold text-ink transition-colors group-hover:text-primary">{program.title}</h3>
                                                <p className="mt-1 text-sm text-slate-500 line-clamp-1">{program.description}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Link href={`/programs/${program.slug}`} className="btn-outline px-5 py-2.5">
                                                    Details
                                                </Link>
                                                <Link href="/contact" className="btn-primary px-5 py-2.5">
                                                    Enroll Now
                                                </Link>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="rounded-2xl border border-dashed border-primary-200 bg-white p-12 text-center text-slate-500">
                                        No programs currently listed.
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* Sidebar */}
                    <aside className="lg:col-span-4">
                        <div className="sticky top-28 rounded-2xl bg-primary p-6 text-white sm:p-8">
                            <p className="text-lg font-semibold">Want to study at {partner.name}?</p>
                            <p className="mt-2 text-sm text-white/80">Our counsellors will help you choose the right program.</p>
                            <div className="mt-6 space-y-3">
                                {partner.enrollLink && (
                                    <a
                                        href={partner.enrollLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn-light w-full"
                                    >
                                        Direct Enrollment <ExternalLink size={16} />
                                    </a>
                                )}
                                <Link
                                    href="/contact"
                                    className="inline-flex w-full items-center justify-center rounded-lg border border-white/30 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                                >
                                    Talk to a Counsellor
                                </Link>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
            <Footer />
        </main>
    );
}
